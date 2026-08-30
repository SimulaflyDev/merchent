"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

import type { MerchantOut } from "@/lib/types/merchant";
import type { WalletOut } from "@/lib/types/wallet";

// --- Types ---
// Phase 1 retains the full Lead/Product type definitions from the original mock
// so unconverted pages compile. Later phases will replace these with real fetches.
export type LeadStatus = "New Order" | "Order Confirmed" | "Converted" | "Cancelled Orders";
export type LeadType = "direct_purchase" | "cart_abandonment" | "high_intent_view";

export interface Lead {
  id: string;
  date: string;
  time: string;
  items: number;
  total: number;
  status: LeadStatus;
  type: LeadType;
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
  };
  aiInteractions: number; // How many times they interacted with AI before this lead was generated
  aiGeneratedImage: string | null; // The image the customer generated using the product
  products: { name: string; qty: number; price: number; sku: string; img: string }[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  img: string | null;
  colorCode?: string;
}

export interface ProductDimensions {
  width?: string;
  height?: string;
  depth?: string;
  weight?: string;
  seatHeight?: string;
  tableHeight?: string;
  recommendedRoomSize?: string;
}

export interface ProductMaterials {
  primary?: string;
  finish?: string;
  upholsteryType?: string;
}

export interface ProductVisibility {
  status: "Public" | "Hidden" | "Private Draft" | "Scheduled";
  featured: boolean;
  priorityTags: string[];
}

export interface RoomStorytelling {
  placements: string[];
  bestUsedIn: string;
  pairsWellWith: string;
  mood: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  date: string;
  price: number;
  sellPrice: number;
  stock: number;
  status: "Draft" | "Pending Review" | "Ready to Publish" | "Published" | "Out of Stock" | "Archived" | "Draft List" | "Inactive";
  img: string;

  // New V2 Structured Fields
  purchaseDestination?: "SimulaFly Checkout" | "External Website" | "Amazon" | "Shopify" | "Manual inquiry";
  merchantNotes?: string;

  v2Dimensions?: ProductDimensions;
  v2Materials?: ProductMaterials;
  colors?: { primary: string; secondary: string };
  variants?: ProductVariant[];
  roomStorytelling?: RoomStorytelling;
  visibility?: ProductVisibility;

  inventory?: {
    lowStockWarning: number;
    preorder: boolean;
    madeToOrder: boolean;
  };

  media?: {
    additionalAngles: string[];
    lifestyleImages: string[];
    spatialFileUrl: string | null;
  };

  // Basic Details
  searchQuery?: string;
  brand?: string;
  rating?: number;
  asin?: string;
  url?: string;
  color?: string;
  material?: string;
  dimensions?: string;
  aboutThisItem?: string;
  specifications?: { key: string; value: string }[];
  customerInterest?: { saves: number; views: number; placements: number };

  // Legacy AI metrics (Optional now)
  aiMentions?: number;
  aiConversions?: number;

  // Analytics Fields
  impressions: number;
  clicks: number;
  ctr: number;
  aiImageGenerations?: number;
  leadsGenerated: number;
  convertedLeads: number;
  tokenSpend: number;    // in INR
  ragQueries: { query: string; count: number; conversionRate: number }[];
  ctrTrend: number[];    // last 7 days of CTR
  impressionTrend: number[];  // last 7 days of impressions
  healthScore: 'good' | 'review' | 'mismatch' | 'paused';
  aiRelevanceScore: number;   // 0-100
  healthReason: string;       // plain-language explanation
}

export interface ToastMessage {
  message: string;
  type: "success" | "info";
}

interface MerchantContextProps {
  merchant: MerchantOut | null;          // Phase 1: real
  wallet: WalletOut | null;              // Phase 3
  leads: Lead[];                         // Phase 5
  products: Product[];                   // Phase 2
  walletBalance: number;                 // Phase 3 (legacy — use wallet.balance instead)
  toast: ToastMessage | null;
  isLoading: boolean;
  loadError: string | null;
  updateLeadStatus: (id: string, newStatus: LeadStatus) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  showToast: (message: string, type?: "success" | "info") => void;
  hideToast: () => void;
}

const MerchantCtx = createContext<MerchantContextProps | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
  activeMerchantId: string;
  initialMerchant: MerchantOut;
  initialWallet: WalletOut | null;
}

export const MerchantProvider = ({ children, activeMerchantId: _activeMerchantId, initialMerchant, initialWallet }: ProviderProps) => {
  const [merchant, setMerchant] = useState<MerchantOut | null>(initialMerchant);
  const [wallet, setWallet] = useState<WalletOut | null>(initialWallet);
  const isLoading = false;
  const [loadError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Empty placeholders for later phases — page components still reference them.
  const [leads] = useState<Lead[]>([]);
  const [products] = useState<Product[]>([]);
  const [walletBalance] = useState<number>(0);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };
  const hideToast = () => setToast(null);
  const updateLeadStatus = () => { /* no-op until Phase 5 */ };
  const updateProduct = () => { /* no-op until Phase 2 */ };

  return (
    <MerchantCtx.Provider
      value={{
        merchant,
        wallet,
        leads,
        products,
        walletBalance,
        toast,
        isLoading,
        loadError,
        updateLeadStatus,
        updateProduct,
        showToast,
        hideToast,
      }}
    >
      {children}
    </MerchantCtx.Provider>
  );
};

export const useMerchant = () => {
  const c = useContext(MerchantCtx);
  if (!c) throw new Error("useMerchant must be used within a MerchantProvider");
  return c;
};
