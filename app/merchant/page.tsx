"use client";

import Link from "next/link";

export default function MerchantLandingPage() {
   return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#022C22] selection:bg-[#10B981]/20">

         {/* Utility Navigation */}
         <nav className="sticky top-0 left-0 right-0 bg-white border-b border-[#E5E7EB] z-50 shadow-sm">
            <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12">
               <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                  <img src="/logo.png" alt="SimulaFly Logo" className="w-8 h-8 object-contain" />
                  <span className="truncate text-base font-extrabold tracking-tight text-[#022C22] sm:text-xl">SimulaFly <span className="hidden sm:inline">Merchant</span></span>
               </div>
               <div className="flex shrink-0 items-center gap-3 sm:gap-8">
                  <Link href="/merchant/sign_in" className="text-xs font-bold text-[#064E3B] transition-colors hover:text-[#10B981] sm:text-sm">
                     <span className="sm:hidden">Login</span><span className="hidden sm:inline">Merchant Login</span>
                  </Link>
                  <Link href="/merchant/sign_up" className="rounded bg-[#059669] px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#047857] hover:shadow-md sm:px-6 sm:py-2.5 sm:text-sm">
                     <span className="sm:hidden">Apply</span><span className="hidden sm:inline">Apply to Sell</span>
                  </Link>
               </div>
            </div>
         </nav>

         {/* Hero Section */}
         <section className="bg-white w-full border-b border-[#E5E7EB]">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[1920px] bg-[#FAFAFA] sm:aspect-video">
               <img
                  src="/d1b26a1c-5c7b-4b3f-926b-990bf71e0097.png"
                  alt="SimulaFly Merchant Hero"
                  className="w-full h-full object-cover"
               />
            </div>
         </section>

         {/* Elevated "Why Sell Here" Grid (The Problem/Outcome) */}
         <section className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-12 sm:py-20">
            <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12">
               <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-[#022C22] sm:mb-12 sm:text-3xl">Why sell on SimulaFly?</h2>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                  {/* Card 1 */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                     <div className="bg-[#ECFDF5] p-6 border-b border-[#E5E7EB] group-hover:bg-[#059669] transition-colors duration-300 flex items-center justify-between">
                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-[#059669] group-hover:text-[#10B981]">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                        <span className="text-[#059669] group-hover:text-white font-mono text-sm opacity-50 font-bold">01</span>
                     </div>
                     <div className="p-6 sm:p-8">
                        <h3 className="font-extrabold text-xl mb-3 text-[#022C22]">Show products where people live</h3>
                        <p className="text-base text-[#064E3B] leading-relaxed font-medium">
                           Customers already understand the product. They see scale, fit, and context instantly without relying on guesswork.
                        </p>
                     </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                     <div className="bg-[#ECFDF5] p-6 border-b border-[#E5E7EB] group-hover:bg-[#059669] transition-colors duration-300 flex items-center justify-between">
                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-[#059669] group-hover:text-[#10B981]">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="text-[#059669] group-hover:text-white font-mono text-sm opacity-50 font-bold">02</span>
                     </div>
                     <div className="p-6 sm:p-8">
                        <h3 className="font-extrabold text-xl mb-3 text-[#022C22]">Reduce hesitation</h3>
                        <p className="text-base text-[#064E3B] leading-relaxed font-medium">
                           Help customers decide faster. When spatial and color objections are removed visually, the path to checkout is frictionless.
                        </p>
                     </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                     <div className="bg-[#ECFDF5] p-6 border-b border-[#E5E7EB] group-hover:bg-[#059669] transition-colors duration-300 flex items-center justify-between">
                        <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-[#059669] group-hover:text-[#10B981]">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="text-[#059669] group-hover:text-white font-mono text-sm opacity-50 font-bold">03</span>
                     </div>
                     <div className="p-6 sm:p-8">
                        <h3 className="font-extrabold text-xl mb-3 text-[#022C22]">Bring more ready buyers</h3>
                        <p className="text-base text-[#064E3B] leading-relaxed font-medium">
                           Make products easy to understand. Highly qualified traffic means you spend less time convincing and more time selling.
                        </p>
                     </div>
                  </div>

               </div>
            </div>
         </section>

         {/* Operational Workflow Engine */}
         <section className="border-b border-[#E5E7EB] bg-white py-12 sm:py-20">
            <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12">

               <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                  {/* Left: Operational Timeline */}
                  <div className="w-full lg:w-1/3">
                     <h2 className="mb-10 text-2xl font-extrabold tracking-tight text-[#022C22] sm:text-3xl">How it works for merchants</h2>

                     <div className="relative border-l-2 border-dashed border-[#E5E7EB] pl-8 space-y-10">
                        <div className="relative">
                           <div className="absolute -left-[43px] top-0 w-8 h-8 bg-white border-2 border-[#E5E7EB] rounded-full flex items-center justify-center font-bold text-sm text-[#064E3B] shadow-sm">1</div>
                           <h4 className="font-extrabold text-lg text-[#022C22]">Upload your products</h4>
                           <p className="text-sm text-[#064E3B] mt-2 font-medium leading-relaxed">Securely manage your SKUs and 3D models. Our pipeline automatically optimizes files for mobile delivery.</p>
                        </div>
                        <div className="relative">
                           <div className="absolute -left-[43px] top-0 w-8 h-8 bg-white border-2 border-[#E5E7EB] rounded-full flex items-center justify-center font-bold text-sm text-[#064E3B] shadow-sm">2</div>
                           <h4 className="font-extrabold text-lg text-[#022C22]">Customers see them in real homes</h4>
                           <p className="text-sm text-[#064E3B] mt-2 font-medium leading-relaxed">Shoppers visualize items instantly in their actual living spaces using advanced mobile AR.</p>
                        </div>
                        <div className="relative">
                           <div className="absolute -left-[43px] top-0 w-8 h-8 bg-white border-2 border-[#E5E7EB] rounded-full flex items-center justify-center font-bold text-sm text-[#064E3B] shadow-sm">3</div>
                           <h4 className="font-extrabold text-lg text-[#022C22]">Buyers arrive more confident</h4>
                           <p className="text-sm text-[#064E3B] mt-2 font-medium leading-relaxed">Visual and spatial objections are eliminated before the customer even reaches the checkout page.</p>
                        </div>
                        <div className="relative">
                           <div className="absolute -left-[43px] top-0 w-8 h-8 bg-[#059669] border-2 border-[#059669] rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm ring-4 ring-[#ECFDF5]">4</div>
                           <h4 className="font-extrabold text-lg text-[#059669]">You spend less time convincing</h4>
                           <p className="text-sm text-[#064E3B] mt-2 font-medium leading-relaxed">Stop answering questions about dimensions and color matching. Focus purely on fulfillment and scale.</p>
                        </div>
                     </div>
                  </div>

                  {/* Right: Detailed Catalog Health Mockup */}
                  <div className="w-full lg:w-2/3 flex items-center">
                     <div className="w-full border border-[#E5E7EB] rounded-xl bg-white shadow-xl overflow-hidden flex flex-col">
                        <div className="bg-[#FAFAFA] border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                              </div>
                              <div>
                                 <h3 className="text-sm font-extrabold text-[#022C22]">Catalog Health Engine</h3>
                                 <p className="text-[10px] text-[#064E3B] font-mono">Syncing 1,240 items</p>
                              </div>
                           </div>
                           <span className="px-3 py-1 bg-[#ECFDF5] text-[#059669] rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-[#10B981]/30">Healthy</span>
                        </div>
                        <div className="p-6 space-y-6">
                           {/* Progress Bar Item */}
                           <div>
                              <div className="flex justify-between items-end mb-2">
                                 <div>
                                    <h4 className="text-xs font-extrabold text-[#022C22]">3D Asset Processing</h4>
                                    <p className="text-[10px] text-[#064E3B] font-medium mt-0.5">Converting .OBJ files to mobile-ready .GLB format</p>
                                 </div>
                                 <span className="text-xs font-bold text-[#022C22] tabular-nums">84%</span>
                              </div>
                              <div className="w-full h-2 bg-[#FAFAFA] border border-[#E5E7EB] rounded-full overflow-hidden">
                                 <div className="h-full bg-[#10B981] relative">
                                    <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)' }}></div>
                                 </div>
                              </div>
                           </div>

                           {/* Progress Bar Item */}
                           <div>
                              <div className="flex justify-between items-end mb-2">
                                 <div>
                                    <h4 className="text-xs font-extrabold text-[#022C22]">AI Semantic Indexing</h4>
                                    <p className="text-[10px] text-[#064E3B] font-medium mt-0.5">Generating search vectors for natural language discovery</p>
                                 </div>
                                 <span className="text-xs font-bold text-[#022C22] tabular-nums">100%</span>
                              </div>
                              <div className="w-full h-2 bg-[#FAFAFA] border border-[#E5E7EB] rounded-full overflow-hidden">
                                 <div className="w-full h-full bg-[#059669]"></div>
                              </div>
                           </div>

                           {/* Operational Flags */}
                           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB]">
                              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-4">
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Warnings</span>
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <span className="text-sm font-extrabold text-[#022C22]">12 SKUs</span>
                                 </div>
                                 <p className="text-[10px] text-[#064E3B] mt-1 font-medium">Missing dimensions data</p>
                              </div>
                              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-4">
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Optimization</span>
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                                    <span className="text-sm font-extrabold text-[#022C22]">Ready</span>
                                 </div>
                                 <p className="text-[10px] text-[#064E3B] mt-1 font-medium">All assets under 5MB target</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Seller University Video Portal (Highly Polished) */}
         <section className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-12 sm:py-20">
            <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12">
               <div className="flex justify-between items-end mb-10">
                  <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#022C22] sm:text-3xl">Seller Resources</h2>
                     <p className="text-sm text-[#064E3B] mt-2 font-medium">Learn from top brands scaling with SimulaFly.</p>
                  </div>
                  <Link href="#" className="hidden md:inline-flex px-6 py-2.5 bg-white border border-[#E5E7EB] text-[#022C22] text-sm font-bold rounded-lg hover:border-[#059669] hover:text-[#059669] transition-all shadow-sm">
                     View Full Library
                  </Link>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                  {/* Video Module 1 */}
                  <div className="group cursor-pointer">
                     <div className="relative aspect-video rounded-xl border border-[#E5E7EB] overflow-hidden mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300">
                        {/* Pseudo-photorealistic background via CSS gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#022C22] to-[#064E3B] opacity-90"></div>
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #10B981 0%, transparent 50%)', opacity: 0.2 }}></div>

                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 z-10">
                           <span className="text-white font-extrabold text-2xl tracking-tight drop-shadow-md">Brand X Case Study</span>
                           <span className="text-[#10B981] text-[10px] font-bold mt-2 uppercase tracking-widest border border-[#10B981]/30 bg-[#10B981]/10 px-2 py-0.5 rounded backdrop-blur-sm">Success Story</span>
                        </div>

                        {/* Glassmorphism Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                           <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                              <svg className="w-8 h-8 text-white ml-1 drop-shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                           </div>
                        </div>

                        {/* Duration Pill */}
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-bold z-10 tabular-nums shadow-sm">
                           05:12
                        </div>
                     </div>
                     <h3 className="font-extrabold text-base text-[#022C22] leading-tight group-hover:text-[#059669] transition-colors">How Brand X reduced returns by 40%</h3>
                     <p className="text-sm text-[#064E3B] mt-1.5 font-medium">Deep dive into spatial visualization ROI.</p>
                  </div>

                  {/* Video Module 2 */}
                  <div className="group cursor-pointer">
                     <div className="relative aspect-video rounded-xl border border-[#E5E7EB] overflow-hidden mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#064E3B] to-[#10B981] opacity-90"></div>
                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>

                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 z-10">
                           <svg className="w-10 h-10 text-white opacity-90 mb-3 drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                           <span className="text-white font-extrabold text-xl tracking-tight drop-shadow-md">Technical Walkthrough</span>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                           <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                              <svg className="w-8 h-8 text-white ml-1 drop-shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                           </div>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-bold z-10 tabular-nums shadow-sm">
                           03:45
                        </div>
                     </div>
                     <h3 className="font-extrabold text-base text-[#022C22] leading-tight group-hover:text-[#059669] transition-colors">Complete Onboarding Guide</h3>
                     <p className="text-sm text-[#064E3B] mt-1.5 font-medium">Learn how to configure your catalog API.</p>
                  </div>

                  {/* Video Module 3 */}
                  <div className="group cursor-pointer">
                     <div className="relative aspect-video rounded-xl border border-[#E5E7EB] overflow-hidden mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300 bg-[#FAFAFA]">
                        <div className="flex w-full h-full relative z-10 p-2 gap-2">
                           <div className="flex-1 bg-[#E5E7EB]/50 border border-[#E5E7EB] rounded-lg flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==')]"></div>
                              <span className="text-[10px] font-extrabold text-[#064E3B] uppercase tracking-widest bg-white/80 px-2 py-1 rounded backdrop-blur-sm shadow-sm">Before</span>
                           </div>
                           <div className="flex-1 bg-[#059669] border border-[#10B981] rounded-lg flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                              <span className="text-[10px] font-extrabold text-[#ECFDF5] uppercase tracking-widest bg-black/20 px-2 py-1 rounded backdrop-blur-sm shadow-sm border border-white/10">After AR</span>
                           </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                           <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                              <svg className="w-8 h-8 text-white ml-1 drop-shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                           </div>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-bold z-10 tabular-nums shadow-sm">
                           02:30
                        </div>
                     </div>
                     <h3 className="font-extrabold text-base text-[#022C22] leading-tight group-hover:text-[#059669] transition-colors">Customer Journey Breakdown</h3>
                     <p className="text-sm text-[#064E3B] mt-1.5 font-medium">Visualizing the path to purchase.</p>
                  </div>

               </div>
            </div>
         </section>

         {/* Utility Footer */}
         <footer className="border-t-4 border-[#059669] bg-[#022C22] px-4 py-12 text-sm text-white sm:px-6 sm:py-16 lg:px-12">
            <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-12">
               <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-3 mb-6">
                     <img src="/logo.png" alt="SimulaFly Logo" className="w-10 h-10 object-contain brightness-0 invert" />
                     <span className="font-extrabold text-xl tracking-tight text-white">SimulaFly Merchant</span>
                  </div>
                  <p className="text-[#E5E7EB] mb-4 max-w-md font-medium leading-relaxed opacity-80">
                     Helping customers understand products before they buy, so merchants spend less time convincing and more time selling. Built for modern furniture and home brands.
                  </p>
               </div>

               <div>
                  <h4 className="font-extrabold mb-5 text-[#FAFAFA] tracking-wide">Make Money with Us</h4>
                  <ul className="space-y-4">
                     <li><Link href="/merchant/sign_up" className="text-[#E5E7EB] hover:text-white hover:underline transition-all font-medium">Apply to Sell</Link></li>
                     <li><Link href="/merchant/sign_in" className="text-[#E5E7EB] hover:text-white hover:underline transition-all font-medium">Merchant Login</Link></li>
                     <li><Link href="#" className="text-[#E5E7EB] hover:text-white hover:underline transition-all font-medium">Partner Program</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-extrabold mb-5 text-[#FAFAFA] tracking-wide">Let Us Help You</h4>
                  <ul className="space-y-4">
                     <li><Link href="#" className="text-[#E5E7EB] hover:text-white hover:underline transition-all font-medium">Onboarding Guide</Link></li>
                     <li><Link href="#" className="text-[#E5E7EB] hover:text-white hover:underline transition-all font-medium">Contact Sales</Link></li>
                     <li><a href="https://simulafly.com/privacy-policy-for-website" target="_blank" rel="noopener noreferrer" className="text-[#E5E7EB] hover:text-white hover:underline transition-all font-medium">Privacy Policy</a></li>
                     <li><a href="https://simulafly.com/terms-and-conditions-for-website" target="_blank" rel="noopener noreferrer" className="text-[#E5E7EB] hover:text-white hover:underline transition-all font-medium">Terms &amp; Conditions</a></li>
                  </ul>
               </div>
            </div>
            <div className="w-full max-w-[1600px] mx-auto mt-16 pt-8 border-t border-[#064E3B] text-center text-xs text-[#E5E7EB] font-medium opacity-60">
               &copy; 2026 SimulaFly Inc. All rights reserved.
            </div>
         </footer>
      </div>
   );
}
