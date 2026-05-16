"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MerchantProvider, useMerchant } from "../context/MerchantContext";

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

export default function MerchantPanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/merchant/dashboard", icon: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", icon2: "polyline points='9 22 9 12 15 12 15 22'" },
    { name: "Products", href: "/merchant/products", icon: "rect x='3' y='3' width='18' height='18' rx='2' ry='2'", icon2: "line x1='3' y1='9' x2='21' y2='9' / line x1='9' y1='21' x2='9' y2='9'" },
    { name: "Analytics", href: "/merchant/analytics", icon: "line x1='18' y1='20' x2='18' y2='10'", icon2: "line x1='12' y1='20' x2='12' y2='4' / line x1='6' y1='20' x2='6' y2='14'" },
    { name: "Billing & Tokens", href: "/merchant/billing", icon: "path d='M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4'", icon2: "path d='M4 6v12c0 1.1.9 2 2 2h14v-4' / path d='M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z'" },
    { name: "Orders", href: "/merchant/orders", icon: "path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'", icon2: "line x1='3' y1='6' x2='21' y2='6' / path d='M16 10a4 4 0 0 1-8 0'" },
    { name: "CRM", href: "/merchant/crm", icon: "path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'", icon2: "circle cx='9' cy='7' r='4' / path d='M23 21v-2a4 4 0 0 0-3-3.87' / path d='M16 3.13a4 4 0 0 1 0 7.75'" },
    { name: "Settings", href: "/merchant/settings", icon: "circle cx='12' cy='12' r='3'", icon2: "path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'" },
  ];

  const mockWallet = { balance: 2400.00, currencySymbol: "₹", threshold: 500 };

  return (
    <MerchantProvider>
      <div className="min-h-screen bg-[#F8FAFB] flex font-sans">
        {/* Sidebar (Left Rail) */}
        <aside className="w-[240px] bg-white border-r border-gray-100 flex-col hidden md:flex sticky top-0 h-screen shrink-0 pb-32">
          <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
            <Link href="/merchant/dashboard" className="font-display font-bold text-xl tracking-tight text-neutral-dark flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-md flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-90" />
              </div>
              SimulaFly <span className="text-[#1FAF9A] text-sm font-medium">Merchant</span>
            </Link>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Menu</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const isNew = item.name === "CRM";
                const isBeta = item.name === "Analytics";
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group ${
                      isActive 
                        ? "bg-[#1FAF9A]/5 text-[#1FAF9A] font-bold border-l-4 border-[#1FAF9A]" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-neutral-dark border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className={`w-4 h-4 transition-colors ${isActive ? 'text-[#1FAF9A]' : 'text-gray-400 group-hover:text-gray-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                        {item.icon2 && <path d={item.icon2} />}
                      </svg>
                      {item.name}
                    </div>
                    {isNew && <span className="text-[9px] font-bold bg-[#1FAF9A] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">New</span>}
                    {isBeta && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Beta</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Pinned Wallet Widget */}
          <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Token Balance</p>
                {mockWallet.balance < mockWallet.threshold && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </div>
              
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-sm font-bold text-gray-400">{mockWallet.currencySymbol}</span>
                <span className={`text-xl font-bold tabular-nums tracking-tight ${mockWallet.balance < mockWallet.threshold ? 'text-red-500' : 'text-neutral-dark'}`}>
                  {mockWallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-4 flex">
                <div className="bg-[#1FAF9A] h-1.5 rounded-l-full border-r border-white/20" style={{ width: '40%' }}></div>
                <div className="bg-[#1FAF9A]/60 h-1.5 border-r border-white/20" style={{ width: '20%' }}></div>
                <div className="bg-[#1FAF9A]/30 h-1.5 rounded-r-full" style={{ width: '10%' }}></div>
              </div>
              
              <Link 
                href="/merchant/billing"
                className="w-full py-2 bg-[#F8FAFB] border border-gray-200 text-neutral-dark text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm gap-2"
              >
                <svg className="w-3 h-3 text-[#1FAF9A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Funds
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header Bar */}
          <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <span className="md:hidden font-display font-bold text-lg text-neutral-dark">SimulaFly Merchant</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Low Balance Alert Badge */}
              {mockWallet.balance < mockWallet.threshold && (
                <Link href="/merchant/billing" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full hover:bg-amber-100 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Low Balance
                </Link>
              )}

              {/* Account Details & Merchant Shop Name */}
              <div className="relative">
                <div 
                  className="flex items-center gap-4 cursor-pointer group"
                  onClick={() => {
                    const dropdown = document.getElementById('profile-dropdown');
                    dropdown?.classList.toggle('hidden');
                  }}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-neutral-dark group-hover:text-[#1FAF9A] transition-colors">Acme Furniture Co.</p>
                    <p className="text-[11px] text-gray-500">Sarah Jenkins</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#1FAF9A]/10 border border-[#1FAF9A]/20 flex items-center justify-center text-[#1FAF9A] font-bold text-xs group-hover:bg-[#1FAF9A]/20 transition-colors">
                    AC
                  </div>
                </div>

                {/* Dropdown Menu */}
                <div id="profile-dropdown" className="hidden absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs font-bold text-neutral-dark">Sarah Jenkins</p>
                    <p className="text-[10px] text-gray-500">sarah@acmefurniture.co</p>
                  </div>
                  <Link href="/merchant/settings" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-neutral-dark transition-colors">
                    Settings
                  </Link>
                  <Link href="/merchant/onboarding" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-neutral-dark transition-colors">
                    Store Setup
                  </Link>
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <Link href="/merchant/sign_in" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Sign Out
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <ToastRenderer />
      </div>
    </MerchantProvider>
  );
}
