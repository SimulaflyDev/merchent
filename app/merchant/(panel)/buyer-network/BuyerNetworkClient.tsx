"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateContactInviteAction,
  launchBulkOfferAction,
} from "@/lib/auth/buyer-intelligence-actions";
import type { ContactOut } from "@/lib/api/contacts";
import { callAction } from "@/lib/api/action-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Customer = {
  id: string;
  name: string;
  phone: string;
  source: string;
  lastPurchase: string;
  inviteStatus: "Not Invited" | "Invited" | "Joined";
};

function adaptContact(c: ContactOut): Customer {
  const statusMap: Record<string, "Not Invited" | "Invited" | "Joined"> = {
    not_invited: "Not Invited",
    invited: "Invited",
    joined: "Joined",
  };
  return {
    id: c.id,
    name: c.name,
    phone: c.phone ?? "",
    source:
      c.source === "csv"
        ? "CSV"
        : c.source === "whatsapp"
          ? "WhatsApp"
          : c.source === "checkout" || c.source === "Checkout"
            ? "Checkout"
            : "Manual",
    lastPurchase: c.last_purchase_note ?? "—",
    inviteStatus: statusMap[c.invite_status] ?? "Not Invited",
  };
}

const ACTIONS = [
  { id: "visualize", label: "Invite to Visualize a Room" },
  { id: "collection", label: "Share New Collection" },
  { id: "festival", label: "Festival Campaign" },
  { id: "discount", label: "Product Discount" },
  { id: "arrival", label: "New Arrival Drop" },
];

function defaultMessage(action: string, product: string, name: string): string {
  switch (action) {
    case "visualize":
      return `Hi ${name}! 🛋️ We'd love for you to see how our products look in your home. Visualize any room for free here → [your SimulaFly link]`;
    case "collection":
      return `Hi ${name}! We just added new products to our collection. Check out ${product} and more at your personalized showroom → [link]`;
    case "festival":
      return `Hi ${name}! 🎉 Festive special for you — get an exclusive discount on ${product}. Tap here to visualize it in your home first → [link]`;
    case "discount":
      return `Hi ${name}! We have a special offer on ${product} just for you. See it in your room before you decide → [link]`;
    case "arrival":
      return `Hi ${name}! 📦 Our newest product is live — ${product}. Be among the first to visualize it in your home → [link]`;
    default:
      return "";
  }
}

const INVITE_STATUS_STYLE: Record<string, { dot: string; text: string; bg: string }> = {
  "Joined":      { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50/70 border-emerald-100" },
  "Invited":     { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50/70 border-amber-100"   },
  "Not Invited": { dot: "bg-gray-300",    text: "text-gray-500",    bg: "bg-gray-50/70 border-gray-200"    },
};

// ─── WhatsApp Invite Modal ────────────────────────────────────────────────────

function InviteModal({
  customer,
  products,
  onClose,
  onSent,
}: {
  customer: Customer;
  products: string[];
  onClose: () => void;
  onSent: () => void;
}) {
  const inviteProducts = products && products.length > 0 ? products : ["Your Catalog", "Featured Products"];
  const [action, setAction] = useState("visualize");
  const [product, setProduct] = useState(inviteProducts[0]);
  const [message, setMessage] = useState(() =>
    defaultMessage("visualize", inviteProducts[0], customer.name.split(" ")[0])
  );
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const updateMessage = (a: string, p: string) =>
    setMessage(defaultMessage(a, p, customer.name.split(" ")[0]));

  const handleSend = async () => {
    setSending(true);
    try {
      await callAction(updateContactInviteAction(customer.id, "invited"));
      setSent(true);
      setTimeout(() => {
        onSent();
        onClose();
      }, 1800);
    } catch {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">WhatsApp Invite</p>
            <h3 className="text-[15px] font-bold text-gray-900">{customer.name}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{customer.phone || "No phone"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors mt-0.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {!sent ? (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Message type</label>
              <div className="space-y-1.5">
                {ACTIONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setAction(a.id); updateMessage(a.id, product); }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[12px] font-medium border transition-all ${
                      action === a.id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Product / collection</label>
              <select
                value={product}
                onChange={(e) => { setProduct(e.target.value); updateMessage(action, e.target.value); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[12px] text-gray-800 font-medium outline-none focus:border-gray-400 transition-colors"
              >
                {inviteProducts.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Message preview</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[12px] text-gray-800 leading-relaxed outline-none focus:border-gray-400 transition-colors resize-none font-medium"
              />
              <p className="text-[10px] text-gray-400 mt-1">You can edit this message before sending.</p>
            </div>
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full py-3.5 bg-[#25D366] text-white text-[13px] font-bold rounded-xl hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {sending ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              )}
              Send WhatsApp Invite
            </button>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Invite sent!</h3>
            <p className="text-[12px] text-gray-400">{customer.name} will receive your WhatsApp message shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WhatsApp Bulk Offer Modal ────────────────────────────────────────────────

interface BulkOfferModalProps {
  targets: Customer[];
  products: string[];
  onClose: () => void;
  onSent: (sentIds: string[]) => void;
}

function BulkOfferModal({ targets, products, onClose, onSent }: BulkOfferModalProps) {
  const inviteProducts = products && products.length > 0 ? products : ["Your Catalog", "Featured Products"];
  const [selectedProducts, setSelectedProducts] = useState<string[]>([inviteProducts[0]]);
  const [discount, setDiscount] = useState(15);
  const [maxCustomers, setMaxCustomers] = useState(50);
  const [maxDays, setMaxDays] = useState(7);
  const [message, setMessage] = useState("");
  const [isMessageEdited, setIsMessageEdited] = useState(false);

  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSendingName, setCurrentSendingName] = useState("");
  const [successList, setSuccessList] = useState<string[]>([]);
  const [campaignCompleted, setCampaignCompleted] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  const getProductListString = (prods: string[]) => {
    if (prods.length === 0) return "our catalog";
    if (prods.length === 1) return prods[0];
    if (prods.length === 2) return `${prods[0]} & ${prods[1]}`;
    return `${prods.slice(0, 2).join(", ")}, and ${prods.length - 2} other products`;
  };

  const getBulkMessage = (prods: string[], disc: number, maxCust: number, days: number, namePlaceholder: string = "[Name]") => {
    const prodStr = getProductListString(prods);
    return `Hi ${namePlaceholder}! 🛋️ Special bulk offer: Get ${disc}% off on ${prodStr}. This offer is valid for the first ${maxCust} customers or up to ${days} days, whichever reaches first! Visualise it in your home now → [your SimulaFly link]`;
  };

  useEffect(() => {
    if (!isMessageEdited) {
      setMessage(getBulkMessage(selectedProducts, discount, maxCustomers, maxDays));
    }
  }, [selectedProducts, discount, maxCustomers, maxDays, isMessageEdited]);

  const handleSendBulk = async () => {
    if (targets.length === 0) return;
    setSending(true);

    const targetIds = targets.map((t) => t.id);
    try {
      // Execute campaign in one database transaction on the backend
      await callAction(
        launchBulkOfferAction({
          contact_ids: targetIds,
          products: selectedProducts,
          discount,
          max_customers: maxCustomers,
          max_days: maxDays,
          message,
        })
      );

      // Animate the sending progress to provide a premium user experience
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        setCurrentSendingName(target.name);
        // Add a slight delay between list rendering
        await new Promise((resolve) => setTimeout(resolve, 80));
        setSuccessList((prev) => [...prev, target.name]);
        setProgress(Math.round(((i + 1) / targets.length) * 100));
      }

      setSuccessCount(targets.length);
      setCampaignCompleted(true);
      setSending(false);
      onSent(targetIds);
    } catch (err) {
      console.error("Failed to launch campaign", err);
      alert("Failed to launch campaign");
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={sending ? undefined : onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">WhatsApp Campaign</span>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Target: {targets.length} customer{targets.length !== 1 ? "s" : ""}</span>
            </div>
            <h3 className="text-[16px] font-bold text-gray-900 mt-1">Create Bulk Offer</h3>
          </div>
          {!sending && (
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {sending ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-6">
              <div className="w-16 h-16 relative flex items-center justify-center">
                <svg className="animate-spin absolute w-full h-full text-emerald-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-[15px] font-bold text-gray-900">Sending WhatsApp Offers</h4>
                <p className="text-[12px] text-gray-400">Currently inviting: <span className="font-semibold text-gray-700">{currentSendingName}</span></p>
              </div>

              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="w-full max-w-md bg-gray-50 rounded-xl border border-gray-100 p-4 max-h-[150px] overflow-y-auto space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Logs</p>
                {successList.map((name, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Sent successfully to {name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : campaignCompleted ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-5 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner">
                <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[16px] font-bold text-gray-900">Campaign Launched!</h4>
                <p className="text-[12px] text-gray-500 max-w-sm">Successfully created discount campaign and sent WhatsApp offers to <span className="font-bold text-gray-800">{successCount}</span> customers.</p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-[12px] font-bold rounded-xl transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Side */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Target Products ({selectedProducts.length} selected)</label>
                  <div className="border border-gray-200 rounded-xl bg-gray-50 p-3 max-h-[140px] overflow-y-auto space-y-1.5 shadow-inner">
                    {inviteProducts.map((p) => {
                      const isChecked = selectedProducts.includes(p);
                      return (
                        <label key={p} className="flex items-center gap-2.5 px-2 py-1 hover:bg-gray-100/50 rounded-lg cursor-pointer transition-colors text-[11px] text-gray-700 font-semibold select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                if (selectedProducts.length > 1) {
                                  setSelectedProducts(prev => prev.filter(item => item !== p));
                                }
                              } else {
                                setSelectedProducts(prev => [...prev, p]);
                              }
                            }}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-500"
                          />
                          <span>{p}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Custom discount slider or text field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Discount Percentage</label>
                    <span className="text-[12px] font-bold text-gray-900">{discount}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="90"
                      step="5"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="flex-1 accent-emerald-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="relative w-20">
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={discount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 0 && val <= 100) {
                            setDiscount(val);
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[12px] text-gray-800 font-semibold outline-none focus:border-gray-400 transition-colors text-right pr-6"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                {/* Custom limiters */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Campaign Expiry Limits</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[9px] text-gray-400 font-bold mb-1">Max Customers</span>
                      <input
                        type="number"
                        min="1"
                        value={maxCustomers}
                        onChange={(e) => setMaxCustomers(Math.max(1, Number(e.target.value)))}
                        placeholder="e.g. 50"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[12px] text-gray-800 font-medium outline-none focus:border-gray-400 transition-colors"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-gray-400 font-bold mb-1">Max Duration (Days)</span>
                      <input
                        type="number"
                        min="1"
                        value={maxDays}
                        onChange={(e) => setMaxDays(Math.max(1, Number(e.target.value)))}
                        placeholder="e.g. 7"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[12px] text-gray-800 font-medium outline-none focus:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Expiry limit rule indicator */}
                  <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p className="text-[10px] font-semibold text-amber-800 leading-normal">
                      Coupon expires when customer count reaches <span className="font-bold">{maxCustomers}</span> OR after <span className="font-bold">{maxDays} days</span>, whichever reaches first.
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Side (WhatsApp Mockup style) */}
              <div className="flex flex-col h-full bg-transparent">
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">WhatsApp Message Preview</label>
                
                {/* Mobile Preview Screen */}
                <div className="flex-1 bg-[#E5DDD5] border border-gray-200 rounded-xl overflow-hidden shadow-inner flex flex-col min-h-[280px]">
                  {/* WhatsApp Header */}
                  <div className="bg-[#075E54] text-white px-3 py-2 flex items-center gap-2 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">SF</div>
                    <div>
                      <p className="text-[10px] font-bold leading-tight">SimulaFly Business</p>
                      <p className="text-[8px] text-emerald-200 leading-none">Online</p>
                    </div>
                  </div>
                  {/* Message Bubble Container */}
                  <div className="flex-1 p-3 flex flex-col justify-end space-y-2 overflow-y-auto">
                    <div className="bg-white rounded-lg p-2.5 shadow-sm max-w-[90%] self-start text-[11px] relative leading-relaxed text-gray-800 w-full">
                      <textarea
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          setIsMessageEdited(true);
                        }}
                        rows={6}
                        className="w-full bg-transparent border-none outline-none resize-none font-medium p-0 focus:ring-0 text-[11px] leading-relaxed text-gray-800 focus:outline-none focus:border-none"
                      />
                      <div className="flex justify-between items-center mt-1 text-[8px] text-gray-400">
                        <span>Click to edit directly</span>
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!sending && !campaignCompleted && (
          <div className="px-6 py-4.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendBulk}
              disabled={targets.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-[12px] font-bold rounded-xl hover:bg-[#1DA851] transition-colors shadow-sm disabled:opacity-50"
            >
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              Launch Bulk Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialContacts: ContactOut[];
  products: string[];
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BuyerNetworkClient({ initialContacts, products }: Props) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialContacts.map(adaptContact));
  const [search, setSearch] = useState("");
  const [inviting, setInviting] = useState<Customer | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [sentBanner, setSentBanner] = useState("");



  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleInviteSent = () => {
    if (inviting) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === inviting.id ? { ...c, inviteStatus: "Invited" as const } : c))
      );
      setSentBanner(inviting.name);
      setTimeout(() => setSentBanner(""), 3000);
    }
  };

  const handleBulkSent = (sentIds: string[]) => {
    setCustomers((prev) =>
      prev.map((c) => (sentIds.includes(c.id) ? { ...c, inviteStatus: "Invited" as const } : c))
    );
    setSentBanner(`${sentIds.length} customer${sentIds.length !== 1 ? "s" : ""}`);
    setTimeout(() => setSentBanner(""), 3000);
  };

  const hasCustomers = customers.length > 0;

  return (
    <div className="px-8 py-8 w-full max-w-[1440px] mx-auto space-y-5">


      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">My Customers</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Invite your customer network to SimulaFly.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulk(true)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white text-[12px] font-bold rounded-xl hover:bg-[#1DA851] transition-colors shadow-sm disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
            WhatsApp Bulk Offer
          </button>
        </div>
      </div>

      {sentBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
          <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <p className="text-[12px] font-semibold text-emerald-700">WhatsApp invite marked as sent for {sentBanner}.</p>
        </div>
      )}

      {!hasCustomers && (
        <div className="bg-white border border-gray-200 border-dashed rounded-2xl py-20 text-center px-6">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-gray-700 mb-1">No customers yet.</p>
          <p className="text-[12px] text-gray-400 max-w-sm mx-auto">Customers will automatically appear here once they interact with your store or complete a purchase.</p>
        </div>
      )}

      {hasCustomers && (
        <>
          <div className="relative">
            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors shadow-sm font-medium"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_120px_140px_32px] border-b border-gray-100 px-6 py-4 bg-gray-50/50">
              {["Name", "Phone", "Source", "Last Purchase", "Status", "", ""].map((h, i) => (
                <p key={i} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{h}</p>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="px-6 py-10 text-center text-[12px] text-gray-400">No customers match your search.</p>
            ) : (
              filtered.map((c) => {
                const st = INVITE_STATUS_STYLE[c.inviteStatus] || INVITE_STATUS_STYLE["Not Invited"];
                return (
                  <div 
                    key={c.id} 
                    onClick={() => router.push(`/merchant/buyer-network/${c.id}`)}
                    className="grid grid-cols-[2fr_1.5fr_1fr_1fr_120px_140px_32px] items-center px-6 py-4.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors cursor-pointer group/row"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-bold text-[11px] flex items-center justify-center shrink-0 shadow-sm">
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-[13px] font-bold text-[#1FAF9A] hover:underline transition-colors">{c.name}</p>
                    </div>
                    <p className="text-[12px] text-gray-500 font-semibold">{c.phone || "—"}</p>
                    <p className="text-[11px] text-gray-400 font-semibold">{c.source}</p>
                    <p className="text-[11px] text-gray-500 font-semibold">{c.lastPurchase}</p>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {c.inviteStatus}
                      </span>
                    </div>
                    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setInviting(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50/50 hover:border-emerald-300 whitespace-nowrap transition-colors shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5 fill-current text-emerald-500" viewBox="0 0 24 24"><path d="M2.004 22l1.352-4.938A9.954 9.954 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.954 9.954 0 01-5.062-1.356L2.004 22zM12 4a8 8 0 00-8 8c0 1.637.496 3.197 1.43 4.512l.164.249-.806 2.941 3.013-.788.243.144A7.961 7.961 0 0012 20a8 8 0 008-8 8 8 0 00-8-8z"/></svg>
                        WhatsApp Offer
                      </button>
                    </div>
                    <div className="flex justify-end text-gray-300 group-hover/row:text-gray-400 transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <p className="text-[10px] text-gray-400 text-right">{customers.length} customer{customers.length !== 1 ? "s" : ""} in your network</p>
        </>
      )}

      {inviting && (
        <InviteModal
          customer={inviting}
          products={products}
          onClose={() => setInviting(null)}
          onSent={handleInviteSent}
        />
      )}
      {showBulk && (
        <BulkOfferModal
          targets={filtered}
          products={products}
          onClose={() => setShowBulk(false)}
          onSent={handleBulkSent}
        />
      )}
    </div>
  );
}
