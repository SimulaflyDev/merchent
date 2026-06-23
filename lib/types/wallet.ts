export type WalletStatus = "active" | "depleted" | "frozen";
export type TransactionStatus = "pending" | "successful" | "failed";
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

export interface WalletOut {
  id: string;
  merchant_id: string;
  balance: number;
  currency: string;
  status: WalletStatus;
  low_balance_threshold: number;
  last_recharged_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionOut {
  id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod | null;
  gateway: string;
  gateway_ref: string | null;
  razorpay_order_id: string | null;
  status: TransactionStatus;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTransactions {
  items: TransactionOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface TopupIntentResponse {
  order_id: string;
  razorpay_key_id: string;
  amount: number;
  currency: string;
  transaction_id: string;
}

export interface BalanceHistoryItemProduct {
  title: string;
  sku: string;
  image_url: string | null;
}

export interface BalanceHistoryItem {
  id: string;
  created_at: string;
  amount: number;
  entry_type: string;
  reason: string;
  payment_method: string | null;
  gateway_ref: string | null;
  running_balance: number;
  product: BalanceHistoryItemProduct | null;
}

export interface BalanceHistoryResponse {
  items: BalanceHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface RedeemResponse {
  message: string;
  balance: number;
  credit_amount: number;
}

