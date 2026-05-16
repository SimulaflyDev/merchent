"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative py-12">
        {/* Logo */}
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1FAF9A] to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-neutral-dark">SimulaFly</span>
            <span className="text-xs font-bold text-[#1FAF9A] bg-[#1FAF9A]/10 px-2 py-0.5 rounded-full ml-1">Merchant</span>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto mt-12 lg:mt-0">
          <h1 className="text-3xl font-display font-bold text-neutral-dark mb-2 tracking-tight">Apply as a Brand</h1>
          <p className="text-sm text-gray-500 mb-8">Join the platform to allow users to visualize your products in their own space.</p>

          <button className="w-full bg-white border border-gray-200 text-neutral-dark font-bold text-sm py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-sm mb-6 flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
               <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or apply with email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href='/merchant/onboarding'; }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">First Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Sarah" 
                  className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 focus:border-[#1FAF9A] outline-none text-neutral-dark font-medium transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Last Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Jenkins" 
                  className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 focus:border-[#1FAF9A] outline-none text-neutral-dark font-medium transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Company Name</label>
              <input 
                type="text" 
                required
                placeholder="Acme Furniture Co." 
                className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 focus:border-[#1FAF9A] outline-none text-neutral-dark font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Work Email</label>
              <input 
                type="email" 
                required
                placeholder="sarah@acmefurniture.co" 
                className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 focus:border-[#1FAF9A] outline-none text-neutral-dark font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 focus:border-[#1FAF9A] outline-none text-neutral-dark font-medium transition-colors"
              />
              <p className="text-[10px] text-gray-400 mt-1.5">Must be at least 8 characters.</p>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full bg-[#1FAF9A] text-white font-bold text-sm py-3 rounded-lg hover:bg-[#189986] transition-colors shadow-sm">
                Create Account
              </button>
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              By creating an account, you agree to our <Link href="#" className="text-gray-600 hover:text-neutral-dark underline">Terms of Service</Link> and <Link href="#" className="text-gray-600 hover:text-neutral-dark underline">Privacy Policy</Link>.
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 font-medium">
            Already have an account? <Link href="/merchant/sign_in" className="text-[#1FAF9A] hover:text-[#189986] transition-colors font-bold">Sign In</Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#F8FAFB] border-l border-gray-100 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1FAF9A]/5 to-transparent"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#1FAF9A]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-lg relative z-10 text-center">
           
           {/* Mock UI Element floating */}
           <div className="relative mx-auto w-64 h-64 bg-white rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-100 mb-8 p-6 flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-500">
              <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-red-400"></div>
              <div className="absolute top-4 left-9 w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="absolute top-4 left-14 w-3 h-3 rounded-full bg-emerald-400"></div>
              
              <div className="w-24 h-24 bg-gray-50 rounded-xl mb-4 border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden relative">
                 {/* Mock 3D box SVG */}
                 <svg className="w-12 h-12 text-[#1FAF9A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <h4 className="text-sm font-bold text-neutral-dark mb-1">Upload 3D Models</h4>
              <p className="text-[10px] text-gray-400 max-w-[150px]">Drag and drop .glb or .usdz files to let users experience your products.</p>
           </div>

           <h2 className="text-2xl font-display font-bold text-neutral-dark mb-4">Empower your catalog</h2>
           <p className="text-gray-500 font-medium">Join 500+ premium brands using AI Guided Selling to close high-ticket sales faster.</p>
        </div>
      </div>
    </div>
  );
}
