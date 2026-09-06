# SimulaFly Merchant Platform — Features & Operations Guide

Welcome to the **SimulaFly Merchant Platform**. This document provides an exhaustive reference of all portal features, event-tracking mechanics, billing models, and workflow systems available to merchants on our platform.

---

## 1. Platform Concept & Value Proposition
SimulaFly connects your furniture and home decor inventory to an immersive 3D/AI-powered visualization app used by consumers. 

Instead of traditional cost-per-click advertising or passive listings, SimulaFly operates on a **Pay-Per-Interaction (PPI) and Lead-Capture model**:
1. **Interactive Visualization**: Buyers place and style your products in custom virtual room images powered by generative AI.
2. **Behavioral Tracking**: Every interaction (RAG chat mentions, AI room placements, external clicks, in-app checkout) is recorded.
3. **High-Intent Lead Capture**: Anonymous buyer profiles are built automatically based on engagement patterns and made available for you to unlock and convert off-platform.

---

## 2. Platform Features Directory

### 2.1 Interactive Dashboard
The central command center for your store operations.
- **KPI Metrics Grid**: Displays real-time metrics for Impressions, Clicks, Click-Through Rate (CTR), AI Mentions, and Total Wallet Spend.
- **Live Spend Ticker**: Client-side island that streams wallet consumption dynamically.
- **Wallet Overview Widget**: Quick view of current balance, wallet health status, and quick recharge actions.

### 2.2 Product Catalog Management
Manage the lifecycle of your digital showroom.
- **Dual Purchase Paths**:
  - *SimulaFly Checkout*: Surfaced as a "Buy on SimulaFly" in-app checkout lead form.
- **Rich Spatial Metadata**: Store product dimensions (width, height, depth), materials, colors, and room storytelling hints (e.g., "pairs well with", "best used in").
- **AI Vector Search Indexing**: When you create or update a product's title, description, or categories, the platform automatically regenerates a `3072-dimensional vector embedding`. This indexing makes your products immediately searchable in the consumer AI Chat/RAG engine.
- **Bulk Product Import**: Import your entire collection via CSV/JSON with support for `create`, `upsert`, and `replace_all` upload modes.

### 2.3 Billing & Wallet System
A prepaid wallet drives all product visibility.
- **Razorpay Payment Integration**: Instant recharge using Cards, UPI, Netbanking, or Wallets directly within the portal.
- **Automatic Budget Safeguards (Low Balance)**:
  - You can set a custom `low_balance_threshold` (Default: ₹500.00).
  - If your wallet drops below the threshold, a warning banner is shown.
  - If the wallet hits **₹0.00**, your published products are instantly hidden/paused (`paused_insufficient_funds` status) to prevent unpaid exposure. Recharging automatically unpauses and republiches them.
- **Ledger Audit Trail**: Complete ledger table mapping every credit (recharge) and debit (interaction fee) with unique transaction keys for accounting.

### 2.4 Buyer Intelligence
Turn anonymous browsers into clients.
- **Interaction Streams**: The backend aggregates click counts, RAG mentions, and AI image generations into a single buyer timeline.
- **Match Score Engine**: Automatically ranks buyers' compatibility with your store based on their budget, style prompts, and category preferences.
- **Anonymized Insights**: Browse matches displaying preferred colors, searched styles, and items placed, while personal identifiable information (PII) remains locked.
- **Unlock Mechanics**: Deducts a flat token fee from your wallet to instantly reveal the buyer's full name, email, telephone number, and location.

### 2.5 Buyer Network & CRM
A unified customer relation system for unlocked relationships.
- **Customer Profiles**: Once unlocked, buyers transition into your "Buyer Network" (CRM).
- **Interactive Timelines**: See every single touchpoint, including which products they styled, custom AI prompts they used, and their exact engagement time.
- **Private Staff Notes**: Add internal logs and follow-up updates directly on the buyer's profile.
- **Referral Tracking**: Monitor buyers who joined via your custom Store Referral Code.

### 2.6 Order & Lead Operations
Manage in-app checkout inquiries.
- **In-App Checkout Leads**: When a buyer chooses "Buy on SimulaFly", a lead form pre-fills their details and submits an order in the status `pending_merchant_contact`.
- **Offline Fulfillment**: Contact buyers directly (via phone or WhatsApp link provided in the order drawer) to arrange delivery, payment terms, or cash on delivery.
- **Fee-on-Acceptance**: The admin-configured `simulafly_purchase` fee is deducted once when you accept/confirm an order. Marking payment received does not deduct it again.

---

## 3. Pay-Per-Interaction (PPI) Tariff Sheet

The platform maintains a transparent, flat-rate deduction model. Pricing rules are managed dynamically by system defaults with optional custom overrides for specific merchants.

| Event / Action | Category | Billing Type | Rate (INR) | Billing Condition |
| :--- | :--- | :--- | :--- | :--- |
| **Impression** | Buyer Event | Free | ₹0.00 | Surface listing to a buyer in standard lists |
| **Product View / Click** | Buyer Event | Flat | ₹0.25 | Triggered when a buyer clicks on your product. Debounced/deduplicated per user session per hour. |
| **AI RAG Mention** | Buyer Event | Flat | ₹0.50 | Charged for **each product** suggested by the AI chatbot in RAG response. |
| **AI Image Generation** | Buyer Event | Flat | ₹2.00 | Charged when your product is composite-rendered in an AI visualization. Deduplicated per hour. |
| **External Redirect** | Buyer Event | Flat | ₹5.00 | Charged when a buyer clicks a redirect button to Amazon/Shopify/WhatsApp. |
| **Lead Unlock** | System Action | Flat | ₹50.00 | Flat fee charged when you unlock the contact details (PII) of a high-intent buyer. |
| **SimulaFly Purchase** | System Action | Admin-configured | 5.00% default | Charged on the discounted order value when the merchant accepts/confirms the order. |

---

## 4. Interaction Deduping & Safety
To protect merchants from click-fraud, accidental taps, and bot abuse, the platform implements **hourly deduplication** via Redis:
- **Scope**: Applied to `click` (product views) and `ai_image_generation`.
- **Behavior**: If the same user session interacts with the same product within a 1-hour window, the event is logged for your analytics but marked as `billed=false` (no deduction is made).
