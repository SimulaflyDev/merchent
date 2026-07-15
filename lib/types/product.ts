export type ProductStatus =
  | "draft"
  | "published"
  | "paused_insufficient_funds"
  | "archived";


export interface Dimensions {
  width?: number | string;
  height?: number | string;
  depth?: number | string;
  weight?: number | string;
  [key: string]: unknown;
}

export interface Materials {
  primary?: string;
  finish?: string;
  upholstery_type?: string;
  [key: string]: unknown;
}

export interface Colors {
  primary?: string;
  secondary?: string;
  [key: string]: unknown;
}

export interface RoomStorytelling {
  placements?: string[];
  best_used_in?: string;
  pairs_well_with?: string;
  mood?: string;
  [key: string]: unknown;
}

export interface MerchantProductOut {
  id: string;
  merchant_id: string;
  sku: string;
  title: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  status: ProductStatus;

  primary_image_url: string | null;
  additional_images: string[];

  dimensions: Dimensions;
  materials: Materials;
  colors: Colors;
  room_storytelling: RoomStorytelling;
  custom_metadata: Record<string, unknown>;

  has_simulafly_listing: boolean;
  in_app_price: number | null;
  in_app_stock: number | null;

  ai_relevance_score: number | null;
  health_score: string;
  health_reason: string | null;



  created_at: string;
  updated_at: string;
}

export interface MerchantProductCreatePayload {
  sku: string;
  title: string;
  description?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  status?: ProductStatus;
  primary_image_url?: string;
  additional_images?: string[];
  dimensions?: Dimensions;
  materials?: Materials;
  colors?: Colors;
  room_storytelling?: RoomStorytelling;
  custom_metadata?: Record<string, unknown>;
  has_simulafly_listing?: boolean;
  in_app_price?: number;
  in_app_stock?: number;
  shop_ids?: string[];
}

export interface MerchantProductUpdatePayload {
  sku?: string;
  title?: string;
  description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  primary_image_url?: string | null;
  additional_images?: string[];
  dimensions?: Dimensions;
  materials?: Materials;
  colors?: Colors;
  room_storytelling?: RoomStorytelling;
  custom_metadata?: Record<string, unknown>;
  has_simulafly_listing?: boolean;
  in_app_price?: number | null;
  in_app_stock?: number | null;
}

export interface PaginatedProducts {
  items: MerchantProductOut[];
  total: number;
  limit: number;
  offset: number;
}
