# SimulaFly Merchant Panel: Comprehensive UI/UX, Architecture, & Backend Integration Master Plan

## 1. Executive Summary & Core Architectural Philosophy

This document serves as the absolute source of truth and granular implementation blueprint for the SimulaFly Merchant Panel frontend and backend architecture. The objective is to construct a dedicated, highly operational B2B frontend interface that empowers merchants to seamlessly manage their storefronts, upload complex product catalogs, track inventory, and manage customer orders.

### 1.1 The Shift to a Tokenized Advertising Model
The platform operates on a **Pay-Per-Interaction (Credit) System** similar to Google Ads. Merchants do not pay flat subscription fees; instead, they purchase "Platform Tokens" (Wallet Balance). Every time a user interacts with a merchant's product in the SimulaFly App (e.g., viewing in AR, clicking "Buy", or being recommended by the AI RAG system), micro-credits are deducted from the merchant's wallet. 

If a merchant's wallet balance hits zero, their products are automatically paused and removed from the active AR/RAG indexing pool until funds are replenished.

### 1.2 Aesthetic & UX Synchronization
The Merchant Panel strikes a delicate balance between the high-density operational utility of platforms like Amazon Seller Central and an ultra-premium, modern SaaS aesthetic.
- **Spacing & Density:** The UI utilizes strict Tailwind spacing grids (`gap-4`, `p-5`, `grid-cols-12`) to ensure data density without wide, wasted blank spaces.
- **Color Palette:** Backgrounds use `#F8FAFB`. Content cards use `#FFFFFF`. Actionable items use the SimulaFly brand Teal (`#1FAF9A`). Destructive or warning actions use `red-500` or `amber-500`.
- **Typography:** Modern sans-serif (`Inter`). Data tables use `tabular-nums`. 

---

## 2. Database Schema & API Contract (The Backend Foundation)

To support the new Advertising & Tokenized Billing system alongside the PIM (Product Information Management), the Prisma schema is significantly expanded.

### 2.1 Product & Catalog Schema
```prisma
model Product {
  id              String   @id @default(uuid())
  merchant_id     String
  sku             String   @unique
  title           String
  category        String?
  description     String?  @db.Text
  price           Float
  image_url       String?
  model_3d_url    String?  // The .glb or .usdz file
  product_url     String?
  metadata        Json?    // Custom attributes (e.g., color, material)
  
  // Operational Status
  status          String   @default("active") // "active", "draft", "paused_insufficient_funds"
  
  // Analytics Relations
  impressions     ImpressionEvent[]
  clicks          ClickEvent[]
  ai_mentions     AiMentionEvent[]

  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}
```

### 2.2 Wallet & Billing Architecture
Merchants must maintain a pre-paid balance. Transactions record money added, while Ledgers record micro-deductions.
```prisma
model Wallet {
  id              String   @id @default(uuid())
  merchant_id     String   @unique
  balance         Float    @default(0.0) // Current available tokens/fiat
  status          String   @default("active") // "active", "depleted"
  last_recharged  DateTime?
}

model Transaction {
  id              String   @id @default(uuid())
  merchant_id     String
  amount          Float    // Money added via payment gateway
  currency        String   @default("USD")
  payment_method  String   // "upi", "credit_card"
  gateway_ref     String   // Stripe or Razorpay transaction ID
  status          String   // "successful", "failed", "pending"
  created_at      DateTime @default(now())
}

// Micro-transactions for interactions
model LedgerEntry {
  id              String   @id @default(uuid())
  merchant_id     String
  product_id      String
  event_type      String   // "click", "ar_view", "ai_rag_mention"
  deduction       Float    // e.g., -0.10 tokens
  timestamp       DateTime @default(now())
}
```

### 2.3 Advanced Analytics & AI RAG Tracking
We track exactly how products are performing to show merchants their ROI.
```prisma
model ImpressionEvent {
  id              String   @id @default(uuid())
  product_id      String
  user_session_id String
  context         String   // "search", "category_browse"
  timestamp       DateTime @default(now())
}

model ClickEvent {
  id              String   @id @default(uuid())
  product_id      String
  user_session_id String
  converted       Boolean  @default(false)
  timestamp       DateTime @default(now())
}

model AiMentionEvent {
  id              String   @id @default(uuid())
  product_id      String
  prompt_context  String   // What the user asked the AI (e.g., "Need a modern blue sofa")
  relevance_score Float    // How closely the product matched the prompt
  timestamp       DateTime @default(now())
}
```

---

## 3. Interface Structure & Routing Architecture

### 3.1 Persistent Shell Layout (`app/merchant/(panel)/layout.tsx`)
The Sidebar contains the following dense, actionable navigation items:
1. **Dashboard** (`/merchant/dashboard`): High-level KPIs.
2. **Products** (`/merchant/products`): PIM catalog management.
3. **Analytics** (`/merchant/analytics`): Deep dive into clicks, impressions, AI RAG performance, and category mismatches.
4. **Billing & Tokens** (`/merchant/billing`): Wallet balance, Top-up UI (UPI/Cards), and transaction history.
5. **Orders/CRM** (`/merchant/orders`): Traditional order tracking.
6. **Settings** (`/merchant/settings`): Profile and team management.

---

## 4. Core Pages & UI/UX Component Specifications

### 4.1 Billing & Token Management (`/merchant/billing`)
This is the financial heart of the platform.

#### 4.1.1 Wallet Overview & Top-Up
The top of the page features a prominent widget displaying current balance.
- **Low Balance Warning:** If the balance drops below a threshold (e.g., 50 tokens), a persistent amber warning banner appears: *"Low Balance: Your products will be paused if your balance reaches zero."*
- **Add Funds Modal:** A highly polished slide-out or modal offering predefined top-up tiers (e.g., $50, $100, $500). 
- **Payment Gateway UI:** Integration with Razorpay (for India/UPI) and Stripe (Global Cards). The UI will show distinct, clickable tiles for "Pay via UPI", "Credit/Debit Card", and "Net Banking".

#### 4.1.2 Balance Used History (Ledger Table)
A dense, horizontally scrolling table showing micro-deductions.
- **Columns:** Date/Time | Interaction Type (Click, AI Mention) | Product Name | Deduction Amount | Running Balance.
- **Filters:** Date range picker, filter by interaction type.

### 4.2 Advanced Analytics Panel (`/merchant/analytics`)
This dashboard proves the ROI of the SimulaFly platform to the merchant.

#### 4.2.1 Product Performance Matrix
A data table evaluating how each product is performing in the AR and AI ecosystem.
- **Product Shown (Impressions):** How many times it appeared in standard search results.
- **Product Clicked:** How many users clicked to view details or buy.
- **AI RAG Mentions:** A unique metric showing how many times the SimulaFly AI Assistant specifically recommended this product to a user based on semantic search matching.
- **Spend (Tokens Used):** The total cost incurred by this product over the selected date range.
- **ROAS (Return on Ad Spend):** Estimated revenue generated vs. tokens spent.

#### 4.2.2 Diagnostic Alerts (The "Not Performing" Widget)
A dedicated side-panel highlighting issues with the catalog:
- **Zero-Click Products:** Highlights products with high impressions but 0 clicks (suggesting bad thumbnail or high price).
- **Category Mismatch:** AI flags if a product (e.g., a "Chair") is frequently failing to surface because its metadata lacks keywords or is categorized incorrectly.
- **Low AI Relevance:** Alerts the merchant if a product has poor textual descriptions, causing the RAG system to ignore it during user queries.

### 4.3 Add Product Interface (`/merchant/products/add`)
The creation form remains critical, but now emphasizes metadata for the RAG system.
- **Dynamic Metadata:** Extensive key-value pairs (Color, Material, Style, Dimensions) are now *mandatory* to ensure the AI RAG system can successfully recommend the product.
- **3D Model Upload:** Drag-and-drop zone for `.glb` and `.usdz` files.

### 4.4 The Dashboard (`/merchant/dashboard`)
A high-level synthesis of Analytics and Billing.
- **Live Spend Tracker:** A small widget tracking real-time token burn rate for the day.
- **Top Performing Product:** A visual card showing the product with the highest AI Mentions and Clicks.

---

## 5. API Implementation Strategy

### 5.1 Payment Gateway Webhooks
1. **Endpoint:** `POST /api/v1/webhooks/payments`
2. **Logic:** Receives successful payment callbacks from Stripe/Razorpay.
3. **Action:** Updates `Transaction` status to "successful", increments `Wallet.balance`, and unpauses any products with `status == "paused_insufficient_funds"`.

### 5.2 The Interaction Deductor Service
A highly optimized, low-latency background service handling the Google Ads style billing.
1. When a user clicks a product in the consumer app, it hits `POST /api/v1/events/click`.
2. The endpoint logs a `ClickEvent`.
3. It creates a `LedgerEntry` for `-0.50` tokens.
4. It decrements the `Wallet.balance`.
5. If `Wallet.balance <= 0`, it triggers a batch update to set all products for that `merchant_id` to `paused_insufficient_funds` and dispatches an email alert.

---

## 6. Execution Roadmap

1. **Phase 1: Prisma Schema Expansion:** Implement the new Wallet, Ledger, and Analytics models in the backend codebase.
2. **Phase 2: Billing Frontend (`/merchant/billing`):** Build the payment UI, top-up modal, and transaction history tables. Integrate Stripe/Razorpay testing environments.
3. **Phase 3: Analytics Frontend (`/merchant/analytics`):** Build the complex data tables for RAG AI Mentions, Clicks, and Diagnostics.
4. **Phase 4: App Integration / Event Triggers:** Wire the consumer-facing AR interactions to trigger the micro-deduction API endpoints.
5. **Phase 5: Automated Pausing Logic:** Implement the background cron jobs and webhooks that automatically toggle product visibility based on wallet balances.
