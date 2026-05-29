"use client";

import { useState, useRef } from "react";
import {
  createContactAction,
  updateContactInviteAction,
} from "@/lib/auth/buyer-intelligence-actions";
import type { ContactOut } from "@/lib/api/contacts";

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
          : "Manual",
    lastPurchase: c.last_purchase_note ?? "—",
    inviteStatus: statusMap[c.invite_status] ?? "Not Invited",
  };
}

const MOCK_PRODUCTS = [
  "Your latest collection",
  "Featured product",
  "Seasonal special",
];

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
  "Joined":      { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  "Invited":     { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50"   },
  "Not Invited": { dot: "bg-gray-300",    text: "text-gray-500",    bg: "bg-gray-50"    },
};

// ─── WhatsApp Invite Modal ────────────────────────────────────────────────────

function InviteModal({
  customer,
  onClose,
  onSent,
}: {
  customer: Customer;
  onClose: () => void;
  onSent: () => void;
}) {
  const [action, setAction] = useState("visualize");
  const [product, setProduct] = useState(MOCK_PRODUCTS[0]);
  const [message, setMessage] = useState(() =>
    defaultMessage("visualize", MOCK_PRODUCTS[0], customer.name.split(" ")[0])
  );
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const updateMessage = (a: string, p: string) =>
    setMessage(defaultMessage(a, p, customer.name.split(" ")[0]));

  const handleSend = async () => {
    setSending(true);
    try {
      await updateContactInviteAction(customer.id, "invited");
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
                {MOCK_PRODUCTS.map((p) => <option key={p}>{p}</option>)}
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

// ─── Add Contact Modal ────────────────────────────────────────────────────────

function AddContactModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Customer) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lastPurchase, setLastPurchase] = useState("");
  const [saving, setSaving] = useState(false);

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-gray-400 transition-colors text-gray-900 font-medium";
  const labelCls = "block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await createContactAction({ name, phone: phone || undefined, last_purchase_note: lastPurchase || undefined });
      onAdd(adaptContact(result));
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Add Customer</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Full Name <span className="text-red-400 normal-case">*</span></label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Last Purchase <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
            <input value={lastPurchase} onChange={(e) => setLastPurchase(e.target.value)} placeholder="e.g. Last month" className={inputCls} />
          </div>
          <div className="pt-1 flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-gray-900 text-white text-[13px] font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-60">
              {saving ? "Saving…" : "Add Customer"}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-3 text-[13px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialContacts: ContactOut[];
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BuyerNetworkClient({ initialContacts }: Props) {
  const [customers, setCustomers] = useState<Customer[]>(initialContacts.map(adaptContact));
  const [search, setSearch] = useState("");
  const [inviting, setInviting] = useState<Customer | null>(null);
  const [showAdd, setShowAdd] = useState(false);
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

  const hasCustomers = customers.length > 0;

  return (
    <div className="px-8 py-8 w-full max-w-[1440px] mx-auto space-y-5">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">My Customers</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Your offline customer base — import and invite them to SimulaFly.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-[12px] font-bold rounded-xl hover:bg-black transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Customer
          </button>
        </div>
      </div>

      {sentBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
          <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <p className="text-[12px] font-semibold text-emerald-700">WhatsApp invite marked as sent for {sentBanner}.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {[
          { icon: "↑", text: "Import your customers for free" },
          { icon: "🛋️", text: "Invite them to visualize products" },
          { icon: "✦", text: "Track engagement & invite status" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5">
            <span className="text-[13px]">{item.icon}</span>
            <span className="text-[11px] font-medium text-gray-600">{item.text}</span>
          </div>
        ))}
      </div>

      {!hasCustomers && (
        <div className="bg-white border border-gray-200 border-dashed rounded-2xl py-20 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <p className="text-[14px] font-semibold text-gray-700 mb-1">No customers yet.</p>
          <p className="text-[12px] text-gray-400 mb-6">Add your first customer to get started.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white text-[12px] font-bold rounded-xl hover:bg-black transition-colors"
          >
            Add Customer
          </button>
        </div>
      )}

      {hasCustomers && (
        <>
          <div className="relative">
            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_120px_140px] border-b border-gray-100 px-6 py-3">
              {["Name", "Phone", "Source", "Last Purchase", "Status", ""].map((h, i) => (
                <p key={i} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{h}</p>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="px-6 py-10 text-center text-[12px] text-gray-400">No customers match your search.</p>
            ) : (
              filtered.map((c) => {
                const st = INVITE_STATUS_STYLE[c.inviteStatus];
                return (
                  <div key={c.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_120px_140px] items-center px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <p className="text-[13px] font-semibold text-gray-900">{c.name}</p>
                    </div>
                    <p className="text-[12px] text-gray-500">{c.phone || "—"}</p>
                    <p className="text-[11px] text-gray-400">{c.source}</p>
                    <p className="text-[11px] text-gray-500">{c.lastPurchase}</p>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {c.inviteStatus}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setInviting(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#25D366] bg-white border border-[#25D366]/30 rounded-lg hover:bg-[#25D366]/5 whitespace-nowrap transition-colors shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                        WhatsApp Offer
                      </button>
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
          onClose={() => setInviting(null)}
          onSent={handleInviteSent}
        />
      )}
      {showAdd && (
        <AddContactModal
          onClose={() => setShowAdd(false)}
          onAdd={(c) => setCustomers((prev) => [c, ...prev])}
        />
      )}
    </div>
  );
}
