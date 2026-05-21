"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Types ---
export type LeadStatus = "New Lead" | "Synced" | "Converted" | "Lost";
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
  type: 'success' | 'info';
}

interface MerchantContextProps {
  leads: Lead[];
  products: Product[];
  walletBalance: number;
  toast: ToastMessage | null;
  isLoading: boolean;
  updateLeadStatus: (id: string, newStatus: LeadStatus) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
  hideToast: () => void;
}

const MerchantContext = createContext<MerchantContextProps | undefined>(undefined);

// --- Mock Data ---
const initialLeads: Lead[] = [
  {
    id: "L-35878087",
    date: "22.12.21",
    time: "14:32",
    items: 2,
    total: 185000,
    status: "New Lead",
    type: "direct_purchase",
    customer: { name: "Rahul Sharma", email: "rahul.s@example.com", phone: "+91 98765 43210", city: "Mumbai" },
    aiInteractions: 4,
    aiGeneratedImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    products: [
      { name: "Oak Dining Table", qty: 1, price: 150000, sku: "OAK-DT-01", img: "bg-[#D4A373]" },
      { name: "Modern Floor Lamp", qty: 1, price: 35000, sku: "MFL-01", img: "bg-[#E9C46A]" }
    ]
  },
  {
    id: "L-35878088",
    date: "22.12.21",
    time: "10:15",
    items: 1,
    total: 120000,
    status: "Synced",
    type: "high_intent_view",
    customer: { name: "Priya Patel", email: "priya.p@example.com", phone: "+91 99887 77665", city: "Delhi" },
    aiInteractions: 12,
    aiGeneratedImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    products: [
      { name: "Velvet Sofa (Blue)", qty: 1, price: 120000, sku: "BLU-VS-02", img: "bg-[#2A9D8F]" }
    ]
  },
  {
    id: "L-35878089",
    date: "21.12.21",
    time: "18:45",
    items: 3,
    total: 45000,
    status: "Converted",
    type: "direct_purchase",
    customer: { name: "Amit Kumar", email: "amit.k@example.com", phone: "+91 91234 56789", city: "Bangalore" },
    aiInteractions: 2,
    aiGeneratedImage: null,
    products: [
      { name: "Abstract Rug", qty: 1, price: 25000, sku: "AB-RUG-01", img: "bg-[#E76F51]" },
      { name: "Accent Chair", qty: 2, price: 10000, sku: "AC-CH-01", img: "bg-[#7A5B4C]" }
    ]
  },
  {
    id: "L-35878090",
    date: "21.12.21",
    time: "09:30",
    items: 1,
    total: 8000,
    status: "Lost",
    type: "cart_abandonment",
    customer: { name: "Neha Gupta", email: "neha.g@example.com", phone: "+91 98888 77777", city: "Pune" },
    aiInteractions: 1,
    aiGeneratedImage: null,
    products: [
      { name: "Desk Organizer", qty: 1, price: 8000, sku: "DO-01", img: "bg-gray-400" }
    ]
  }
];

const initialProducts: Product[] = [
  { 
    id: "#PRD109283", name: "Oak Dining Table", category: "Furniture", date: "1 Jan 2025", price: 100000, sellPrice: 150000, stock: 45, status: "Published", img: "bg-[#D4A373]", 
    aiMentions: 1420, aiConversions: 89,
    impressions: 4200, clicks: 210, ctr: 5.0, aiImageGenerations: 140, leadsGenerated: 45, convertedLeads: 22, tokenSpend: 420,
    ragQueries: [
      { query: "modern dining table for 6-seater", count: 85, conversionRate: 15.2 },
      { query: "oak wood furniture for my kitchen", count: 42, conversionRate: 12.5 },
      { query: "farmhouse style dining set", count: 13, conversionRate: 8.0 }
    ],
    ctrTrend: [4.8, 4.9, 5.1, 5.0, 5.2, 4.9, 5.0],
    impressionTrend: [580, 610, 590, 620, 600, 615, 585],
    healthScore: 'good', aiRelevanceScore: 92,
    healthReason: "Strong CTR and conversion from core category queries."
  },
  { 
    id: "#PRD843701", name: "Velvet Sofa (Blue)", category: "Furniture", date: "1 Feb 2025", price: 80000, sellPrice: 120000, stock: 12, status: "Published", img: "bg-[#2A9D8F]", 
    aiMentions: 890, aiConversions: 45,
    impressions: 3100, clicks: 52, ctr: 1.6, aiImageGenerations: 8, leadsGenerated: 3, convertedLeads: 1, tokenSpend: 68,
    ragQueries: [
      { query: "blue couch for living room", count: 6, conversionRate: 2.1 },
      { query: "velvet 3 seater sofa", count: 2, conversionRate: 1.0 }
    ],
    ctrTrend: [2.5, 2.2, 1.9, 1.8, 1.7, 1.5, 1.6],
    impressionTrend: [450, 440, 460, 430, 445, 435, 440],
    healthScore: 'review', aiRelevanceScore: 68,
    healthReason: "Low AI Relevance: Description lacks material, dimensions, and style keywords to boost recommendations."
  },
  { 
    id: "#PRD397512", name: "Modern Floor Lamp", category: "Decor", date: "1 Feb 2025", price: 20000, sellPrice: 35000, stock: 100, status: "Published", img: "bg-[#E9C46A]", 
    aiMentions: 560, aiConversions: 110,
    impressions: 1800, clicks: 120, ctr: 6.6, aiImageGenerations: 95, leadsGenerated: 35, convertedLeads: 18, tokenSpend: 150,
    ragQueries: [
      { query: "standing lamp for reading", count: 50, conversionRate: 18.0 },
      { query: "gold minimalist floor lamp", count: 45, conversionRate: 22.5 }
    ],
    ctrTrend: [6.1, 6.3, 6.4, 6.5, 6.7, 6.6, 6.6],
    impressionTrend: [250, 260, 245, 255, 265, 250, 275],
    healthScore: 'good', aiRelevanceScore: 88,
    healthReason: "Excellent conversion on style-specific search queries."
  },
  { 
    id: "#PRD650384", name: "Abstract Rug", category: "Decor", date: "1 Feb 2025", price: 15000, sellPrice: 25000, stock: 0, status: "Out of Stock", img: "bg-[#E76F51]", 
    aiMentions: 340, aiConversions: 20,
    impressions: 0, clicks: 0, ctr: 0, aiImageGenerations: 0, leadsGenerated: 0, convertedLeads: 0, tokenSpend: 0,
    ragQueries: [],
    ctrTrend: [0, 0, 0, 0, 0, 0, 0],
    impressionTrend: [0, 0, 0, 0, 0, 0, 0],
    healthScore: 'paused', aiRelevanceScore: 40,
    healthReason: "Product is currently hidden from the AI app because your balance is too low or it is out of stock."
  },
];

export const MerchantProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [walletBalance, setWalletBalance] = useState<number>(2400.00);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const hideToast = () => setToast(null);

  const updateLeadStatus = (id: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(prod => prod.id === id ? { ...prod, ...updates } : prod));
  };

  return (
    <MerchantContext.Provider value={{ leads, products, walletBalance, toast, isLoading, updateLeadStatus, updateProduct, showToast, hideToast }}>
      {children}
    </MerchantContext.Provider>
  );
};

export const useMerchant = () => {
  const context = useContext(MerchantContext);
  if (context === undefined) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
};
