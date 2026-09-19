"use client";

import React, { useState } from "react";
import type { MerchantOut } from "@/lib/types/merchant";
import { publicShopUrl } from "@/lib/share-links";
import { resolveImageUrl } from "@/lib/api/image-utils";

interface ShareCatalogModalProps {
  merchant: MerchantOut;
  onClose: () => void;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

async function generateStorefrontCardBlob(
  merchant: MerchantOut,
  deepLink: string,
  webLink: string
): Promise<Blob> {
  const width = 1000;
  const height = 1380;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // 1. Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#0B0F17");
  bgGrad.addColorStop(0.5, "#121824");
  bgGrad.addColorStop(1, "#0B0F17");
  drawRoundedRect(0, 0, width, height, 48);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Subtle ambient glow at the top
  const topGlow = ctx.createRadialGradient(width / 2, 220, 20, width / 2, 220, 480);
  topGlow.addColorStop(0, "rgba(14, 159, 136, 0.22)");
  topGlow.addColorStop(1, "rgba(14, 159, 136, 0)");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, height);

  // Outer border
  drawRoundedRect(4, 4, width - 8, height - 8, 44);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 2. Pill Badge: STOREFRONT CATALOG
  const badgeText = "STOREFRONT CATALOG";
  const badgeW = 240;
  const badgeH = 40;
  const badgeX = (width - badgeW) / 2;
  const badgeY = 65;
  drawRoundedRect(badgeX, badgeY, badgeW, badgeH, 20);
  ctx.fillStyle = "#F0FDF4";
  ctx.fill();
  ctx.fillStyle = "#0E9F88";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, width / 2, badgeY + badgeH / 2);

  // 3. Store Name
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 44px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let displayName = merchant.display_name;
  if (displayName.length > 26) {
    displayName = displayName.substring(0, 24) + "...";
  }
  ctx.fillText(displayName, width / 2, 150);

  // 4. Subtitle
  ctx.fillStyle = "#94A3B8";
  ctx.font = "18px system-ui, -apple-system, sans-serif";
  ctx.fillText("Let customers view and preview your catalog inside the app", width / 2, 195);

  // 5. Inner Card Mockup
  const cardX = 80;
  const cardY = 245;
  const cardW = width - 160;
  const cardH = 750;
  drawRoundedRect(cardX, cardY, cardW, cardH, 36);
  const cardBg = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cardBg.addColorStop(0, "rgba(255, 255, 255, 0.04)");
  cardBg.addColorStop(1, "rgba(255, 255, 255, 0.02)");
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 6. Logo Badge
  const logoSize = 90;
  const logoX = width / 2;
  const logoY = cardY + 80;

  let logoDrawn = false;
  if (merchant.logo_url) {
    try {
      const resolvedLogo = resolveImageUrl(merchant.logo_url);
      const res = await fetch(resolvedLogo);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const img = await loadImage(objUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, logoX - logoSize / 2, logoY - logoSize / 2, logoSize, logoSize);
      ctx.restore();
      URL.revokeObjectURL(objUrl);
      logoDrawn = true;
    } catch {
      logoDrawn = false;
    }
  }

  if (!logoDrawn) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
    const grad = ctx.createLinearGradient(logoX - 45, logoY - 45, logoX + 45, logoY + 45);
    grad.addColorStop(0, "#0E9F88");
    grad.addColorStop(1, "#2DD4BF");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(merchant.display_name.charAt(0).toUpperCase(), logoX, logoY);
    ctx.restore();
  }

  // Logo Border
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // 7. QR Code White Box
  const qrBoxSize = 450;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = cardY + 160;
  drawRoundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  ctx.fill();
  ctx.shadowColor = "transparent";

  // QR Code Image (High Res 500x500)
  const qrUrlHighRes = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(deepLink)}&color=111827&margin=10`;
  const qrResponse = await fetch(qrUrlHighRes);
  const qrBlob = await qrResponse.blob();
  const qrObjUrl = URL.createObjectURL(qrBlob);
  const qrImg = await loadImage(qrObjUrl);
  const qrPad = 28;
  ctx.drawImage(qrImg, qrBoxX + qrPad, qrBoxY + qrPad, qrBoxSize - qrPad * 2, qrBoxSize - qrPad * 2);
  URL.revokeObjectURL(qrObjUrl);

  // 8. Shop ID
  const shopId = merchant.shop_id || merchant.partner_id || merchant.id;
  ctx.fillStyle = "#94A3B8";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(shopId, width / 2, cardY + cardH - 50);

  // 9. Shareable Web Link Box
  const linkBoxW = width - 160;
  const linkBoxH = 76;
  const linkBoxX = 80;
  const linkBoxY = 1035;

  // Label above link box
  ctx.fillStyle = "#64748B";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("SHAREABLE WEB LINK", linkBoxX, linkBoxY - 14);

  // Link Container
  drawRoundedRect(linkBoxX, linkBoxY, linkBoxW, linkBoxH, 18);
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Link text
  ctx.fillStyle = "#E2E8F0";
  ctx.font = "500 18px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(webLink, width / 2, linkBoxY + linkBoxH / 2);

  // 10. Footer Branding
  ctx.fillStyle = "#475569";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("POWERED BY SIMULAFLY", width / 2, height - 65);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}

export default function ShareCatalogModal({ merchant, onClose }: ShareCatalogModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

  // Both destinations use the unique shop ID so every QR resolves to the selected shop.
  const shopId = merchant.shop_id || merchant.id;
  const webLink = publicShopUrl(shopId);
  const deepLink = webLink;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(deepLink)}&color=111827&margin=10`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadCard = async () => {
    setDownloadingCard(true);
    try {
      const blob = await generateStorefrontCardBlob(merchant, deepLink, webLink);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${shopId}_storefront_card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Card download failed", err);
    } finally {
      setDownloadingCard(false);
    }
  };

  const handleDownloadQrOnly = async () => {
    setDownloadingQr(true);
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${shopId}_qr_code.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("QR Code download failed", err);
    } finally {
      setDownloadingQr(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Premium blur backdrop */}
      <div
        className="absolute inset-0 bg-[#0B0F17]/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div className="relative flex max-h-[96dvh] w-full max-w-md scale-100 flex-col overflow-y-auto rounded-3xl border border-[#EAECEF]/40 bg-white/95 p-4 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in zoom-in-95 duration-200 dark:border-white/10 dark:bg-[#121824]/95 sm:p-6">

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
            {shopId}
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
              className={`flex items-center justify-center gap-1.5 h-8 px-4 rounded-lg text-[12px] font-semibold transition-all duration-200 ${copied
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

        {/* Download & Actions */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadCard}
              disabled={downloadingCard || downloadingQr}
              className="flex items-center justify-center gap-2 h-10 bg-[#0E9F88] hover:bg-[#0c8c77] text-white text-[12px] font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {downloadingCard ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
              Download Card
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center h-10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-[12px] font-semibold rounded-xl transition-all"
            >
              Close
            </button>
          </div>

          <button
            onClick={handleDownloadQrOnly}
            disabled={downloadingCard || downloadingQr}
            className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            {downloadingQr ? (
              <span className="inline-flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Downloading QR...
              </span>
            ) : (
              "Download raw QR image only"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
