"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MerchantProvider, useMerchant } from "@/app/merchant/context/MerchantContext";
import { updateMerchantAction } from "@/lib/auth/merchant-actions";
import { callAction } from "@/lib/api/action-utils";
import Spinner from "../components/Spinner";
import type { MerchantOut } from "@/lib/types/merchant";
import type { WalletOut } from "@/lib/types/wallet";
import LowBalanceBanner from "./components/LowBalanceBanner";
import { resolveImageUrl } from "@/lib/api/image-utils";
import NotificationDropdown from "./components/NotificationDropdown";
import Script from "next/script";

function ToastRenderer() {
  const { toast, hideToast } = useMerchant();
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5">
      {toast.type === 'success' ? (
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      ) : (
        // WhatsApp-style icon for order notifications
        <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M5.339 21.337l-1.394-.446a.5.5 0 0 0-.61.233C2.543 22.476 1 22.005 1 20.5V5a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H5c-.223 0-.442-.02-.657-.058z" opacity="0"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
        </div>
      )}
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button onClick={hideToast} className="text-gray-400 hover:text-white">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );
}

function PageGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useMerchant();
  if (isLoading) {
    return <Spinner variant="page" label="Loading your workspace…" />;
  }
  return <>{children}</>;
}

interface Props {
  children: React.ReactNode;
  activeMerchantId: string;
  initialMerchant: MerchantOut;
  initialWallet: WalletOut;
}

export default function MerchantPanelLayoutClient({ children, activeMerchantId, initialMerchant, initialWallet }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [consumerSupportOpen, setConsumerSupportOpen] = useState(false);

  const walletBalance = Number(initialWallet.balance);
  const walletLow = walletBalance < initialWallet.low_balance_threshold;
  const currencySymbol = initialWallet.currency === "INR" ? "₹" : initialWallet.currency + " ";
  const merchantInitials = initialMerchant.display_name.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.hasAttribute("contenteditable"))
      ) {
        return;
      }
      if (e.key === "p" || e.key === "P" || (e.altKey && (e.key === "p" || e.key === "P"))) {
        e.preventDefault();
        router.push("/merchant/products/add");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Configure Zendesk to hide the default launcher button
    (window as any).zESettings = {
      webWidget: {
        launcher: {
          show: false
        }
      },
      messenger: {
        launcher: {
          show: false
        }
      }
    };

    const handleZendeskEvents = () => {
      const zE = (window as any).zE;
      if (!zE) return;

      try {
        zE('webWidget:on', 'open', () => setConsumerSupportOpen(true));
        zE('webWidget:on', 'close', () => setConsumerSupportOpen(false));
      } catch (e) {}

      try {
        zE('messenger:on', 'open', () => setConsumerSupportOpen(true));
        zE('messenger:on', 'close', () => setConsumerSupportOpen(false));
      } catch (e) {}
    };

    if ((window as any).zE) {
      handleZendeskEvents();
    } else {
      const interval = setInterval(() => {
        if ((window as any).zE) {
          handleZendeskEvents();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  const iconSize = "w-5 h-5"; // 20px icons

  // Icon components
  const icons: Record<string, React.ReactNode> = {
    Dashboard: (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    Products: (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    Analytics: (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    Billing: (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    Orders: (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    CRM: (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    "Buyer Intel": (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
        <line x1="12" y1="2" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="6" y2="12"/>
        <line x1="18" y1="12" x2="22" y2="12"/>
      </svg>
    ),
    "My Customers": (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        <line x1="19" y1="8" x2="21" y2="10"/>
        <line x1="21" y1="8" x2="19" y2="10"/>
      </svg>
    ),
    Settings: (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    Support: (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    "My Shops": (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
        <line x1="12" y1="2" x2="12" y2="5"/>
        <circle cx="19" cy="8" r="3"/>
        <line x1="19" y1="6" x2="19" y2="10"/>
        <line x1="17" y1="8" x2="21" y2="8"/>
      </svg>
    ),
    "Switch Shop": (
      <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <circle cx="12" cy="10" r="3"/>
        <path d="M7 17c0-3 3-3 5-3s5 0 5 3"/>
      </svg>
    ),
  };

  const mainNav = [
    { name: "Dashboard", href: "/merchant/dashboard" },
    { name: "Products", href: "/merchant/products" },
    { name: "Analytics", href: "/merchant/analytics", badge: "Beta" },
    { name: "Orders", href: "/merchant/orders" },
    { name: "My Shops", href: "/merchant/shops" },
  ];

  const commerceNav = [
    { name: "Billing", href: "/merchant/billing" },
    { name: "Buyer Intel", href: "/merchant/buyer-intelligence", badge: "New" },
    { name: "My Customers", href: "/merchant/buyer-network", badge: "New" },
  ];

  const renderNavItem = (item: { name: string; href: string; badge?: string }) => {
    const isActive = pathname?.startsWith(item.href);
    return (
      <Link
        key={item.name}
        href={item.href}
        title={collapsed ? item.name : undefined}
        className={`relative flex items-center rounded-xl transition-all group ${
          collapsed
            ? `justify-center px-0 py-3.5 ${isActive ? "bg-[#111827] text-white shadow-sm" : "text-gray-400 hover:bg-[#F5F5F7] hover:text-[#111827]"}`
            : `gap-3.5 px-3.5 py-3.5 ${isActive ? "bg-[#111827] text-white font-medium shadow-sm" : "text-gray-500 hover:bg-[#F5F5F7] hover:text-[#111827] font-normal"}`
        } text-[13px]`}
      >
        <span className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#111827]'}`}>
          {icons[item.name]}
        </span>
        {!collapsed && (
          <>
            <span className="truncate">{item.name}</span>
            {item.badge === "New" && <span className="ml-auto text-[9px] font-bold bg-[#0E9F88] text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">New</span>}
            {item.badge === "Beta" && <span className="ml-auto text-[9px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">Beta</span>}
          </>
        )}
        {/* Tooltip on collapsed hover */}
        {collapsed && (
          <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#111827] text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
            {item.name}
          </span>
        )}
      </Link>
    );
  };

  // Logo component
  const Logo = ({ size = "default" }: { size?: "default" | "small" }) => (
    <Link href="/merchant/dashboard" className="flex items-center gap-2.5">
      <img src="/simulafly-logo.png" alt="SimulaFly" className={`${size === "small" ? "w-7 h-7" : "w-9 h-9"} rounded-xl shadow-sm shrink-0 object-cover`} />
      {!collapsed && size !== "small" && (
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-[16px] tracking-tight text-[#111827]">SimulaFly</span>
          <span className="text-[11px] font-medium text-[#0E9F88]">Merchant</span>
        </div>
      )}
    </Link>
  );

  const ReferralCodeBox = () => {
    const [copied, setCopied] = useState(false);
    const code = initialMerchant.referral_code;
    const handleCopy = () => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div
        onClick={handleCopy}
        className="mt-2 p-1.5 bg-gray-50 border border-gray-200 rounded text-center cursor-pointer hover:bg-gray-100 transition-colors relative"
        title="Click to copy"
      >
        <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest mb-0.5">Referral Code</p>
        <p className="text-[11px] font-bold text-[#0B7A69] font-mono tracking-wider">
          {copied ? "COPIED!" : code}
        </p>
        {copied && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in slide-in-from-bottom-2">
            Copied to clipboard!
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <MerchantProvider activeMerchantId={activeMerchantId} initialMerchant={initialMerchant} initialWallet={initialWallet}>
      <div 
        className="min-h-screen bg-[#EDEEF0] flex font-sans"
        style={{ "--sidebar-width": collapsed ? "72px" : "264px" } as React.CSSProperties}
      >
        {/* ─── Sidebar ─── */}
        <aside className={`${collapsed ? 'w-[72px]' : 'w-[264px]'} bg-white border-r border-[#E2E4E8] flex-col hidden md:flex sticky top-0 h-screen shrink-0 transition-all duration-300 ease-in-out`}>

          {/* Logo */}
          <div className={`h-[72px] flex items-center border-b border-[#F1F3F5] shrink-0 ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
            <Logo />
          </div>



          {/* Hamburger toggle — between logo and nav */}
          <div className={`shrink-0 flex ${collapsed ? 'justify-center py-4' : 'px-4 pt-5 pb-1'}`}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`flex items-center gap-3 rounded-xl transition-all group ${
                collapsed
                  ? 'w-10 h-10 justify-center bg-[#F5F5F7] hover:bg-[#EAECEF] text-gray-500 hover:text-[#111827]'
                  : 'w-full px-3.5 py-3 bg-[#F5F5F7] hover:bg-[#EAECEF] text-gray-500 hover:text-[#111827]'
              }`}
              title={collapsed ? 'Expand menu' : 'Collapse menu'}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
                <line x1="4" y1="18" x2="20" y2="18"/>
              </svg>
              {!collapsed && <span className="text-[12px] font-medium">Menu</span>}
            </button>
          </div>

          {/* Nav scroll area */}
          <div className={`${collapsed ? 'px-2' : 'px-4'} pt-3 pb-4 flex-1 overflow-y-auto overflow-x-hidden`}>
            <nav className="space-y-1">
              {mainNav.map(renderNavItem)}
            </nav>

            {/* Divider */}
            <div className={`my-6 h-px bg-[#F1F3F5] ${collapsed ? 'mx-1' : 'mx-3.5'}`} />

            {/* Section: Commerce */}
            {!collapsed && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-3.5">Commerce</p>}
            <nav className="space-y-1">
              {commerceNav.map(renderNavItem)}
            </nav>

            {/* Divider */}
            <div className={`my-6 h-px bg-[#F1F3F5] ${collapsed ? 'mx-1' : 'mx-3.5'}`} />

            {/* Section: System */}
            {!collapsed && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-3.5">System</p>}
            <nav className="space-y-1">
              {renderNavItem({ name: "Switch Shop", href: "/merchant/select_shop" })}
              {renderNavItem({ name: "Settings", href: "/merchant/settings" })}
              {renderNavItem({ name: "Support", href: "/merchant/support" })}
            </nav>
          </div>

          {/* ─── Bottom: Account ─── */}
          <div className="border-t border-[#F1F3F5] shrink-0">
            {collapsed ? (
              <div className="flex justify-center py-4">
                <div className="relative">
                  <button
                    onClick={() => { const d = document.getElementById('sidebar-profile-dropdown'); d?.classList.toggle('hidden'); }}
                    className="w-10 h-10 rounded-full bg-[#F5F5F7] border border-[#EAECEF] flex items-center justify-center text-[#111827] font-bold text-[11px] hover:bg-gray-200 transition-colors"
                    title={initialMerchant.display_name}
                  >
                    {merchantInitials}
                  </button>
                  <div id="sidebar-profile-dropdown" className="hidden absolute left-full bottom-0 ml-2 w-52 bg-white border border-[#EAECEF] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-1 z-50">
                    <div className="px-4 py-3 border-b border-[#F1F3F5] mb-1">
                      <p className="text-[12px] font-semibold text-[#111827]">{initialMerchant.display_name}</p>
                      {initialMerchant.support_email && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{initialMerchant.support_email}</p>
                      )}
                      <ReferralCodeBox />
                    </div>
                    <Link href="/merchant/settings" className="block px-4 py-2.5 text-[12px] text-gray-500 hover:bg-[#F5F5F7] hover:text-[#111827] transition-colors">Settings</Link>
                    <Link href="/merchant/onboarding" className="block px-4 py-2.5 text-[12px] text-gray-500 hover:bg-[#F5F5F7] hover:text-[#111827] transition-colors">Store Setup</Link>
                    <div className="border-t border-[#F1F3F5] mt-1 pt-1">
                      <Link href="/api/auth/logout" className="block px-4 py-2.5 text-[12px] text-red-500 hover:bg-red-50 transition-colors">Sign Out</Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Expanded: account card */
              <div className="p-4">
                <div className="relative">
                  <button
                    onClick={() => { const d = document.getElementById('sidebar-profile-dropdown-exp'); d?.classList.toggle('hidden'); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F5F7] transition-colors group"
                  >
                    {initialMerchant.logo_url ? (
                      <img src={resolveImageUrl(initialMerchant.logo_url)} alt={initialMerchant.display_name} className="w-9 h-9 rounded-full border border-[#EAECEF] object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#F5F5F7] border border-[#EAECEF] flex items-center justify-center text-[#111827] font-bold text-[11px] shrink-0 group-hover:bg-gray-200 transition-colors">
                        {merchantInitials}
                      </div>
                    )}
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#111827] truncate">{initialMerchant.display_name}</p>
                      {initialMerchant.support_email && (
                        <p className="text-[10px] text-gray-400 truncate">{initialMerchant.support_email}</p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div id="sidebar-profile-dropdown-exp" className="hidden absolute left-0 bottom-full mb-2 w-full bg-white border border-[#EAECEF] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-1 z-50">
                    <div className="px-4 py-3 border-b border-[#F1F3F5] mb-1">
                      <p className="text-[12px] font-semibold text-[#111827]">{initialMerchant.display_name}</p>
                      {initialMerchant.support_email && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{initialMerchant.support_email}</p>
                      )}
                      <ReferralCodeBox />
                    </div>
                    <Link href="/merchant/settings" className="block px-4 py-2.5 text-[12px] text-gray-500 hover:bg-[#F5F5F7] hover:text-[#111827] transition-colors">Settings</Link>
                    <Link href="/merchant/onboarding" className="block px-4 py-2.5 text-[12px] text-gray-500 hover:bg-[#F5F5F7] hover:text-[#111827] transition-colors">Store Setup</Link>
                    <div className="border-t border-[#F1F3F5] mt-1 pt-1">
                      <Link href="/api/auth/logout" className="block px-4 py-2.5 text-[12px] text-red-500 hover:bg-red-50 transition-colors">Sign Out</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ─── Main Content Area ─── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header Bar */}
          <header className="h-[64px] bg-white border-b border-[#E2E4E8] flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
            {/* Logo in header (visible always — acts as breadcrumb anchor) */}
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <Logo size="small" />
              </div>
              {/* Page context indicator (desktop) */}
              <div className="hidden md:flex items-center gap-2 text-[12px] text-gray-400 font-normal">
                <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>Search products, analytics, settings…</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Active Shop identity badge */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#0E9F88]/10 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#0E9F88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Active Shop</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {initialMerchant.shop_id && (
                    <span className="text-[9px] font-bold text-[#0E9F88] bg-[#0E9F88]/10 px-1.5 py-0.5 rounded font-mono">{initialMerchant.shop_id}</span>
                  )}
                </div>
                <Link href="/merchant/shops" title="Manage shops" className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#111827] transition-colors shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </Link>
              </div>

              {/* Notification bell */}
              <NotificationDropdown />

              {/* Support button */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !consumerSupportOpen;
                  if (typeof window !== "undefined" && (window as any).zE) {
                    try {
                      const zE = (window as any).zE;
                      if (nextState) {
                        zE('messenger', 'open');
                        zE('webWidget', 'open');
                      } else {
                        zE('messenger', 'close');
                        zE('webWidget', 'close');
                      }
                    } catch (err) {
                      console.warn("Zendesk action error:", err);
                    }
                  }
                  setConsumerSupportOpen(nextState);
                }}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all shadow-sm shrink-0 ${
                  consumerSupportOpen
                    ? "bg-[#0E9F88] border-[#0E9F88] text-white hover:bg-[#0c8a76]"
                    : "bg-[#F5F5F7] border-[#EAECEF] text-gray-500 hover:text-[#0E9F88] hover:bg-white"
                }`}
                title="Consumer Support Chat"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </button>

              {/* Balance widget — top right (real wallet data) */}
              <Link href="/merchant/billing" className="flex items-center gap-2.5 pl-3 border-l border-[#F1F3F5] group">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-gray-400 font-medium">Wallet Balance</p>
                  <p className={`text-[14px] font-bold tabular-nums tracking-tight ${walletLow ? 'text-amber-600' : 'text-[#111827]'}`}>
                    {currencySymbol}{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${walletLow ? 'bg-amber-50 border-amber-200 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' : 'bg-[#F5F5F7] border-[#EAECEF] text-[#0E9F88] group-hover:bg-[#0E9F88] group-hover:text-white'}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <LowBalanceBanner />
            <PageGate>{children}</PageGate>
          </main>
        </div>
        <ToastRenderer />
        <Script
          id="ze-snippet"
          src="https://static.zdassets.com/ekr/snippet.js?key=b3746f37-7caa-49f9-883b-1a9bbf81201a"
          strategy="afterInteractive"
        />
      </div>
    </MerchantProvider>
  );
}
