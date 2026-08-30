"use client";

import { useState, useRef, useMemo } from "react";

// ─── Reason Categories ────────────────────────────────────────────────────────
const REASON_CATEGORIES = [
  {
    name: "Account & Verification", slug: "account_verification",
    children: [
      { name: "Merchant Registration", slug: "merchant_registration" },
      { name: "Business Verification", slug: "business_verification" },
      { name: "GST Verification", slug: "gst_verification" },
      { name: "PAN Verification", slug: "pan_verification" },
      { name: "Bank Account Verification", slug: "bank_account_verification" },
      { name: "Identity Verification", slug: "identity_verification" },
      { name: "Store Approval", slug: "store_approval" },
      { name: "Store Suspension", slug: "store_suspension" },
      { name: "Store Reactivation", slug: "store_reactivation" },
      { name: "Profile Update", slug: "profile_update" },
      { name: "Login & Authentication", slug: "login_authentication" },
      { name: "Two-Factor Authentication (2FA)", slug: "two_factor_authentication" },
      { name: "Other", slug: "other" },
    ],
  },
  {
    name: "Wallet & Payments", slug: "wallet_payments",
    children: [
      { name: "Wallet Recharge", slug: "wallet_recharge" },
      { name: "Payment Failed", slug: "payment_failed" },
      { name: "Recharge Successful but Balance Not Updated", slug: "balance_not_updated" },
      { name: "Refund Request", slug: "refund_request" },
      { name: "Incorrect Wallet Deduction", slug: "incorrect_wallet_deduction" },
      { name: "Invoice & GST Invoice", slug: "invoice_gst" },
      { name: "Settlement Issue", slug: "settlement_issue" },
      { name: "Transaction History", slug: "transaction_history" },
      { name: "Payment Gateway Issue", slug: "payment_gateway_issue" },
      { name: "Other", slug: "other" },
    ],
  },
  {
    name: "Orders & Leads", slug: "orders_leads",
    children: [
      { name: "New Order Issue", slug: "new_order_issue" },
      { name: "Order Status", slug: "order_status" },
      { name: "Customer Contact Unavailable", slug: "customer_contact_unavailable" },
      { name: "Lead Unlock Issue", slug: "lead_unlock_issue" },
      { name: "Commission Dispute", slug: "commission_dispute" },
      { name: "Cancelled Order", slug: "cancelled_order" },
      { name: "Completed Order Issue", slug: "completed_order_issue" },
      { name: "Buyer Communication", slug: "buyer_communication" },
      { name: "Other", slug: "other" },
    ],
  },
  {
    name: "Product Catalog", slug: "product_catalog",
    children: [
      { name: "Add New Product", slug: "add_product" },
      { name: "Edit Product", slug: "edit_product" },
      { name: "Product Approval Pending", slug: "product_approval_pending" },
      { name: "Product Rejected", slug: "product_rejected" },
      { name: "Image Upload Issue", slug: "image_upload_issue" },
      { name: "AI Visualization Issue", slug: "ai_visualization_issue" },
      { name: "Product Dimensions", slug: "product_dimensions" },
      { name: "Inventory Update", slug: "inventory_update" },
      { name: "External Purchase Links", slug: "external_purchase_links" },
      { name: "Product Visibility", slug: "product_visibility" },
      { name: "Bulk Upload", slug: "bulk_upload" },
      { name: "Other", slug: "other" },
    ],
  },
  {
    name: "Referrals & Rewards", slug: "referrals_rewards",
    children: [
      { name: "Referral Commission", slug: "referral_commission" },
      { name: "Referral Not Tracked", slug: "referral_not_tracked" },
      { name: "Invite Code Issue", slug: "invite_code_issue" },
      { name: "Reward Not Credited", slug: "reward_not_credited" },
      { name: "Campaign Eligibility", slug: "campaign_eligibility" },
      { name: "Incentive Dispute", slug: "incentive_dispute" },
      { name: "Other", slug: "other" },
    ],
  },
  {
    name: "Buyer Intelligence", slug: "buyer_intelligence",
    children: [
      { name: "Buyer Unlock Failed", slug: "buyer_unlock_failed" },
      { name: "Buyer Information Mismatch", slug: "buyer_information_mismatch" },
      { name: "Match Score Query", slug: "match_score_query" },
      { name: "Buyer Network (CRM)", slug: "buyer_network_crm" },
      { name: "Interaction History", slug: "interaction_history" },
      { name: "AI Recommendations", slug: "ai_recommendations" },
      { name: "Privacy Concern", slug: "privacy_concern" },
      { name: "Other", slug: "other" },
    ],
  },
  {
    name: "Analytics", slug: "analytics",
    children: [
      { name: "Dashboard Metrics", slug: "dashboard_metrics" },
      { name: "Clicks & Impressions", slug: "clicks_impressions" },
      { name: "AI Mentions", slug: "ai_mentions" },
      { name: "Wallet Spend Analytics", slug: "wallet_spend_analytics" },
      { name: "Conversion Analytics", slug: "conversion_analytics" },
      { name: "Report Export", slug: "report_export" },
      { name: "Data Discrepancy", slug: "data_discrepancy" },
      { name: "Other", slug: "other" },
    ],
  },
  {
    name: "Technical Issue", slug: "technical_issue",
    children: [
      { name: "Website Not Loading", slug: "website_not_loading" },
      { name: "App Crash", slug: "app_crash" },
      { name: "Slow Performance", slug: "slow_performance" },
      { name: "Login Issue", slug: "login_issue" },
      { name: "Upload Error", slug: "upload_error" },
      { name: "API / Integration Issue", slug: "api_integration_issue" },
      { name: "Browser Compatibility", slug: "browser_compatibility" },
      { name: "Mobile Issue", slug: "mobile_issue" },
      { name: "Other", slug: "other" },
    ],
  },
  {
    name: "Feature Request", slug: "feature_request",
    children: [
      { name: "New Feature Suggestion", slug: "new_feature_suggestion" },
      { name: "Workflow Improvement", slug: "workflow_improvement" },
      { name: "UI/UX Suggestion", slug: "ui_ux_suggestion" },
      { name: "Integration Request", slug: "integration_request" },
      { name: "Automation Request", slug: "automation_request" },
      { name: "Other", slug: "other" },
    ],
  },
  {
    name: "Report a Bug", slug: "report_bug",
    children: [
      { name: "Visual/UI Bug", slug: "visual_ui_bug" },
      { name: "Functional Bug", slug: "functional_bug" },
      { name: "Billing Bug", slug: "billing_bug" },
      { name: "Catalog Bug", slug: "catalog_bug" },
      { name: "Order Bug", slug: "order_bug" },
      { name: "AI Bug", slug: "ai_bug" },
      { name: "Security Issue", slug: "security_issue" },
      { name: "Other", slug: "other" },
    ],
  },
  {
    name: "Other", slug: "other",
    children: [
      { name: "General Inquiry", slug: "general_inquiry" },
      { name: "Partnership", slug: "partnership" },
      { name: "Compliance", slug: "compliance" },
      { name: "Legal", slug: "legal" },
      { name: "Feedback", slug: "feedback" },
      { name: "Other", slug: "other" },
    ],
  },
];

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_DATA = [
  { q: "How do I recharge my wallet?", a: "Go to Billing → Wallet, click 'Add Funds', choose a payment method, and complete the transaction. Balance updates within seconds." },
  { q: "How long does product approval take?", a: "Products are reviewed within 24–48 business hours. You'll receive an email notification once approved or if changes are required." },
  { q: "Why was my product rejected?", a: "Common reasons include low-quality images, incomplete specifications, or policy violations. Check the rejection note in your product catalog for details." },
  { q: "How do I unlock a buyer lead?", a: "Navigate to Buyer Intelligence, find the lead, and click 'Unlock'. Credits are deducted from your wallet automatically." },
  { q: "When will I receive my referral commission?", a: "Referral commissions are credited within 7 business days after your referred merchant completes their first successful transaction." },
  { q: "How do I update my GST or PAN details?", a: "Go to Settings → Business Information. Upload the corrected document; our team will re-verify within 48 hours." },
  { q: "My wallet balance was deducted incorrectly. What should I do?", a: "File a ticket under Wallet & Payments → Incorrect Wallet Deduction. Attach a screenshot of your transaction history for faster resolution." },
  { q: "How do I contact support for urgent issues?", a: "For urgent issues, use this form and select 'Technical Issue' as the reason. Our team responds to critical issues within 2 hours on business days." },
];

function getCategoryIcon(slug: string) {
  const icons: Record<string, React.ReactNode> = {
    account_verification: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    wallet_payments: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    orders_leads: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>,
    product_catalog: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    referrals_rewards: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    buyer_intelligence: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    analytics: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    technical_issue: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    feature_request: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    report_bug: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    other: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  };
  return icons[slug] ?? icons.other;
}

// ─── Product type ─────────────────────────────────────────────────────────────
interface ProductOption {
  id: string;
  title: string;
  sku: string;
}

// ─── Order type ───────────────────────────────────────────────────────────────
export interface OrderOption {
  id: string;
  displayId: string;
  customerName: string;
  total: number;
  date: string;
}

// ─── Submitted ticket ─────────────────────────────────────────────────────────
interface SubmittedTicket {
  ticketId: string;
  reason: string;
  subReason: string;
  productTitle: string | null;
  orderTitle: string | null;
  createdAt: string;
}

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-[#E8EAED] rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left hover:bg-[#F8F9FB] transition-colors group">
        <span className="text-[13px] font-medium text-[#111827] leading-snug">{q}</span>
        <span className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-[#0E9F88] text-white rotate-45" : "bg-[#F1F3F5] text-gray-500 group-hover:bg-[#E2E8F0]"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3 h-3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 text-[12.5px] text-gray-500 leading-relaxed border-t border-[#F1F3F5] bg-[#FAFBFC]">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Product Combobox ─────────────────────────────────────────────────────────
function ProductCombobox({
  products,
  value,
  onChange,
}: {
  products: ProductOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return products.slice(0, 50);
    const q = query.toLowerCase();
    return products.filter(
      (p) => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [query, products]);

  const selected = products.find((p) => p.id === value);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger / search input */}
      <div
        className={`w-full flex items-center bg-[#F8F9FB] border rounded-xl px-4 py-3 gap-2 transition-all ${open ? "border-[#0E9F88] ring-2 ring-[#0E9F88]/20" : "border-[#E2E4E8]"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-gray-400">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
        <input
          id="support-product"
          type="text"
          value={open ? query : (selected ? `${selected.title} — ${selected.sku}` : "")}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setQuery(""); setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search products by name or SKU…"
          className="flex-1 bg-transparent text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none min-w-0"
        />
        {value && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onChange(""); setQuery(""); }}
            className="shrink-0 text-gray-400 hover:text-red-400 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
        {!value && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-gray-300">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-[#E2E4E8] rounded-xl shadow-xl overflow-hidden">
          {/* None option */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onChange(""); setQuery(""); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-[#F5F5F7] transition-colors border-b border-[#F1F3F5]"
          >
            <span className="text-[12px] text-gray-400 italic">No product (general issue)</span>
          </button>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-[12px] text-gray-400 text-center">No products match your search</p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); onChange(p.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F0FDF9] transition-colors ${value === p.id ? "bg-[#F0FDF9]" : ""}`}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12.5px] font-medium text-[#111827] truncate">{p.title}</span>
                    <span className="block text-[10.5px] text-gray-400 font-mono">{p.sku}</span>
                  </span>
                  {value === p.id && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5 text-[#0E9F88] shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Order Combobox ───────────────────────────────────────────────────────────
function OrderCombobox({
  orders,
  value,
  onChange,
}: {
  orders: OrderOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return orders.slice(0, 50);
    const q = query.toLowerCase();
    return orders.filter(
      (o) =>
        o.displayId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [query, orders]);

  const selected = orders.find((o) => o.id === value);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger / search input */}
      <div
        className={`w-full flex items-center bg-[#F8F9FB] border rounded-xl px-4 py-3 gap-2 transition-all ${open ? "border-[#0E9F88] ring-2 ring-[#0E9F88]/20" : "border-[#E2E4E8]"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-gray-400">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
        <input
          id="support-order"
          type="text"
          value={open ? query : (selected ? `${selected.displayId} — ${selected.customerName} (${selected.date})` : "")}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setQuery(""); setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search orders by ID or customer name…"
          className="flex-1 bg-transparent text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none min-w-0"
        />
        {value && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onChange(""); setQuery(""); }}
            className="shrink-0 text-gray-400 hover:text-red-400 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
        {!value && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-gray-300">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-[#E2E4E8] rounded-xl shadow-xl overflow-hidden">
          {/* None option */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onChange(""); setQuery(""); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-[#F5F5F7] transition-colors border-b border-[#F1F3F5]"
          >
            <span className="text-[12px] text-gray-400 italic">No order</span>
          </button>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-[12px] text-gray-400 text-center">No orders match your search</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); onChange(o.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F0FDF9] transition-colors ${value === o.id ? "bg-[#F0FDF9]" : ""}`}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12.5px] font-medium text-[#111827] truncate">
                      {o.displayId} — {o.customerName}
                    </span>
                    <span className="block text-[10.5px] text-gray-400 font-mono">
                      ₹{o.total.toLocaleString("en-IN")} • {o.date}
                    </span>
                  </span>
                  {value === o.id && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5 text-[#0E9F88] shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  products: ProductOption[];
  orders: OrderOption[];
  initialReason?: string;
  initialOrderId?: string;
  initialProductId?: string;
}

export default function SupportClient({
  products,
  orders,
  initialReason = "",
  initialOrderId = "",
  initialProductId = "",
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [reason, setReason] = useState(initialReason);
  const [subReason, setSubReason] = useState("");
  const [productId, setProductId] = useState(initialProductId);
  const [orderId, setOrderId] = useState(initialOrderId);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedTicket | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleReasonChange = (nextReason: string) => {
    setReason(nextReason);
    setSubReason("");
    if (nextReason === "orders_leads") {
      setProductId("");
    } else {
      setOrderId("");
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@simulafly.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedCategory = REASON_CATEGORIES.find((c) => c.slug === reason);
  const subReasons = selectedCategory?.children ?? [];

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !subReason || !description.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let finalDescription = description.trim();
      if (orderId && reason === "orders_leads") {
        const order = orders.find((o) => o.id === orderId);
        if (order) {
          finalDescription += `\n\n--- Related Order ---\nOrder ID: ${order.displayId} (${order.id})\nCustomer: ${order.customerName}\nTotal Value: ₹${order.total.toLocaleString("en-IN")}\nDate: ${order.date}`;
        }
      }

      // Build payload — send to our Next.js API route which proxies to backend
      const payload = {
        reason,
        sub_reason: subReason,
        description: finalDescription,
        merchant_product_id: (reason !== "orders_leads" && productId) ? productId : null,
        attachment_url: null as string | null,
      };

      // If there's an image, upload it first via the existing upload endpoint
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          payload.attachment_url = uploadData.url ?? null;
        }
      }

      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? `Error ${res.status}`);
      }

      const ticket = await res.json();
      const reasonName = REASON_CATEGORIES.find((c) => c.slug === reason)?.name ?? reason;
      const subReasonName = subReasons.find((s) => s.slug === subReason)?.name ?? subReason;
      const product = reason !== "orders_leads" ? products.find((p) => p.id === productId) : null;
      const order = reason === "orders_leads" ? orders.find((o) => o.id === orderId) : null;

      setSubmitted({
        ticketId: ticket.reference,
        reason: reasonName,
        subReason: subReasonName,
        productTitle: product ? `${product.title} (${product.sku})` : null,
        orderTitle: order ? `${order.displayId} — ${order.customerName}` : null,
        createdAt: new Date(ticket.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setReason(""); setSubReason(""); setProductId(""); setOrderId(""); setDescription("");
    setImageFile(null); setImagePreview(null); setSubmitted(null); setError(null);
  };

  return (
    <div className="min-h-screen bg-[#EDEEF0] p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#0E9F88]/10 flex items-center justify-center text-[#0E9F88]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-[#111827] tracking-tight">Support Center</h1>
            <p className="text-[12px] text-gray-400">We&apos;re here to help. Submit a ticket or browse FAQs.</p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">

        {/* ══════════ LEFT: FAQ ══════════ */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E2E4E8] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F1F3F5] flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#111827]">Frequently Asked Questions</p>
                <p className="text-[11px] text-gray-400">Quick answers to common queries</p>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {FAQ_DATA.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E4E8] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F1F3F5]">
              <p className="text-[13px] font-semibold text-[#111827]">Support Categories</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Browse what we can help with</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {REASON_CATEGORIES.map((cat) => (
                <div
                  key={cat.slug}
                  onClick={() => { handleReasonChange(cat.slug); document.getElementById("support-ticket-form")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#F1F3F5] bg-[#FAFBFC] hover:bg-[#F0FDF9] hover:border-[#0E9F88]/20 cursor-pointer transition-all group"
                >
                  <span className="text-gray-400 group-hover:text-[#0E9F88] transition-colors shrink-0">{getCategoryIcon(cat.slug)}</span>
                  <span className="text-[11.5px] font-medium text-gray-600 group-hover:text-[#111827] leading-tight">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT: FORM ══════════ */}
        <div className="flex flex-col gap-6 w-full">
          <div id="support-ticket-form" className="bg-white rounded-2xl border border-[#E2E4E8] overflow-hidden">
          {submitted ? (
            <div className="flex flex-col items-center justify-center p-10 text-center min-h-[480px]">
              <div className="w-16 h-16 rounded-full bg-[#0E9F88]/10 flex items-center justify-center text-[#0E9F88] mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h2 className="text-[18px] font-bold text-[#111827] mb-1">Ticket Submitted!</h2>
              <p className="text-[12.5px] text-gray-400 mb-6 max-w-xs">Your support request has been received. We&apos;ll get back to you within 48 business hours.</p>

              <div className="w-full max-w-sm bg-[#F8F9FB] rounded-xl border border-[#E8EAED] p-4 text-left mb-6">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#E8EAED]">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Ticket ID</span>
                  <span className="text-[11px] font-bold text-[#0E9F88] font-mono break-all">{submitted.ticketId}</span>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between gap-3"><span className="text-gray-400 shrink-0">Reason</span><span className="text-[#111827] font-medium text-right">{submitted.reason}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-gray-400 shrink-0">Sub-Reason</span><span className="text-[#111827] font-medium text-right">{submitted.subReason}</span></div>
                  {submitted.productTitle && <div className="flex justify-between gap-3"><span className="text-gray-400 shrink-0">Product</span><span className="text-[#111827] font-medium text-right">{submitted.productTitle}</span></div>}
                  {submitted.orderTitle && <div className="flex justify-between gap-3"><span className="text-gray-400 shrink-0">Order</span><span className="text-[#111827] font-medium text-right">{submitted.orderTitle}</span></div>}
                  <div className="flex justify-between gap-3"><span className="text-gray-400 shrink-0">Submitted</span><span className="text-[#111827] font-medium">{submitted.createdAt}</span></div>
                </div>
              </div>

              <button onClick={resetForm} className="flex items-center gap-2 px-5 py-2.5 bg-[#111827] text-white text-[13px] font-medium rounded-xl hover:bg-[#1f2937] transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Submit Another Ticket
              </button>
            </div>
          ) : (
            <>
              <div className="px-6 py-5 border-b border-[#F1F3F5] flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#0E9F88]/10 text-[#0E9F88] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">Submit a Support Ticket</p>
                  <p className="text-[11px] text-gray-400">Fill in the details and our team will respond promptly</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">

                {/* Error banner */}
                {error && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[12.5px] text-red-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 mt-0.5 text-red-500">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Reason <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select id="support-reason" value={reason} onChange={(e) => handleReasonChange(e.target.value)} required
                      className="w-full appearance-none bg-[#F8F9FB] border border-[#E2E4E8] rounded-xl px-4 py-3 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all pr-10">
                      <option value="">Select a category…</option>
                      {REASON_CATEGORIES.map((cat) => (<option key={cat.slug} value={cat.slug}>{cat.name}</option>))}
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </div>
                </div>

                {/* Sub-Reason */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Sub-Reason <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select id="support-sub-reason" value={subReason} onChange={(e) => setSubReason(e.target.value)} required disabled={!reason}
                      className="w-full appearance-none bg-[#F8F9FB] border border-[#E2E4E8] rounded-xl px-4 py-3 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all pr-10 disabled:opacity-50 disabled:cursor-not-allowed">
                      <option value="">{reason ? "Select a sub-reason…" : "Select a reason first…"}</option>
                      {subReasons.map((s) => (<option key={s.slug} value={s.slug}>{s.name}</option>))}
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </div>

                  {/* Breadcrumb */}
                  {reason && subReason && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F0FDF9] border border-[#0E9F88]/20 rounded-lg text-[11px] font-medium text-[#0B7A69]">
                        {getCategoryIcon(reason)}{selectedCategory?.name}
                      </span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-gray-300 shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                      <span className="inline-flex items-center px-2.5 py-1 bg-[#F8F9FB] border border-[#E2E4E8] rounded-lg text-[11px] font-medium text-gray-600">
                        {subReasons.find((s) => s.slug === subReason)?.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Related Product — searchable combobox */}
                {reason !== "orders_leads" && (
                  <div>
                    <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Related Product <span className="text-[10px] normal-case font-normal text-gray-400">(optional)</span>
                    </label>
                    {products.length === 0 ? (
                      <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F9FB] border border-[#E2E4E8] rounded-xl text-[12.5px] text-gray-400 italic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                        No products in your catalog yet
                      </div>
                    ) : (
                      <ProductCombobox products={products} value={productId} onChange={setProductId} />
                    )}
                    {products.length > 0 && (
                      <p className="mt-1.5 text-[11px] text-gray-400">{products.length} product{products.length !== 1 ? "s" : ""} in your catalog</p>
                    )}
                  </div>
                )}

                {/* Related Order — searchable combobox */}
                {reason === "orders_leads" && (
                  <div>
                    <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Related Order <span className="text-[10px] normal-case font-normal text-gray-400">(optional)</span>
                    </label>
                    {orders.length === 0 ? (
                      <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F9FB] border border-[#E2E4E8] rounded-xl text-[12.5px] text-gray-400 italic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                        </svg>
                        No orders placed yet
                      </div>
                    ) : (
                      <OrderCombobox orders={orders} value={orderId} onChange={setOrderId} />
                    )}
                    {orders.length > 0 && (
                      <p className="mt-1.5 text-[11px] text-gray-400">{orders.length} order{orders.length !== 1 ? "s" : ""} in your store</p>
                    )}
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Attachment <span className="text-[10px] normal-case font-normal text-gray-400">(optional — screenshot or image)</span>
                  </label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#E2E4E8] bg-[#F8F9FB]">
                      <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain"/>
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-[#E2E4E8] shadow-sm flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()}
                      className={`flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragOver ? "border-[#0E9F88] bg-[#F0FDF9]" : "border-[#E2E4E8] bg-[#FAFBFC] hover:border-[#0E9F88]/40 hover:bg-[#F8FFFE]"}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${dragOver ? "bg-[#0E9F88]/10 text-[#0E9F88]" : "bg-gray-100 text-gray-400"}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-[12.5px] font-medium text-gray-500">Drag & drop or <span className="text-[#0E9F88] font-semibold">browse</span></p>
                        <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    </div>
                  )}
                  <input ref={fileRef} id="support-image" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}/>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="support-description" className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea id="support-description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={5}
                    placeholder="Please describe the issue in detail. Include any error messages, steps to reproduce, or expected vs. actual behavior…"
                    className="w-full bg-[#F8F9FB] border border-[#E2E4E8] rounded-xl px-4 py-3 text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] transition-all resize-none leading-relaxed"/>
                  <p className="mt-1.5 text-[11px] text-gray-400 text-right">{description.length}/4000</p>
                </div>

                {/* Submit */}
                <button type="submit" id="support-submit-btn"
                  disabled={isSubmitting || !reason || !subReason || !description.trim()}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#111827] text-white text-[13.5px] font-semibold rounded-xl hover:bg-[#1f2937] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
                  {isSubmitting ? (
                    <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Submitting…</>
                  ) : (
                    <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Submit Ticket</>
                  )}
                </button>
                <p className="text-[11px] text-gray-400 text-center leading-relaxed">By submitting, you agree that our support team may contact you at your registered email address.</p>
              </form>
            </>
          )}
        </div>

        {/* Redesigned Still need help? section */}
        <div className="bg-white rounded-2xl border border-[#E2E4E8] p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0E9F88]/10 text-[#0E9F88] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">Still need help?</h3>
              <p className="text-[12px] text-gray-500 mt-1 max-w-xl leading-relaxed">
                Our support team responds within 24 business hours for general queries and within 2 hours for critical technical issues.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopyEmail}
              className={`flex items-center justify-center gap-2 px-5 py-3 border text-[13px] font-medium rounded-xl transition-all shadow-sm ${
                copied
                  ? "border-[#0E9F88] text-[#0E9F88] bg-[#F0FDF9]"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
              }`}
            >
              {copied ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy Address
                </>
              )}
            </button>
            
            <a
              href="mailto:support@simulafly.com"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#0E9F88] hover:bg-[#0B7A69] active:scale-[0.98] text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
