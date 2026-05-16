"use client";

import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("billing"); // Set billing as default to see changes easily

  const tabs = [
    { id: "profile", label: "Company Profile" },
    { id: "billing", label: "Billing Info" },
    { id: "brand", label: "Brand Details" },
    { id: "team", label: "Team Members" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
  ];

  return (
    <div className="p-6 md:p-8 w-full space-y-6 max-w-5xl mx-auto mb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-neutral-dark mb-1 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account, team members, and system preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-48 shrink-0">
          <nav className="flex flex-col space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === tab.id 
                    ? "bg-[#1FAF9A]/10 text-[#1FAF9A]" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-neutral-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-bold text-neutral-dark tracking-tight">Company Profile</h2>
                <p className="text-xs text-gray-500">Legal business information used for billing and identity.</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Legal Business Name</label>
                    <input type="text" defaultValue="Acme Furniture Co." className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">GST / Tax ID</label>
                    <input type="text" defaultValue="22AAAAA0000A1Z5" className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Business Address</label>
                    <input type="text" defaultValue="123 Furniture Row, Suite 400" className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium mb-3" />
                    <div className="grid grid-cols-3 gap-3">
                      <input type="text" defaultValue="Mumbai" className="col-span-1 bg-[#F8FAFB] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium" />
                      <input type="text" defaultValue="MH" className="col-span-1 bg-[#F8FAFB] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium" />
                      <input type="text" defaultValue="400001" className="col-span-1 bg-[#F8FAFB] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#F8FAFB] px-6 py-4 border-t border-gray-100 flex justify-end">
                <button className="px-5 py-2 bg-[#1FAF9A] text-white text-sm font-semibold rounded-lg hover:bg-[#189986] transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-dark tracking-tight">Billing Plan</h2>
                    <p className="text-xs text-gray-500">You are on the tokenized billing model.</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Active</span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-dark mb-1">Pay-Per-Interaction Tokens</h3>
                      <p className="text-xs text-gray-500 font-medium max-w-sm leading-relaxed mb-4">
                        You only pay when users interact with your products or when our AI Assistant recommends them. No monthly SaaS fees.
                      </p>
                      <Link href="/merchant/billing" className="text-sm font-bold text-[#1FAF9A] hover:text-[#189986] transition-colors">
                        Manage Wallet & Tokens &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-dark tracking-tight">Payment Methods</h2>
                    <p className="text-xs text-gray-500">Methods used for wallet top-ups.</p>
                  </div>
                  <Link href="/merchant/billing" className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors">
                    Edit Methods
                  </Link>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-[#1FAF9A] text-xs">UPI</div>
                      <div>
                        <p className="text-sm font-bold text-neutral-dark">merchant@okaxis</p>
                        <p className="text-xs text-gray-500 font-medium">Primary Method</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="text-lg font-bold text-neutral-dark tracking-tight">Billing Contacts</h2>
                  <p className="text-xs text-gray-500">Where should we send your invoices?</p>
                </div>
                <div className="p-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Billing Email Address</label>
                    <input type="email" defaultValue="accounts@acmefurniture.co" className="w-full max-w-md bg-[#F8FAFB] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium mb-3" />
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                      Update Contact
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-neutral-dark tracking-tight">Team Members</h2>
                  <p className="text-xs text-gray-500">Manage who has access to your merchant portal.</p>
                </div>
                <button className="px-3 py-1.5 bg-[#1FAF9A]/10 text-[#1FAF9A] text-xs font-bold rounded-lg hover:bg-[#1FAF9A]/20 transition-colors">
                  + Invite User
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">SJ</div>
                    <div>
                      <p className="text-sm font-bold text-neutral-dark">Sarah Jenkins <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-wider">You</span></p>
                      <p className="text-xs text-gray-500">sarah@acmefurniture.co</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-400">Owner</span>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">DK</div>
                    <div>
                      <p className="text-sm font-bold text-neutral-dark">David Kim</p>
                      <p className="text-xs text-gray-500">david@acmefurniture.co</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-400">Editor</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-neutral-dark tracking-tight">Notification Preferences</h2>
                  <p className="text-xs text-gray-500">Manage how you receive alerts for new leads and platform updates.</p>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-gray-50">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M5.339 21.337l-1.394-.446a.5.5 0 0 0-.61.233C2.543 22.476 1 22.005 1 20.5V5a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H5c-.223 0-.442-.02-.657-.058z" opacity="0"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.526 3.658 1.438 5.168L2 22l4.932-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">WhatsApp Alerts</h3>
                      <p className="text-xs text-gray-500">Get instant pings when high-intent leads are captured.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between pb-6 border-b border-gray-50">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Email Digest</h3>
                      <p className="text-xs text-gray-500">Daily summary of lead activity and AI insights.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Placeholders for other tabs */}
          {['brand', 'security'].includes(activeTab) && (
             <div className="bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-12 text-center">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
               </div>
               <h3 className="text-lg font-bold text-neutral-dark mb-1">Module in Development</h3>
               <p className="text-sm text-gray-500 max-w-sm mx-auto">This section of the settings panel is currently being built in Phase 4 of the implementation plan.</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
