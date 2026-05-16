"use client";

import Link from "next/link";

export default function MerchantLandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#1FAF9A]/20">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1FAF9A] to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-neutral-dark">SimulaFly</span>
            <span className="text-xs font-bold text-[#1FAF9A] bg-[#1FAF9A]/10 px-2 py-0.5 rounded-full ml-1">For Brands</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/merchant/sign_in" className="text-sm font-semibold text-gray-600 hover:text-neutral-dark transition-colors">
              Log in
            </Link>
            <Link href="/merchant/sign_up" className="px-5 py-2.5 bg-neutral-dark text-white text-sm font-semibold rounded-full hover:bg-black transition-colors shadow-sm">
              Apply to Sell
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#1FAF9A]/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1FAF9A]/10 text-[#1FAF9A] text-xs font-bold tracking-widest uppercase mb-4">
             <span className="w-2 h-2 rounded-full bg-[#1FAF9A] animate-pulse"></span>
             Now Accepting Partners
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-neutral-dark tracking-tight leading-[1.1]">
            Turn empty rooms into <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1FAF9A] to-teal-600">
              your showrooms.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Stop losing sales to imagination. Join SimulaFly's marketplace to let customers drop your 3D furniture models directly into their own homes before they buy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/merchant/sign_up" className="w-full sm:w-auto px-8 py-4 bg-[#1FAF9A] text-white text-base font-bold rounded-full hover:bg-[#189986] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200">
              Apply as a Partner Brand
            </Link>
            <Link href="/merchant/sign_in" className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-neutral-dark text-base font-bold rounded-full hover:bg-gray-50 transition-colors">
              Merchant Login
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="py-24 px-6 bg-[#F8FAFB]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold text-neutral-dark tracking-tight mb-4">Why sell on SimulaFly?</h2>
            <p className="text-gray-500">Traditional e-commerce relies on guessing. We rely on seeing. By joining our merchant network, you unlock an entirely new way to convert high-ticket buyers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow">
               <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                 <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
               </div>
               <h3 className="text-xl font-bold text-neutral-dark mb-3 tracking-tight">Eradicate Return Regret</h3>
               <p className="text-sm text-gray-500 leading-relaxed">
                 Freight returns are devastating to margins. Because SimulaFly users visualize exactly how your furniture fits their room's dimensions and aesthetic, return rates drop drastically.
               </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow">
               <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                 <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
               </div>
               <h3 className="text-xl font-bold text-neutral-dark mb-3 tracking-tight">85% Higher Conversion</h3>
               <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                  When buyers see a $2,000 sofa visualized perfectly by our AI, hesitation vanishes. AI-guided products see an average 85% lift in conversion compared to standard catalogs.
                </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow">
               <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                 <svg className="w-7 h-7 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
               </div>
               <h3 className="text-xl font-bold text-neutral-dark mb-3 tracking-tight">High-Intent Leads</h3>
               <p className="text-sm text-gray-500 leading-relaxed">
                 You aren't just buying clicks; you're connecting with users who have taken the time to actively 3D-scan their rooms. They are highly qualified buyers actively looking to furnish.
               </p>
            </div>

          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-neutral-dark text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-[#1FAF9A]/20 rounded-full blur-[100px] -z-10"></div>
         
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
               
               <div className="w-full lg:w-1/2 space-y-8">
                 <h2 className="text-4xl font-display font-bold tracking-tight">How the integration works.</h2>
                 <p className="text-gray-400 text-lg">Our merchant panel is designed to be as effortless as Amazon Seller Central, but built specifically for 3D spatial commerce.</p>
                 
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-[#1FAF9A]/20 text-[#1FAF9A] font-bold flex items-center justify-center shrink-0">1</div>
                       <div>
                         <h4 className="font-bold text-white text-lg">Upload your catalog</h4>
                         <p className="text-sm text-gray-400 mt-1">Easily drag and drop your `.glb` or `.usdz` 3D product models into our secure Product Information Management (PIM) dashboard.</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-[#1FAF9A]/20 text-[#1FAF9A] font-bold flex items-center justify-center shrink-0">2</div>
                       <div>
                         <h4 className="font-bold text-white text-lg">Sync pricing & stock</h4>
                         <p className="text-sm text-gray-400 mt-1">Set attributes, dimensions, and connect the buy buttons directly to your own checkout flow or handle it natively via Stripe.</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-[#1FAF9A]/20 text-[#1FAF9A] font-bold flex items-center justify-center shrink-0">3</div>
                       <div>
                         <h4 className="font-bold text-white text-lg">Users visualize & buy</h4>
                         <p className="text-sm text-gray-400 mt-1">Your products immediately populate in the SimulaFly app. Users drop them into their scanned rooms and purchase with absolute confidence.</p>
                       </div>
                    </div>
                 </div>
               </div>

               {/* Mock Dashboard Visual */}
               <div className="w-full lg:w-1/2">
                  <div className="rounded-2xl border border-gray-800 shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                     <img 
                       src="/merchant_dashboard.png" 
                       alt="SimulaFly Merchant Dashboard Preview" 
                       className="w-full h-auto object-cover"
                     />
                  </div>
               </div>
               
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 text-center">
         <p className="text-sm font-bold text-neutral-dark mb-2">SimulaFly Merchant Network</p>
         <p className="text-xs text-gray-500">&copy; 2026 SimulaFly Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
