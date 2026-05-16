"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
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

        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-display font-bold text-neutral-dark mb-2 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your merchant dashboard to manage your catalog and track sales.</p>

          <button className="w-full bg-white border border-gray-200 text-neutral-dark font-bold text-sm py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-sm mb-6 flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
               <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); window.location.href='/merchant/dashboard'; }}>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Work Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@acmefurniture.co" 
                className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 focus:border-[#1FAF9A] outline-none text-neutral-dark font-medium transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700">Password</label>
                <Link href="#" className="text-xs font-semibold text-[#1FAF9A] hover:text-[#189986] transition-colors">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-[#F8FAFB] border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1FAF9A]/20 focus:border-[#1FAF9A] outline-none text-neutral-dark font-medium transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="remember" className="rounded border-gray-300 text-[#1FAF9A] focus:ring-[#1FAF9A]" />
              <label htmlFor="remember" className="text-sm text-gray-600 font-medium cursor-pointer">Remember me for 30 days</label>
            </div>

            <button type="submit" className="w-full bg-[#1FAF9A] text-white font-bold text-sm py-3 rounded-lg hover:bg-[#189986] transition-colors shadow-sm mt-4">
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 font-medium">
            Don't have an account? <Link href="/merchant/sign_up" className="text-[#1FAF9A] hover:text-[#189986] transition-colors font-bold">Apply as a brand</Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#F8FAFB] border-l border-gray-100 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1FAF9A]/5 to-transparent"></div>
        
        <div className="max-w-lg relative z-10 text-center">
           <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 inline-block text-left relative transform hover:-translate-y-1 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-neutral-dark">Turn hesitation into sales</h4>
                   <p className="text-xs text-gray-500">Allow users to visualize your products.</p>
                 </div>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[85%] rounded-full"></div>
              </div>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-2 text-right">85% Conversion Lift</p>
           </div>

           <h2 className="text-2xl font-display font-bold text-neutral-dark mb-4">Join the premium merchant network</h2>
           <p className="text-gray-500 font-medium">SimulaFly connects your high-end catalog directly with users ready to visualize and buy.</p>
        </div>
      </div>
    </div>
  );
}
