"use client";

import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Customer = {
  id: string;
  name: string;
  phone: string;
  source: "CSV" | "WhatsApp" | "Manual";
  lastPurchase: string;
  inviteStatus: "Not Invited" | "Invited" | "Joined";
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CUSTOMERS: Customer[] = [
  { id: "1",  name: "Rahul Sharma",    phone: "+91 98765 43210", source: "CSV",      lastPurchase: "This month",    inviteStatus: "Joined" },
  { id: "2",  name: "Priya Mehta",     phone: "+91 97654 32109", source: "Manual",   lastPurchase: "Last month",    inviteStatus: "Invited" },
  { id: "3",  name: "Sunita Agarwal",  phone: "+91 96543 21098", source: "CSV",      lastPurchase: "3 months ago",  inviteStatus: "Not Invited" },
  { id: "4",  name: "Kiran Reddy",     phone: "+91 95432 10987", source: "WhatsApp", lastPurchase: "This week",     inviteStatus: "Joined" },
  { id: "5",  name: "Arjun Patel",     phone: "+91 94321 09876", source: "Manual",   lastPurchase: "—",             inviteStatus: "Not Invited" },
  { id: "6",  name: "Meera Iyer",      phone: "+91 93210 98765", source: "WhatsApp", lastPurchase: "Last month",    inviteStatus: "Invited" },
  { id: "7",  name: "Deepa Nair",      phone: "+91 92109 87654", source: "CSV",      lastPurchase: "2 months ago",  inviteStatus: "Not Invited" },
  { id: "8",  name: "Rohit Singh",     phone: "+91 91098 76543", source: "CSV",      lastPurchase: "Last week",     inviteStatus: "Joined" },
  { id: "9",  name: "Ananya Das",      phone: "+91 90987 65432", source: "Manual",   lastPurchase: "This month",    inviteStatus: "Invited" },
  { id: "10", name: "Vikram Joshi",    phone: "+91 89876 54321", source: "CSV",      lastPurchase: "4 months ago",  inviteStatus: "Not Invited" },
  { id: "11", name: "Kavitha Ramesh",  phone: "+91 88765 43210", source: "WhatsApp", lastPurchase: "This week",     inviteStatus: "Joined" },
  { id: "12", name: "Sandeep Kulkarni",phone: "+91 87654 32109", source: "CSV",      lastPurchase: "Last month",    inviteStatus: "Invited" },
];

const MOCK_PRODUCTS = [
  "Oslo Walnut Sofa",
  "Ember Dining Table",
  "Luna Bed Frame (Queen)",
  "Mist Bookshelf",
  "Carta Floor Lamp",
];

const INVITE_STATUS_STYLE: Record<string, { dot: string; text: string; bg: string }> = {
  "Joined":      { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  "Invited":     { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50"   },
  "Not Invited": { dot: "bg-gray-300",    text: "text-gray-500",    bg: "bg-gray-50"    },
};

// ─── WhatsApp Invite Modal ────────────────────────────────────────────────────

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

function InviteModal({ customer, onClose, onSent }: { customer: Customer; onClose: () => void; onSent: () => void }) {
  const [action, setAction] = useState("visualize");
  const [product, setProduct] = useState(MOCK_PRODUCTS[0]);
  const [message, setMessage] = useState(() => defaultMessage("visualize", MOCK_PRODUCTS[0], customer.name.split(" ")[0]));
  const [sent, setSent] = useState(false);

  const updateMessage = (a: string, p: string) => {
    setMessage(defaultMessage(a, p, customer.name.split(" ")[0]));
  };

  const handleActionChange = (a: string) => {
    setAction(a);
    updateMessage(a, product);
  };

  const handleProductChange = (p: string) => {
    setProduct(p);
    updateMessage(action, p);
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => { onSent(); onClose(); }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">WhatsApp Invite</p>
            <h3 className="text-[15px] font-bold text-gray-900">{customer.name}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{customer.phone}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors mt-0.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {!sent ? (
          <div className="p-6 space-y-5">
            {/* Action picker */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Message type</label>
              <div className="space-y-1.5">
                {ACTIONS.map(a => (
                  <button key={a.id} onClick={() => handleActionChange(a.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[12px] font-medium border transition-all ${
                      action === a.id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product picker */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Product / collection</label>
              <select
                value={product}
                onChange={e => handleProductChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[12px] text-gray-800 font-medium outline-none focus:border-gray-400 transition-colors"
              >
                {MOCK_PRODUCTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Message preview */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Message preview</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[12px] text-gray-800 leading-relaxed outline-none focus:border-gray-400 transition-colors resize-none font-medium"
              />
              <p className="text-[10px] text-gray-400 mt-1">You can edit this message before sending.</p>
            </div>

            {/* Send */}
            <button onClick={handleSend}
              className="w-full py-3.5 bg-[#25D366] text-white text-[13px] font-bold rounded-xl hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              </svg>
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

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-gray-400 transition-colors text-gray-900 font-medium";
  const labelCls = "block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: Date.now().toString(), name, phone, source: "Manual", lastPurchase: lastPurchase || "—", inviteStatus: "Not Invited" });
    onClose();
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
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Last Purchase <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
            <input value={lastPurchase} onChange={e => setLastPurchase(e.target.value)} placeholder="e.g. Last month" className={inputCls} />
          </div>
          <div className="pt-1 flex gap-3">
            <button type="submit" className="flex-1 py-3 bg-gray-900 text-white text-[13px] font-bold rounded-xl hover:bg-black transition-colors">Add Customer</button>
            <button type="button" onClick={onClose} className="px-5 py-3 text-[13px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── CSV Import Modal ─────────────────────────────────────────────────────────

function CsvImportModal({ onClose, onImport }: { onClose: () => void; onImport: (rows: Customer[]) => void }) {
  const [stage, setStage] = useState<"upload" | "preview">("upload");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const previewRows: Customer[] = [
    { id: "i1", name: "Deepa Nair",   phone: "+91 92109 87654", source: "CSV", lastPurchase: "2 months ago", inviteStatus: "Not Invited" },
    { id: "i2", name: "Rohit Singh",  phone: "+91 91098 76543", source: "CSV", lastPurchase: "Last week",    inviteStatus: "Not Invited" },
    { id: "i3", name: "Ananya Das",   phone: "+91 90987 65432", source: "CSV", lastPurchase: "—",            inviteStatus: "Not Invited" },
  ];

  const handleFile = (file: File) => {
    setFileName(file.name);
    setStage("preview");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-900">Import from CSV</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {stage === "upload" && (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragging ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"}`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <p className="text-[13px] font-bold text-gray-800 mb-1">Drop your CSV file here</p>
                <p className="text-[11px] text-gray-400">or click to browse</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold text-gray-500 mb-1">Expected columns:</p>
                <p className="font-mono text-[11px] text-gray-400">Name &nbsp;|&nbsp; Phone &nbsp;|&nbsp; Last Purchase</p>
              </div>
              <button onClick={() => { setFileName("sample_customers.csv"); setStage("preview"); }}
                className="w-full py-2 text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                Use sample file to preview →
              </button>
            </>
          )}

          {stage === "preview" && (
            <>
              <div className="flex items-center gap-2 text-[12px] text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span className="font-semibold">{fileName}</span>
                <span className="text-gray-400">· {previewRows.length} customers found</span>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 px-4 py-2">
                  {["Name", "Phone", "Last Purchase"].map(h => (
                    <p key={h} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{h}</p>
                  ))}
                </div>
                {previewRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-gray-50 last:border-0">
                    <p className="text-[12px] font-semibold text-gray-900">{row.name}</p>
                    <p className="text-[11px] text-gray-500">{row.phone}</p>
                    <p className="text-[11px] text-gray-500">{row.lastPurchase}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => { onImport(previewRows); onClose(); }}
                  className="flex-1 py-3 bg-gray-900 text-white text-[13px] font-bold rounded-xl hover:bg-black transition-colors">
                  Import {previewRows.length} Customers
                </button>
                <button onClick={() => setStage("upload")} className="px-5 text-[12px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">Back</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [inviting, setInviting] = useState<Customer | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const [sentBanner, setSentBanner] = useState("");

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleInviteSent = (name: string) => {
    setCustomers(prev => prev.map(c => c.name === name ? { ...c, inviteStatus: "Invited" } : c));
    setSentBanner(name);
    setTimeout(() => setSentBanner(""), 3000);
  };

  const handleImport = (rows: Customer[]) => {
    setCustomers(prev => [...prev, ...rows]);
    setSentBanner(`${rows.length} customers imported`);
    setTimeout(() => setSentBanner(""), 3000);
  };

  const hasCustomers = customers.length > 0;

  return (
    <div className="px-8 py-8 w-full max-w-[1440px] mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">My Customers</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Upload your offline customers and invite them to SimulaFly.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCsv(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[12px] font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload CSV
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-[12px] font-bold rounded-xl hover:bg-black transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Customer
          </button>
        </div>
      </div>

      {/* ── Success banner ── */}
      {sentBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
          <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <p className="text-[12px] font-semibold text-emerald-700">{sentBanner}.</p>
        </div>
      )}

      {/* ── Free value prop strip (shown always) ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { icon: "↑", text: "Import your customers for free" },
          { icon: "🛋️", text: "Invite them to visualize products" },
          { icon: "✦", text: "Earn invite balance when customers join" },
        ].map(item => (
          <div key={item.text} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5">
            <span className="text-[13px]">{item.icon}</span>
            <span className="text-[11px] font-medium text-gray-600">{item.text}</span>
          </div>
        ))}
      </div>

      {/* ── Empty state ── */}
      {!hasCustomers && (
        <div className="bg-white border border-gray-200 border-dashed rounded-2xl py-20 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <p className="text-[14px] font-semibold text-gray-700 mb-1">No customer details yet.</p>
          <p className="text-[12px] text-gray-400 mb-6">Upload your CSV to get started.</p>
          <button onClick={() => setShowCsv(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white text-[12px] font-bold rounded-xl hover:bg-black transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload CSV
          </button>
        </div>
      )}

      {/* ── Customer list ── */}
      {hasCustomers && (
        <>
          {/* Search */}
          <div className="relative">
            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_120px_140px] border-b border-gray-100 px-6 py-3">
              {["Name", "Phone", "Source", "Last Purchase", "Status", ""].map((h, i) => (
                <p key={i} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{h}</p>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="px-6 py-10 text-center text-[12px] text-gray-400">No customers match your search.</p>
            ) : filtered.map(c => {
              const st = INVITE_STATUS_STYLE[c.inviteStatus];
              return (
                <div key={c.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_120px_140px] items-center px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                  {/* Name */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <p className="text-[13px] font-semibold text-gray-900">{c.name}</p>
                  </div>
                  {/* Phone */}
                  <p className="text-[12px] text-gray-500">{c.phone || "—"}</p>
                  {/* Source */}
                  <p className="text-[11px] text-gray-400">{c.source}</p>
                  {/* Last Purchase */}
                  <p className="text-[11px] text-gray-500">{c.lastPurchase}</p>
                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {c.inviteStatus}
                    </span>
                  </div>
                  {/* Action */}
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
            })}
          </div>

          <p className="text-[10px] text-gray-400 text-right">{customers.length} customer{customers.length !== 1 ? "s" : ""} in your network</p>
        </>
      )}

      {/* Modals */}
      {inviting && (
        <InviteModal
          customer={inviting}
          onClose={() => setInviting(null)}
          onSent={() => handleInviteSent(inviting.name)}
        />
      )}
      {showAdd && <AddContactModal onClose={() => setShowAdd(false)} onAdd={c => setCustomers(prev => [c, ...prev])} />}
      {showCsv && <CsvImportModal onClose={() => setShowCsv(false)} onImport={handleImport} />}
    </div>
  );
}
