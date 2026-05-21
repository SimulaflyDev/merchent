"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Mock data from onboarding ────────────────────────────────────────────────
const PROFILE_DATA = {
  legalName: "Acme Furniture Co.",
  storeName: "Acme Home",
  gst: "22AAAAA0000A1Z5",
  mobile: "+91 98765 43210",
  city: "Mumbai",
  state: "MH",
  pincode: "400001",
  address: "123 Furniture Row, Suite 400",
  website: "www.acmefurniture.co",
  instagram: "@acmefurniture",
  storeType: "Furniture store",
  categories: ["Sofas & Seating", "Tables & Desks", "Lighting", "Rugs & Carpets"],
  roomOptions: ["Living room", "Bedroom", "Dining room", "Home office"],
  styleTags: ["Modern", "Minimalist", "Scandinavian"],
  referralCode: "",
  referralApplied: false,
};

const STORE_TYPES = ["Furniture store", "Interior studio", "Home decor shop", "Manufacturer", "Dealer", "Wholesale seller"];
const ALL_CATEGORIES = ["Sofas & Seating", "Tables & Desks", "Beds & Mattresses", "Storage & Shelves", "Lighting", "Rugs & Carpets", "Wall Art & Mirrors", "Outdoor Furniture", "Office Furniture", "Kitchen & Dining"];
const ALL_STYLES = ["Modern", "Traditional", "Minimalist", "Industrial", "Scandinavian", "Bohemian", "Mid-century", "Rustic"];
const ALL_ROOMS = ["Living room", "Bedroom", "Dining room", "Home office", "Kitchen", "Bathroom", "Outdoor / Patio", "Kids room"];

function SectionCard({ title, sub, children, onSave }: { title: string; sub?: string; children: React.ReactNode; onSave?: () => void }) {
  return (
    <div className="bg-white border border-[#EAECEF] rounded-xl overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-[14px] font-semibold text-[#111827] tracking-tight">{title}</h2>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="p-6">{children}</div>
      {onSave && (
        <div className="bg-[#F8FAFB] px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onSave} className="px-5 py-2 bg-[#111827] text-white text-[11px] font-semibold rounded-lg hover:bg-black transition-colors">
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full bg-white border border-[#EAECEF] rounded-lg px-3 py-2.5 text-[12px] focus:ring-2 focus:ring-[#0E9F88]/30 focus:border-[#0E9F88] outline-none text-[#111827] font-medium transition-colors";
const labelCls = "block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const [legalName, setLegalName] = useState(PROFILE_DATA.legalName);
  const [storeName, setStoreName] = useState(PROFILE_DATA.storeName);
  const [gst, setGst] = useState(PROFILE_DATA.gst);
  const [mobile, setMobile] = useState(PROFILE_DATA.mobile);
  const [city, setCity] = useState(PROFILE_DATA.city);
  const [address, setAddress] = useState(PROFILE_DATA.address);
  const [website, setWebsite] = useState(PROFILE_DATA.website);
  const [instagram, setInstagram] = useState(PROFILE_DATA.instagram);
  const [savedBanner, setSavedBanner] = useState(false);

  // Store profile state
  const [storeType, setStoreType] = useState(PROFILE_DATA.storeType);
  const [categories, setCategories] = useState<string[]>(PROFILE_DATA.categories);
  const [styleTags, setStyleTags] = useState<string[]>(PROFILE_DATA.styleTags);
  const [roomOptions, setRoomOptions] = useState<string[]>(PROFILE_DATA.roomOptions);

  // Referral code state
  const [referralCode, setReferralCode] = useState(PROFILE_DATA.referralCode);
  const [referralValid, setReferralValid] = useState<null | boolean>(PROFILE_DATA.referralApplied ? true : null);
  const [referralApplied, setReferralApplied] = useState(PROFILE_DATA.referralApplied);

  const validateAndApplyReferral = (code: string) => {
    const upper = code.toUpperCase();
    setReferralCode(upper);
    const valid = upper.startsWith("SIMFLY-") && upper.length >= 10;
    setReferralValid(upper.length === 0 ? null : valid);
    if (valid) setReferralApplied(true);
  };

  const toggleChip = (val: string, list: string[], setList: (l: string[]) => void) => {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  };

  const handleSave = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const tabs = [
    { id: "profile",       label: "Business Profile" },
    { id: "store",         label: "Store Setup" },
    { id: "referral",      label: "Referral & Rewards" },
    { id: "billing",       label: "Billing Info" },
    { id: "team",          label: "Team Members" },
    { id: "notifications", label: "Notifications" },
    { id: "security",      label: "Security" },
  ];

  return (
    <div className="px-8 py-8 w-full max-w-[1100px] mx-auto space-y-6 mb-20">
      <div>
        <h1 className="text-[20px] font-bold text-[#111827] tracking-tight">Settings</h1>
        <p className="text-[12px] text-gray-400 mt-0.5">Manage your account, business profile, and platform preferences.</p>
      </div>

      {/* Saved banner */}
      {savedBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center gap-2.5">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <p className="text-[12px] font-semibold text-emerald-700">Changes saved successfully.</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-48 shrink-0">
          <nav className="flex flex-col space-y-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-2.5 rounded-lg text-[12px] transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#111827] text-white font-semibold"
                    : "text-gray-500 hover:bg-gray-100 hover:text-[#111827]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">

          {/* ── Business Profile ── */}
          {activeTab === "profile" && (
            <>
              <SectionCard title="Business Details" sub="Legal business information used for billing and verification." onSave={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Legal Business Name</label>
                    <input type="text" value={legalName} onChange={e => setLegalName(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Store Name <span className="text-red-400 normal-case">*</span></label>
                    <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>GST / Tax ID <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
                    <input type="text" value={gst} onChange={e => setGst(e.target.value)} className={`${inputCls} uppercase`} />
                  </div>
                  <div>
                    <label className={labelCls}>Mobile Number <span className="text-red-400 normal-case">*</span></label>
                    <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>City <span className="text-red-400 normal-case">*</span></label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} className={inputCls} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Business Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Website <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
                    <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Instagram Handle <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
                    <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* ── Store Setup ── */}
          {activeTab === "store" && (
            <>
              <SectionCard title="Store Type" sub="How would you describe your business?" onSave={handleSave}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STORE_TYPES.map(type => (
                    <button key={type} onClick={() => setStoreType(type)}
                      className={`px-3 py-2.5 rounded-lg text-[12px] font-medium border transition-all text-left ${
                        storeType === type ? "border-[#0E9F88] bg-[#0E9F88]/5 text-[#0E9F88]" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Product Categories" sub="Which furniture and decor categories do you sell?" onSave={handleSave}>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => toggleChip(cat, categories, setCategories)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                        categories.includes(cat) ? "border-[#0E9F88] bg-[#0E9F88]/5 text-[#0E9F88]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
                {categories.length === 0 && <p className="text-[11px] text-gray-400 mt-2">Select at least one category.</p>}
              </SectionCard>

              <SectionCard title="Room Types" sub="Which rooms do your products typically go in?" onSave={handleSave}>
                <div className="flex flex-wrap gap-2">
                  {ALL_ROOMS.map(room => (
                    <button key={room} onClick={() => toggleChip(room, roomOptions, setRoomOptions)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                        roomOptions.includes(room) ? "border-[#0E9F88] bg-[#0E9F88]/5 text-[#0E9F88]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      {room}
                    </button>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Style Identity" sub="What design styles best represent your store?" onSave={handleSave}>
                <div className="flex flex-wrap gap-2">
                  {ALL_STYLES.map(style => (
                    <button key={style} onClick={() => toggleChip(style, styleTags, setStyleTags)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                        styleTags.includes(style) ? "border-[#0E9F88] bg-[#0E9F88]/5 text-[#0E9F88]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      {style}
                    </button>
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {/* ── Referral & Rewards ── */}
          {activeTab === "referral" && (
            <>
              <SectionCard title="Partner Referral Code" sub="Enter a code from another SimulaFly merchant to link accounts and earn rewards.">
                {referralApplied ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Referral Active</p>
                      <p className="text-xl font-mono font-bold text-emerald-800 tracking-widest">{referralCode}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] text-emerald-700 flex items-center gap-1.5">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          Your referring partner earns 500 reward points when you go live
                        </p>
                        <p className="text-[11px] text-emerald-700 flex items-center gap-1.5">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          You received a welcome bonus on account creation
                        </p>
                      </div>
                    </div>
                    <button onClick={() => { setReferralCode(""); setReferralValid(null); setReferralApplied(false); }}
                      className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setReferralValid(null); setReferralApplied(false); }}
                        placeholder="e.g. SIMFLY-STORE-2024"
                        className={`flex-1 bg-white border-2 rounded-xl px-4 py-3 text-[13px] outline-none font-mono font-bold tracking-widest transition-colors placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-300 ${
                          referralValid === false ? "border-red-300 text-red-700" : "border-gray-200 text-gray-900 focus:border-[#0E9F88]"
                        }`}
                      />
                      <button
                        onClick={() => validateAndApplyReferral(referralCode)}
                        disabled={referralCode.length < 10}
                        className="px-5 py-3 bg-[#111827] text-white text-[12px] font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-40 whitespace-nowrap"
                      >
                        Apply Code
                      </button>
                    </div>
                    {referralValid === false && (
                      <p className="text-[11px] text-red-500 font-medium">Code not recognised — double-check with your partner.</p>
                    )}
                    <p className="text-[10px] text-gray-400">Invited by another SimulaFly merchant? Enter their code above to link accounts and earn rewards.</p>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Your Referral Code" sub="Share this code with other merchants you invite to SimulaFly.">
                <div className="flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 rounded-xl px-5 py-4">
                  <span className="font-mono text-lg font-bold text-gray-800 tracking-widest">SIMFLY-ACME-2024</span>
                  <button
                    onClick={() => navigator.clipboard.writeText("SIMFLY-ACME-2024")}
                    className="px-3 py-1.5 text-[11px] font-bold bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Merchants Referred</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">3</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Rewards Earned</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">1,500 pts</p>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* ── Billing Info ── */}
          {activeTab === "billing" && (
            <div className="space-y-5">
              <SectionCard title="Billing Plan" sub="You are on the tokenized billing model.">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[12px] font-semibold text-[#111827] mb-1">Pay-Per-Interaction Tokens</h3>
                    <p className="text-[11px] text-gray-500 max-w-sm leading-relaxed mb-3">
                      You only pay when users interact with your products. No monthly SaaS fees.
                    </p>
                    <Link href="/merchant/billing" className="text-[12px] font-semibold text-[#0E9F88] hover:underline">
                      Manage Wallet & Tokens →
                    </Link>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#0E9F88] bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F88]" /> Active
                  </span>
                </div>
              </SectionCard>

              <SectionCard title="Payment Method" sub="Used for wallet top-ups.">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-[#1FAF9A] text-xs">UPI</div>
                    <div>
                      <p className="text-[13px] font-bold text-[#111827]">merchant@okaxis</p>
                      <p className="text-[11px] text-gray-500">Primary Method</p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Billing Contact" sub="Where should we send your invoices?" onSave={handleSave}>
                <div>
                  <label className={labelCls}>Billing Email</label>
                  <input type="email" defaultValue="accounts@acmefurniture.co" className={`${inputCls} max-w-md`} />
                </div>
              </SectionCard>
            </div>
          )}

          {/* ── Team Members ── */}
          {activeTab === "team" && (
            <SectionCard title="Team Members" sub="Manage who has access to your merchant portal.">
              <div className="divide-y divide-gray-50 -mx-6 -mt-6">
                {[
                  { initials: "SJ", name: "Sarah Jenkins", email: "sarah@acmefurniture.co", role: "Owner", isYou: true },
                  { initials: "DK", name: "David Kim", email: "david@acmefurniture.co", role: "Editor", isYou: false },
                ].map(m => (
                  <div key={m.email} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 text-[#111827] flex items-center justify-center font-bold text-[11px] border border-gray-200">{m.initials}</div>
                      <div>
                        <p className="text-[12px] font-bold text-[#111827]">{m.name} {m.isYou && <span className="ml-1 text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>}</p>
                        <p className="text-[11px] text-gray-500">{m.email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-400">{m.role}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2.5 border border-dashed border-gray-200 text-[12px] font-semibold text-gray-400 rounded-xl hover:border-gray-300 hover:text-gray-600 transition-colors">
                + Invite Team Member
              </button>
            </SectionCard>
          )}

          {/* ── Notifications ── */}
          {activeTab === "notifications" && (
            <SectionCard title="Notification Preferences" sub="Manage how you receive alerts for new leads and platform updates.">
              <div className="space-y-5 divide-y divide-gray-50">
                {[
                  { icon: "whatsapp", label: "WhatsApp Alerts", sub: "Instant pings for high-intent leads.", on: true },
                  { icon: "email", label: "Email Digest", sub: "Daily summary of lead activity.", on: true },
                  { icon: "browser", label: "Browser Push", sub: "Notify me in the browser.", on: false },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between pt-4 first:pt-0">
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">{n.label}</p>
                      <p className="text-[11px] text-gray-400">{n.sub}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" defaultChecked={n.on} />
                      <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0E9F88]" />
                    </label>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── Security ── */}
          {activeTab === "security" && (
            <div className="bg-white border border-[#EAECEF] rounded-xl p-12 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 className="text-[14px] font-semibold text-[#111827] mb-1">Security Settings</h3>
              <p className="text-[12px] text-gray-400 max-w-xs mx-auto">Password, 2FA, and session management coming in Phase 4.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
