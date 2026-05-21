"use client";

import { useState } from 'react';
import { Product } from '../../context/MerchantContext';

interface ProductPreviewModalProps {
  product: Product;
  onClose: () => void;
}

type PreviewMode = 'customer' | 'room' | 'merchant';

export function ProductPreviewModal({ product, onClose }: ProductPreviewModalProps) {
  const [mode, setMode] = useState<PreviewMode>('customer');

  const price = product.variants?.[0]?.price || product.sellPrice || 0;
  const saves = product.customerInterest?.saves || (((product.name || '').length * 3) % 50) + 12;
  const views = product.customerInterest?.views || (((product.name || '').length * 47) % 2000) + 340;
  const isUrl = product.img && !product.img.startsWith('bg-') && product.img !== 'bg-gray-100';

  const MODES: { key: PreviewMode; label: string }[] = [
    { key: 'customer', label: 'Customer View' },
    { key: 'room', label: 'Room Placement' },
    { key: 'merchant', label: 'Merchant Preview' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0a0f1e]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 mb-5">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all duration-150 ${
                mode === m.key
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >{m.label}</button>
          ))}
        </div>

        {/* Phone Chrome */}
        <div className="relative">
          {/* Outer bezel */}
          <div className="w-[300px] bg-[#111827] rounded-[44px] p-[10px] shadow-[0_40px_80px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)]">
            {/* Inner screen */}
            <div className="bg-white rounded-[36px] overflow-hidden" style={{ height: '600px' }}>
              {/* Status bar */}
              <div className="bg-[#111827] h-9 flex items-center justify-between px-6 shrink-0">
                <span className="text-white text-[10px] font-bold">9:41</span>
                <div className="w-16 h-4 bg-[#111827] rounded-full border border-white/20" /> {/* notch */}
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M1 6.5l4-4 4 4-4 4-4-4zm8 0l4-4 4 4-4 4-4-4zm8 0l4-4 4 4-4 4-4-4z" opacity="0"/><path d="M1.414 0L0 1.414l2 2A12.96 12.96 0 0 0 0 12h2a11 11 0 0 1 1.938-6.235l1.453 1.453A8.965 8.965 0 0 0 4 12h2a7 7 0 0 1 1.063-3.672l1.46 1.46A4.968 4.968 0 0 0 8 12h2c0-.61.11-1.19.31-1.726l1.47 1.47A2.983 2.983 0 0 0 12 12a3 3 0 0 0 3-3 2.983 2.983 0 0 0-.244-.81l1.47-1.47C16.89 7.31 17 7.39 17 8"/></svg>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
                </div>
              </div>

              {/* Screen Content */}
              <div className="flex-1 overflow-y-auto bg-white" style={{ height: 'calc(600px - 36px)', scrollbarWidth: 'none' }}>

                {/* ── Customer View ──────────────────────────────────────── */}
                {mode === 'customer' && (
                  <>
                    {/* Hero image */}
                    <div className="relative aspect-[4/5] bg-[#F3F4F6] overflow-hidden">
                      {isUrl ? (
                        <img src={product.img} className="absolute inset-0 w-full h-full object-cover" alt={product.name} />
                      ) : (
                        <div className={`absolute inset-0 ${product.img || 'bg-gray-200'}`} />
                      )}
                      {/* Room tag */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[9px] font-black text-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm">
                        {product.roomStorytelling?.placements?.[0] || 'Room Config'}
                      </div>
                      {/* Wishlist */}
                      <button className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                      </button>
                    </div>

                    {/* Product info */}
                    <div className="px-5 py-5">
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SimulaFly Brand</p>
                        <div className="flex items-center gap-0.5">
                          <svg className="w-3 h-3 fill-black" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          <span className="text-[11px] font-bold text-black">4.9</span>
                        </div>
                      </div>
                      <h4 className="text-[18px] font-black text-black leading-tight tracking-tight mb-2">{product.name || 'Product Title'}</h4>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-[22px] font-black text-black">₹{price.toLocaleString('en-IN')}</span>
                        {product.price && price < product.price && (
                          <span className="text-sm text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {product.variants?.[0]?.name && <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">{product.variants[0].name}</span>}
                        {product.roomStorytelling?.mood && <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">{product.roomStorytelling.mood}</span>}
                      </div>
                      <div className="space-y-2.5 pt-4 border-t border-gray-100 mb-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                          </div>
                          <span className="text-[11px] font-semibold text-gray-600">Saved by {saves} shoppers</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                          </div>
                          <span className="text-[11px] font-semibold text-gray-600">Viewed in {views} living rooms</span>
                        </div>
                      </div>
                      <button className="w-full bg-black text-white py-3.5 rounded-full font-bold text-[12px] uppercase tracking-widest hover:bg-gray-800 transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </>
                )}

                {/* ── Room Placement View ───────────────────────────────── */}
                {mode === 'room' && (
                  <div className="p-5">
                    <p className="text-[10px] font-bold text-[#1FAF9A] uppercase tracking-widest mb-3">Seen Mostly In</p>
                    <div className="space-y-2 mb-5">
                      {(product.roomStorytelling?.placements?.length ? product.roomStorytelling.placements : ['Living Room', 'Studio Apartment', 'Japandi Layout']).map((room, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#F0FDF9] border border-emerald-100 rounded-xl px-4 py-3">
                          <span className="text-[12px] font-bold text-[#111827]">{room}</span>
                          <div className="w-16 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1FAF9A] rounded-full" style={{ width: `${100 - i * 25}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="aspect-square bg-[#F3F4F6] rounded-2xl overflow-hidden relative mb-4">
                      {isUrl ? (
                        <img src={product.img} className="absolute inset-0 w-full h-full object-cover" alt={product.name} />
                      ) : (
                        <div className={`absolute inset-0 ${product.img || 'bg-gray-200'}`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-black text-[15px] leading-tight">{product.name}</p>
                        <p className="text-white/70 text-[10px] font-medium mt-1">{product.roomStorytelling?.mood || 'Modern Aesthetic'}</p>
                      </div>
                    </div>
                    <div className="bg-[#F7FFFE] border border-emerald-100 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-2">Environment Context</p>
                      <p className="text-[11px] text-[#374151] font-medium leading-relaxed">
                        {product.roomStorytelling?.bestUsedIn || `This product pairs best with ${product.roomStorytelling?.placements?.[0] || 'living room'} layouts. Shoppers frequently combine it with complementary Japandi pieces.`}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Merchant Preview ──────────────────────────────────── */}
                {mode === 'merchant' && (
                  <div className="p-5">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-4">Listing Intelligence</p>
                    <div className="space-y-3">
                      <div className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-4">
                        <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wide mb-1">Publishing Readiness</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1FAF9A] rounded-full" style={{ width: `${product.aiRelevanceScore || 60}%` }} />
                          </div>
                          <span className="text-[12px] font-black text-[#111827]">{product.aiRelevanceScore || 60}%</span>
                        </div>
                        <p className="text-[10px] text-[#9CA3AF] mt-2 leading-relaxed">{product.healthReason || 'Complete all listing fields to improve discoverability in room configurations.'}</p>
                      </div>
                      <div className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-4">
                        <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wide mb-3">Performance Snapshot</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Impressions', value: (product.impressions || 0).toLocaleString() },
                            { label: 'Clicks', value: (product.clicks || 0).toLocaleString() },
                            { label: 'Shopper Saves', value: String(product.customerInterest?.saves || 12) },
                            { label: 'Leads', value: String(product.leadsGenerated || 0) },
                          ].map(s => (
                            <div key={s.label} className="bg-white border border-gray-100 rounded-lg p-2.5 text-center">
                              <p className="text-[15px] font-black text-[#111827]">{s.value}</p>
                              <p className="text-[9px] text-[#9CA3AF] font-medium mt-0.5">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Side buttons */}
          <div className="absolute -right-[3px] top-[120px] w-[3px] h-12 bg-[#1a2234] rounded-r-full" />
          <div className="absolute -left-[3px] top-[100px] w-[3px] h-8 bg-[#1a2234] rounded-l-full" />
          <div className="absolute -left-[3px] top-[120px] w-[3px] h-14 bg-[#1a2234] rounded-l-full" />
          <div className="absolute -left-[3px] top-[148px] w-[3px] h-14 bg-[#1a2234] rounded-l-full" />
        </div>

        <p className="text-white/30 text-[10px] font-medium mt-5 uppercase tracking-widest">Click backdrop to close</p>
      </div>
    </div>
  );
}
