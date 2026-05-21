"use client";

/**
 * Spinner — rotating circle loader
 * 
 * Variants:
 *   fullscreen  → centered on the entire viewport with faded background
 *   page        → centered within the panel content area (below header)
 *   inline      → small inline spinner next to text
 */

interface SpinnerProps {
  variant?: "fullscreen" | "page" | "inline";
  label?: string;
}

export default function Spinner({ variant = "page", label }: SpinnerProps) {
  const circle = (size: string) => (
    <svg
      className={`animate-spin ${size}`}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="#EAECEF"
        strokeWidth="4"
      />
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="#111827"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="31.4 94.2"
      />
    </svg>
  );

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-2">
        {circle("w-4 h-4")}
        {label && <span className="text-[12px] text-gray-500 font-medium">{label}</span>}
      </span>
    );
  }

  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
        {circle("w-10 h-10")}
        {label && <p className="text-[13px] text-gray-500 font-medium animate-pulse">{label}</p>}
      </div>
    );
  }

  // page — fills the panel content area
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      {circle("w-8 h-8")}
      {label && <p className="text-[12px] text-gray-400 font-medium">{label}</p>}
    </div>
  );
}
