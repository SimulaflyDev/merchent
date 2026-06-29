"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setActiveMerchantAction } from "@/lib/auth/actions";
import { resolveImageUrl } from "@/lib/api/image-utils";
import type { MerchantOut } from "@/lib/types/merchant";

interface Props {
  shops: MerchantOut[];
  activeMerchantId: string | null;
}

// Harmonious colors for profile card avatars fallback
const AVATAR_COLORS = [
  "from-[#1F9583] to-[#0E9F88]", // Greenish
  "from-[#5F3AFE] to-[#4828E8]", // Violet
  "from-[#FF5E62] to-[#FF9966]", // Sunset Coral
  "from-[#11998E] to-[#38EF7D]", // Emerald
  "from-[#F857A6] to-[#FF5858]", // Magenta
];

export default function SelectShopClient({ shops, activeMerchantId }: Props) {
  const router = useRouter();
  const [selecting, setSelecting] = useState<string | null>(null);

  const handleSelect = async (shopId: string) => {
    setSelecting(shopId);
    try {
      await setActiveMerchantAction(shopId);
      router.push("/merchant/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Failed to select shop:", err);
      setSelecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-[#0F172A] flex flex-col items-center justify-center font-sans px-4 select-none animate-in fade-in duration-700">
      {/* Netflix Profile Switcher Box styled in Premium Light Theme */}
      <div className="max-w-4xl w-full text-center space-y-10">
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-[#0F172A] animate-in slide-in-from-top-6 duration-700">
          Who's managing today?
        </h1>

        {/* Profile Card Grid */}
        <div className="flex flex-wrap justify-center gap-8 pt-4">
          {shops.map((shop, index) => {
            const initials = shop.display_name.slice(0, 2).toUpperCase();
            const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
            const isCurrentlyActive = shop.id === activeMerchantId;
            const isSelectingThis = selecting === shop.id;

            return (
              <div
                key={shop.id}
                onClick={() => !selecting && handleSelect(shop.id)}
                className="group flex flex-col items-center cursor-pointer space-y-3 w-[130px] sm:w-[150px] relative transition-transform duration-300 transform hover:scale-105 active:scale-95"
              >
                {/* Profile Avatar Card */}
                <div className="relative">
                  <div
                    className={`w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-3xl bg-gradient-to-br ${avatarColor} flex items-center justify-center font-extrabold text-3xl sm:text-4xl shadow-md relative border-2 border-transparent transition-all duration-300 group-hover:border-[#0E9F88] group-hover:shadow-[0_10px_30px_rgba(14,159,136,0.15)] overflow-hidden`}
                  >
                    {shop.logo_url ? (
                      <img
                        src={resolveImageUrl(shop.logo_url)}
                        alt={shop.display_name}
                        className="w-full h-full object-cover bg-white"
                      />
                    ) : (
                      <span className="text-white">{initials}</span>
                    )}

                    {/* Active highlight overlay */}
                    {isCurrentlyActive && (
                      <div className="absolute inset-0 bg-[#0E9F88]/10 backdrop-blur-[1px] flex items-center justify-center border-4 border-[#0E9F88] rounded-3xl">
                        <span className="absolute top-2 right-2 bg-[#0E9F88] text-white p-1 rounded-full shadow-lg">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      </div>
                    )}

                    {/* Loader */}
                    {isSelectingThis && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-3xl">
                        <svg className="animate-spin w-8 h-8 text-[#0E9F88]" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Name */}
                <div className="text-center w-full">
                  <p className="text-[14px] sm:text-[16px] font-bold text-gray-700 group-hover:text-[#0E9F88] transition-colors truncate">
                    {shop.display_name}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    {shop.shop_id || "mXXXX"}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Add New Shop Profile Card (Netflix-style adjusted to light) */}
          <div
            onClick={() => !selecting && router.push("/merchant/add_shop")}
            className="group flex flex-col items-center cursor-pointer space-y-3 w-[130px] sm:w-[150px] relative transition-transform duration-300 transform hover:scale-105 active:scale-95"
          >
            <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-3xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center hover:border-[#0E9F88] hover:bg-white transition-all duration-300 shadow-sm">
              <svg className="w-10 h-10 text-gray-400 group-hover:text-[#0E9F88] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div className="text-center w-full">
              <p className="text-[14px] sm:text-[16px] font-bold text-gray-500 group-hover:text-[#0E9F88] transition-colors">
                Add Shop
              </p>
            </div>
          </div>
        </div>

        {/* Manage shops button at bottom */}
        <div className="pt-12">
          <button
            onClick={() => router.push("/merchant/shops")}
            className="px-6 py-2.5 border border-gray-300 hover:border-[#0E9F88] text-gray-500 hover:text-[#0E9F88] text-[12px] sm:text-[13px] font-bold tracking-widest uppercase rounded transition-colors duration-300 bg-white shadow-sm"
          >
            Manage Shops
          </button>
        </div>
      </div>
    </div>
  );
}
