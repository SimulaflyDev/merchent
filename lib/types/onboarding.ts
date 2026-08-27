export type BusinessType =
  | "sole_proprietorship"
  | "partnership"
  | "llp"
  | "private_limited"
  | "public_limited"
  | "one_person_company"
  | "other";

export type Relationship = "owner" | "partner" | "director" | "authorized_representative";
export type FulfilmentMethod =
  | "merchant_delivery"
  | "customer_pickup"
  | "third_party_delivery"
  | "installation_service";

export interface AddressInput {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface MerchantOnboardingSubmission {
  personal: {
    full_name: string;
    email: string;
    phone: string;
    relationship: Relationship;
  };
  business: {
    business_type: BusinessType;
    other_business_type?: string;
    business_name: string;
    registered_business_name: string;
    business_pan: string;
    registered_address: AddressInput;
  };
  shop: {
    shop_name: string;
    shop_address: AddressInput;
    gstin: string;
    operating_location: string;
    contact_number: string;
    operating_hours: string;
    service_radius_km?: number;
  };
  fulfilment: {
    methods: FulfilmentMethod[];
    delivery_service_radius_km?: number;
    estimated_fulfilment_time: string;
  };
  information_accurate: true;
}
