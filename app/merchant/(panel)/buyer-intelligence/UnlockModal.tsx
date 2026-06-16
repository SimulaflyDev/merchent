"use client";

import { useState } from "react";

interface Buyer {
  id: string;
  name: string;
  intentScore: number;
  intentLabel: string;
  savedCount: number;
  interactions: number;
  roomVisualizationCount: number;
  styleAffinity: string;
  cartSignals: number;
  unlocked: boolean;
}

interface UnlockModalProps {
  buyer: Buyer;
  credits: number;
  onClose: () => void;
  onUnlock: (buyerId: string, cost: number) => Promise<void>;
}

export default function UnlockModal({ buyer, credits, onClose, onUnlock }: UnlockModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const cost = buyer.intentScore >= 81 ? 30 : 15;
  const canAfford = credits >= cost;

  const handleUnlock = async () => {
    if (!canAfford) return;
    setIsProcessing(true);
    try {
      await onUnlock(buyer.id, cost);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(onClose, 1500);
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

        {isSuccess ? (
          <div className="p-10 flex flex-col items-center text-center bg-gradient-to-b from-[#F0FDF4] to-white">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-500">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h4 className="text-xl font-bold text-[#111827] mb-1">Signals Unlocked</h4>
            <p className="text-sm text-gray-500">Buying signals for <strong>{buyer.name}</strong> are now permanently visible.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100 bg-[#FAFBFC]">
              <div>
                <p className="text-[10px] font-bold text-[#0E9F88] uppercase tracking-widest mb-1">Engagement Details</p>
                <h3 className="text-lg font-bold text-[#111827]">Unlock Buying Signals</h3>
                <p className="text-xs text-gray-500 mt-0.5">For <span className="font-semibold text-gray-700">{buyer.name}</span></p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors mt-0.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Preview of what will be revealed */}
            <div className="p-6 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">What you'll unlock</p>
              <div className="space-y-2.5">
                {[
                  { icon: "🛋️", text: `Generated ${buyer.roomVisualizationCount} room visualization${buyer.roomVisualizationCount !== 1 ? 's' : ''}`, tier: "Room Intelligence" },
                  { icon: "🎨", text: `High affinity with ${buyer.styleAffinity} style`, tier: "Style Signal" },
                  { icon: "🔁", text: "Revisit frequency & return visits", tier: "Engagement Depth" },
                  { icon: "💾", text: `Saved ${buyer.savedCount} product${buyer.savedCount !== 1 ? 's' : ''}`, tier: "Save Activity" },
                  { icon: "🛒", text: `${buyer.cartSignals} cart interaction${buyer.cartSignals !== 1 ? 's' : ''} detected`, tier: "Cart Intent" },
                  { icon: "📂", text: "Top viewed category & preferred room type", tier: "Discovery Pattern" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#111827] truncate">{item.text}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{item.tier}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing row */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unlock Cost</p>
                  <p className="text-2xl font-bold text-[#111827]">₹{cost}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Credits</p>
                  <p className={`text-2xl font-bold ${canAfford ? 'text-[#0E9F88]' : 'text-red-500'}`}>₹{credits}</p>
                </div>
              </div>

              {!canAfford && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Insufficient credits. Add funds to your wallet to continue.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                disabled={!canAfford || isProcessing}
                className="flex-1 py-3 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Unlocking…</>
                ) : (
                  <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>Reveal Buying Signals</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
