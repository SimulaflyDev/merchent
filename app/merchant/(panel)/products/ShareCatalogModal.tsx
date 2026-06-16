"use client";

import React, { useState } from "react";
import type { MerchantOut } from "@/lib/types/merchant";
import { resolveImageUrl } from "@/lib/api/image-utils";

interface ShareCatalogModalProps {
  merchant: MerchantOut;
  onClose: () => void;
}

export default function ShareCatalogModal({ merchant, onClose }: ShareCatalogModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Generate deep link and web sharing URLs
  const deepLink = `simulafly://merchant/${merchant.referral_code || merchant.slug || merchant.id}`;
  const webLink = `https://simulafly.com/m/${merchant.referral_code || merchant.slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(deepLink)}&color=111827&margin=10`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // fallback
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${merchant.slug || "merchant"}_qr_code.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("QR Code download failed", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Premium blur backdrop */}
      <div 
        className="absolute inset-0 bg-[#0B0F17]/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Dialog container */}
      <div className="relative bg-white/95 dark:bg-[#121824]/95 border border-[#EAECEF]/40 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl backdrop-blur-xl transition-all scale-100 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#111827] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all duration-200 focus:outline-none"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Store Title */}
        <div className="text-center mb-5">
          <span className="text-[10px] font-bold text-[#0E9F88] tracking-widest uppercase bg-[#F0FDF4] px-2.5 py-1 rounded-full">
            Storefront Catalog
          </span>
          <h2 className="text-[20px] font-bold text-[#111827] dark:text-white tracking-tight mt-3">
            {merchant.display_name}
          </h2>
          <p className="text-[12px] text-gray-400 mt-1">
            Let customers view and preview your catalog inside the app
          </p>
        </div>

        {/* Card Mockup & QR Code */}
        <div className="bg-gradient-to-tr from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 border border-[#EAECEF]/50 dark:border-white/5 rounded-2xl p-5 mb-5 flex flex-col items-center shadow-inner">
          
          {/* Mock Storefront logo/initial */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0E9F88] to-teal-400 flex items-center justify-center text-white text-[16px] font-bold shadow-md shadow-[#0E9F88]/20 mb-4 overflow-hidden border-2 border-white dark:border-[#121824]">
            {merchant.logo_url ? (
              <img src={resolveImageUrl(merchant.logo_url)} alt="" className="w-full h-full object-cover" />
            ) : (
              merchant.display_name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Dynamic high-res QR code */}
          <div className="bg-white p-3.5 rounded-2xl shadow-lg border border-[#EAECEF]/30 relative group transition-transform hover:scale-[1.02] duration-200">
            <img 
              src={qrCodeUrl} 
              alt="Deep Link QR Code" 
              className="w-44 h-44 object-contain"
            />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
          </div>
          
          <span className="text-[10px] text-gray-400 font-mono tracking-wider mt-3">
            {merchant.referral_code || `SL-${merchant.slug.toUpperCase()}`}
          </span>
        </div>

        {/* Copy Shareable Link */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
            Shareable Web Link
          </label>
          <div className="flex bg-gray-50 dark:bg-[#1C2533] border border-[#EAECEF] dark:border-white/5 rounded-xl overflow-hidden p-1.5 items-center">
            <input 
              type="text" 
              readOnly 
              value={webLink} 
              className="flex-1 bg-transparent px-3 text-[12px] font-medium text-gray-600 dark:text-gray-300 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center justify-center gap-1.5 h-8 px-4 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
                copied 
                  ? "bg-[#0E9F88] text-white shadow-sm" 
                  : "bg-[#111827] dark:bg-white text-white dark:text-[#111827] hover:bg-black dark:hover:bg-white/90"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Download & Social actions */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 h-10 border border-[#EAECEF] dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 text-gray-700 dark:text-gray-200 text-[12px] font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
          >
            {downloading ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            Download QR
          </button>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center h-10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-[12px] font-semibold rounded-xl transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
