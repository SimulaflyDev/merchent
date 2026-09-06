export type BackendLeadStatus = "new" | "synced" | "converted" | "lost";
export type BackendLeadType =
  | "direct_purchase"
  | "cart_abandonment"
  | "high_intent_view";

export interface CustomerInfo {
  city: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  state: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface OrderItemOut {
  product_id: string;
  variant_id: string | null;
  qty: number;
  price_at_capture: number;
  title: string;
  img_url: string | null;
  sku: string;
}

export interface OrderOut {
  id: string;
  status: string;
  items: OrderItemOut[];
  subtotal_estimated: number;
  total_estimated: number;
  coupon_code: string | null;
  discount_amount: number;
  accepted_at: string | null;
  fee_charged_at: string | null;
  platform_fee_amount: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BuyerLeadOut {
  id: string;
  merchant_id: string;
  lead_type: BackendLeadType;
  status: BackendLeadStatus;
  estimated_value: number;
  ai_interactions_count: number;
  ai_generated_image_url: string | null;
  delivery_city: string | null;
  merchant_notes: string | null;
  cancellation_reason: { parent_reason: string; child_reason: string; note?: string } | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
  customer: CustomerInfo;
  order: OrderOut | null;
}

export interface PaginatedLeads {
  items: BuyerLeadOut[];
  total: number;
  limit: number;
  offset: number;
}

// ── UI-friendly Lead (used by orders page + LeadDrawer) ─────────────────────

export type LeadStatus = "New Order" | "Order Confirmed" | "Converted" | "Cancelled Orders";
export type LeadType = BackendLeadType;

export interface LeadProduct {
  name: string;
  qty: number;
  price: number;
  sku: string;
  img: string;
}

export interface Lead {
  id: string;
  date: string;
  time: string;
  items: number;
  subtotal: number;
  total: number;
  couponCode: string | null;
  discountAmount: number;
  status: LeadStatus;
  type: LeadType;
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    address_line1: string | null;
    state: string | null;
    pincode: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  aiInteractions: number;
  aiGeneratedImage: string | null;
  products: LeadProduct[];
}

/** Map backend status → UI status label. */
export function mapLeadStatus(s: BackendLeadStatus): LeadStatus {
  const m: Record<BackendLeadStatus, LeadStatus> = {
    new: "New Order",
    synced: "Order Confirmed",
    converted: "Converted",
    lost: "Cancelled Orders",
  };
  return m[s] ?? "New Order";
}

/** Map UI status label → backend status. */
export function reverseLeadStatus(s: LeadStatus): BackendLeadStatus {
  const m: Record<LeadStatus, BackendLeadStatus> = {
    "New Order": "new",
    "Order Confirmed": "synced",
    Converted: "converted",
    "Cancelled Orders": "lost",
  };
  return m[s];
}

/** Convert a BuyerLeadOut from the API into the UI Lead shape. */
export function adaptLead(raw: BuyerLeadOut): Lead {
  const d = new Date(raw.created_at);
  const products: LeadProduct[] = raw.order
    ? raw.order.items.map((i) => ({
        name: i.title,
        qty: i.qty,
        price: i.price_at_capture,
        sku: i.sku,
        img: i.img_url ?? "",
      }))
    : [];

  return {
    id: raw.id.slice(0, 8).toUpperCase(),
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    items: products.length,
    subtotal: Number(raw.order?.subtotal_estimated ?? raw.estimated_value),
    total: Number(raw.estimated_value),
    couponCode: raw.order?.coupon_code ?? null,
    discountAmount: Number(raw.order?.discount_amount ?? 0),
    status: mapLeadStatus(raw.status),
    type: raw.lead_type,
    customer: {
      name: raw.status === "new"
        ? "New Order"
        : raw.status === "lost"
          ? "canceled user"
          : (raw.customer.name ?? "Protected Customer"),
      email: raw.customer.email ?? "",
      phone: raw.customer.phone ?? "",
      city: raw.customer.city ?? "",
      address_line1: raw.customer.address_line1 ?? null,
      state: raw.customer.state ?? null,
      pincode: raw.customer.pincode ?? null,
      latitude: raw.customer.latitude ?? null,
      longitude: raw.customer.longitude ?? null,
    },
    aiInteractions: raw.ai_interactions_count,
    aiGeneratedImage: raw.ai_generated_image_url,
    products,
  };
}
