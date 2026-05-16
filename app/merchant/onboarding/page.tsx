"use client";

import { useState } from "react";
import Link from "next/link";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  const steps = [
    { num: 1, title: "Company Info" },
    { num: 2, title: "Store Setup" },
    { num: 3, title: "Team Members" },
    { num: 4, title: "Ready" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center py-12 px-6">
      
      {/* Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1FAF9A] to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            S
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-neutral-dark">SimulaFly</span>
        </div>
        <button className="text-sm font-semibold text-gray-500 hover:text-neutral-dark transition-colors">
          Save & Exit
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        
        {/* Progress Bar */}
        <div className="flex border-b border-gray-50">
          {steps.map((s) => (
            <div key={s.num} className={`flex-1 text-center py-4 border-b-2 transition-colors ${step >= s.num ? 'border-[#1FAF9A] text-[#1FAF9A]' : 'border-transparent text-gray-300'}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest block mb-1">Step {s.num}</span>
              <span className={`text-xs font-bold ${step >= s.num ? 'text-neutral-dark' : 'text-gray-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-12">
          
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-neutral-dark tracking-tight mb-2">Tell us about your brand</h2>
                <p className="text-sm text-gray-500">This information will be displayed to customers when our AI recommends your products.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Legal Business Name</label>
                  <input type="text" placeholder="e.g. Acme Furniture Co." className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Business GST Number</label>
                  <input type="text" placeholder="e.g. 22AAAAA0000A1Z5" className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium uppercase" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Products you sell</label>
                  <select className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium appearance-none">
                     <option>Select category...</option>
                     <option>Furniture & Home Goods</option>
                     <option>Electronics</option>
                     <option>Fashion & Apparel</option>
                     <option>Automotive Parts</option>
                     <option>Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Support Email</label>
                  <input type="email" placeholder="support@company.com" className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-neutral-dark tracking-tight mb-2">Store Configuration</h2>
                <p className="text-sm text-gray-500">Configure how you'll process payments and fulfill AI-driven orders.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-xl bg-white hover:border-[#1FAF9A] cursor-pointer transition-colors group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-[#1FAF9A]/10 group-hover:text-[#1FAF9A]">
                        S
                     </div>
                     <div className="flex-1">
                       <h4 className="text-sm font-bold text-neutral-dark">Stripe Integration</h4>
                       <p className="text-xs text-gray-500">Connect your Stripe account to process payments directly.</p>
                     </div>
                     <button className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg group-hover:bg-[#1FAF9A] group-hover:text-white transition-colors">Connect</button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl bg-white hover:border-[#1FAF9A] cursor-pointer transition-colors group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-[#1FAF9A]/10 group-hover:text-[#1FAF9A]">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                     </div>
                     <div className="flex-1">
                       <h4 className="text-sm font-bold text-neutral-dark">Shopify Sync</h4>
                       <p className="text-xs text-gray-500">Automatically import products from your Shopify store.</p>
                     </div>
                     <button className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg group-hover:bg-[#1FAF9A] group-hover:text-white transition-colors">Connect</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-neutral-dark tracking-tight mb-2">Invite your team</h2>
                <p className="text-sm text-gray-500">Add team members to help manage your catalog and process orders.</p>
              </div>

              <div className="flex gap-3">
                 <input type="email" placeholder="colleague@company.com" className="flex-1 bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 outline-none text-neutral-dark font-medium" />
                 <select className="bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none text-neutral-dark font-medium appearance-none w-32">
                    <option>Admin</option>
                    <option>Editor</option>
                 </select>
                 <button className="px-5 bg-gray-100 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors">Invite</button>
              </div>

              <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center bg-[#F8FAFB]">
                 <p className="text-sm text-gray-500 font-medium">No team members invited yet.</p>
                 <button className="mt-2 text-xs font-bold text-[#1FAF9A] hover:text-[#189986]">Skip this step</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h2 className="text-3xl font-display font-bold text-neutral-dark tracking-tight mb-2">You're all set!</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">Your merchant account is fully configured. You can now start adding 3D products to your catalog.</p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-[#F8FAFB] px-8 py-5 border-t border-gray-100 flex justify-between items-center">
          {step > 1 ? (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 bg-white border border-gray-200 text-neutral-dark text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 4 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-[#1FAF9A] text-white text-sm font-bold rounded-lg hover:bg-[#189986] transition-colors shadow-sm"
            >
              Continue
            </button>
          ) : (
             <Link 
              href="/merchant/dashboard"
              className="px-6 py-2.5 bg-neutral-dark text-white text-sm font-bold rounded-lg hover:bg-black transition-colors shadow-sm"
            >
              Go to Dashboard
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
