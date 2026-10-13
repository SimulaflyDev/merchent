import type { ReactNode } from "react";

import type { MerchantOut } from "@/lib/types/merchant";
import type { MerchantVerification } from "@/lib/types/verification";
import type { BalanceHistoryItem } from "@/lib/types/wallet";

const COMPANY = {
  name: "SIMULA TECHNOLOGIES LLP",
  pan: "—",
  gstin: "Not Registered",
  address: "—",
  email: "support@simulafly.com",
  contact: "—",
};

type InvoiceKind = "commercial" | "recharge";

interface InvoiceProps {
  transaction: BalanceHistoryItem;
  merchant: MerchantOut;
  verification: MerchantVerification;
}

interface MerchantInvoiceDetails {
  id: string;
  name: string;
  gstin: string;
  pan: string;
  contact: string;
  email: string;
  address: string;
  stateAndPin: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function readString(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function joinParts(parts: Array<string | null | undefined>) {
  return parts.filter((part): part is string => Boolean(part?.trim())).join(", ");
}

function merchantInvoiceDetails(
  merchant: MerchantOut,
  verification: MerchantVerification,
): MerchantInvoiceDetails {
  const submission = asRecord(merchant.settings?.onboarding_submission);
  const business = asRecord(submission?.business);
  const personal = asRecord(submission?.personal);
  const shop = asRecord(submission?.shop);
  const registeredAddress = asRecord(business?.registered_address);
  const shopAddress = asRecord(shop?.shop_address);
  const address =
    merchant.address ||
    joinParts([
      readString(shopAddress, "line1"),
      readString(shopAddress, "city"),
      readString(shopAddress, "state"),
      readString(shopAddress, "postal_code"),
    ]) ||
    "—";
  const stateAndPin =
    joinParts([
      readString(shopAddress, "state") || readString(registeredAddress, "state"),
      readString(shopAddress, "postal_code") || readString(registeredAddress, "postal_code"),
    ]) || "—";

  return {
    id: merchant.partner_id || merchant.shop_id || merchant.id,
    name: merchant.legal_name || merchant.display_name,
    gstin:
      verification.gstin.gstin || readString(shop, "gstin") || "Not registered",
    pan:
      verification.pan.masked_pan || readString(business, "business_pan_masked") || "—",
    contact: merchant.support_phone || readString(personal, "phone") || "—",
    email: merchant.support_email || readString(personal, "email") || "—",
    address,
    stateAndPin,
  };
}

export function isRechargeTransaction(transaction: BalanceHistoryItem) {
  return transaction.reason === "topup" && transaction.amount > 0;
}

export function isInvoiceTransaction(transaction: BalanceHistoryItem) {
  return isRechargeTransaction(transaction) || transaction.amount < 0;
}

function invoiceKind(transaction: BalanceHistoryItem): InvoiceKind {
  return isRechargeTransaction(transaction) ? "recharge" : "commercial";
}

function transactionToken(transaction: BalanceHistoryItem) {
  return transaction.id.replace(/^tx_|^le_/, "").replaceAll("-", "").slice(0, 10).toUpperCase();
}

function transactionReference(transaction: BalanceHistoryItem) {
  return transaction.id.replace(/^tx_|^le_/, "");
}

export function invoiceNumber(transaction: BalanceHistoryItem) {
  const year = new Date(transaction.created_at).getFullYear();
  const prefix = invoiceKind(transaction) === "recharge" ? "SIM-WR" : "SIM-INV";
  return `${prefix}-${year}-${transactionToken(transaction)}`;
}

export function invoiceDescription(transaction: BalanceHistoryItem) {
  if (isRechargeTransaction(transaction)) return "Wallet Recharge Receipt";
  if (transaction.reason === "order_confirmation") return "Platform / Order Facilitation Fee";
  if (transaction.reason === "buyer_intel_unlock") return "Buyer Intelligence Unlock Fee";
  if (transaction.reason === "external_redirect" || transaction.reason === "click") {
    return "External Marketplace Redirect Fee";
  }
  if (transaction.reason === "ai_rag_mention") return "AI Product Mention Fee";
  if (transaction.reason === "ai_image_generation") return "AI Image Generation Fee";
  return transaction.reason.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Math.abs(value));
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function orderProducts(transaction: BalanceHistoryItem) {
  const items = transaction.order?.items || [];
  return {
    ids: items.map((item) => item.product_id || "—").join(", ") || "—",
    names: items.map((item) => item.title).join(", ") || transaction.product?.title || "—",
    skus: items.map((item) => item.sku).join(", ") || transaction.product?.sku || "—",
    quantity: items.reduce((total, item) => total + item.quantity, 0) || "—",
  };
}

function MetaCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-h-16 border border-gray-300 p-2.5">
      <div className="text-[9px] font-extrabold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words text-xs font-semibold text-gray-900">{children || "—"}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="border border-gray-400 bg-gray-200 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-gray-900">
      {children}
    </div>
  );
}

function CompanyHeader() {
  return (
    <div className="text-[11px] leading-5 text-gray-900">
      <h4 className="text-xl font-black tracking-tight">{COMPANY.name}</h4>
      <p><strong>PAN:</strong> {COMPANY.pan}</p>
      <p><strong>GSTIN:</strong> {COMPANY.gstin}</p>
      <p><strong>Registered / Business Address:</strong> {COMPANY.address}</p>
      <p><strong>Email:</strong> {COMPANY.email} <span className="px-1.5">|</span> <strong>Contact:</strong> {COMPANY.contact}</p>
    </div>
  );
}

function MerchantGrid({ details }: { details: MerchantInvoiceDetails }) {
  return (
    <>
      <SectionTitle>Merchant Partner Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetaCell label="Merchant Partner’s ID">{details.id}</MetaCell>
        <MetaCell label="Merchant Name">{details.name}</MetaCell>
        <MetaCell label="Merchant GSTIN">{details.gstin}</MetaCell>
        <MetaCell label="Merchant PAN No.">{details.pan}</MetaCell>
        <MetaCell label="Merchant Contact">{details.contact}</MetaCell>
        <MetaCell label="Merchant E-mail ID">{details.email}</MetaCell>
        <MetaCell label="Merchant Address">{details.address}</MetaCell>
        <MetaCell label="State & PIN code">{details.stateAndPin}</MetaCell>
      </div>
    </>
  );
}

function CommercialInvoice({ transaction, details }: { transaction: BalanceHistoryItem; details: MerchantInvoiceDetails }) {
  const order = transaction.order;
  const products = orderProducts(transaction);
  const hasOrder = transaction.reason === "order_confirmation";

  return (
    <>
      <CompanyHeader />
      <div className="my-7 text-center">
        <h3 className="text-2xl font-black uppercase text-gray-950">Commercial Invoice</h3>
        <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-gray-500">
          {hasOrder ? "Platform Service / Order Facilitation Fee" : "Platform Service / Wallet Deduction"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetaCell label="Invoice No.">{invoiceNumber(transaction)}</MetaCell>
        <MetaCell label="Invoice Date">{formatDate(transaction.created_at)}</MetaCell>
        <MetaCell label="Service Txn ID">{transactionReference(transaction)}</MetaCell>
        <MetaCell label="Transaction ID">{transaction.reference_id || "—"}</MetaCell>
        <MetaCell label="Order ID">{order?.id || "—"}</MetaCell>
        <MetaCell label="Merchant Partner ID">{details.id}</MetaCell>
        <MetaCell label="Order Date">{formatDateTime(order?.created_at)}</MetaCell>
        <MetaCell label="Order Status">{order ? "Confirmed by merchant" : "Posted"}</MetaCell>
      </div>

      <MerchantGrid details={details} />

      <SectionTitle>{hasOrder ? "Order Reference — For Transaction Traceability" : "Service Reference — For Transaction Traceability"}</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <MetaCell label="Buyer Name">{order?.buyer_name || "—"}</MetaCell>
        <MetaCell label="Buyer Address">{order?.buyer_address || "—"}</MetaCell>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetaCell label="Product ID (as listed)">{products.ids}</MetaCell>
        <MetaCell label="Product Name (as listed)">{products.names}</MetaCell>
        <MetaCell label="Product SKU (as listed)">{products.skus}</MetaCell>
        <MetaCell label="Order Quantity">{products.quantity}</MetaCell>
      </div>
      <div className="border border-gray-300 p-2.5 text-xs font-semibold">
        <strong>Total Order Value:</strong> {order ? formatCurrency(order.total_value) : "—"}
      </div>

      <SectionTitle>SimulaFly Platform Service Fee & Wallet Deduction</SectionTitle>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr><td className="border border-gray-300 p-2.5">{invoiceDescription(transaction)}</td><td className="border border-gray-300 p-2.5 font-semibold">{formatCurrency(transaction.amount)}</td></tr>
          <tr><td className="border border-gray-300 p-2.5">GST</td><td className="border border-gray-300 p-2.5">Not charged — Simula Technologies LLP is not GST registered</td></tr>
          <tr className="bg-gray-100 font-black"><td className="border border-gray-300 p-2.5">Total Service Fee</td><td className="border border-gray-300 p-2.5">{formatCurrency(transaction.amount)}</td></tr>
        </tbody>
      </table>

      <div className="mt-7 bg-gray-100 p-3 text-[10px] leading-4 text-gray-800">
        <strong className="block text-xs">Nature of this document</strong>
        This document records Simula Technologies LLP&apos;s platform service fee charged against the merchant wallet. The underlying sale, where applicable, is between the merchant and the customer. Simula Technologies LLP is not the seller of the goods or services. The merchant remains responsible for the applicable customer invoice or tax invoice.
        <span className="mt-1 block">Reference note: Transaction details only; not a sale invoice.</span>
      </div>
      <p className="mt-5 text-right text-[10px] font-bold">This is a system generated document; no signature or seal is needed.</p>
    </>
  );
}

function RechargeReceipt({ transaction, details }: { transaction: BalanceHistoryItem; details: MerchantInvoiceDetails }) {
  const balanceAfter = transaction.running_balance;
  const balanceBefore = balanceAfter - transaction.amount;

  return (
    <>
      <CompanyHeader />
      <div className="my-7 text-center">
        <h3 className="text-2xl font-black uppercase text-gray-950">Wallet Recharge Receipt</h3>
        <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-gray-500">Acknowledgement Receipt</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetaCell label="Receipt No.">{invoiceNumber(transaction)}</MetaCell>
        <MetaCell label="Receipt Date">{formatDate(transaction.created_at)}</MetaCell>
        <MetaCell label="Wallet Txn ID">{transactionReference(transaction)}</MetaCell>
        <MetaCell label="Merchant ID">{details.id}</MetaCell>
        <div className="sm:col-span-2"><MetaCell label="Razorpay Transaction ID">{transaction.gateway_ref || "—"}</MetaCell></div>
        <MetaCell label="Payment Date">{formatDateTime(transaction.created_at)}</MetaCell>
        <MetaCell label="Payment Status">Successful</MetaCell>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3">
        <MetaCell label="Currency">INR</MetaCell>
        <MetaCell label="Gateway Order Reference">{transaction.payment_order_id || "—"}</MetaCell>
        <MetaCell label="Settlement Date">—</MetaCell>
      </div>

      <MerchantGrid details={details} />

      <SectionTitle>Payment / Gateway Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3">
        <MetaCell label="Payment Gateway">{transaction.gateway || "Razorpay"}</MetaCell>
        <MetaCell label="Payment Mode">{transaction.payment_method || "Online"}</MetaCell>
        <MetaCell label="Convenience Fee">{formatCurrency(0)}</MetaCell>
      </div>

      <SectionTitle>Wallet Ledger</SectionTitle>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr><td className="border border-gray-300 p-2.5">Wallet Balance Before Recharge</td><td className="border border-gray-300 p-2.5">{formatCurrency(balanceBefore)}</td></tr>
          <tr className="bg-gray-100"><td className="border border-gray-300 p-2.5">Recharge Amount Received</td><td className="border border-gray-300 p-2.5 font-black">{formatCurrency(transaction.amount)}</td></tr>
          <tr className="bg-emerald-50 font-black"><td className="border border-gray-300 p-2.5">Wallet Balance After Recharge</td><td className="border border-gray-300 p-2.5">{formatCurrency(balanceAfter)}</td></tr>
          <tr><td className="border border-gray-300 p-2.5">Wallet Recharge ID</td><td className="border border-gray-300 p-2.5">{transactionReference(transaction)}</td></tr>
        </tbody>
      </table>
      <p className="mt-3 text-right text-lg font-black">Amount Received: {formatCurrency(transaction.amount)}</p>

      <div className="mt-7 bg-gray-100 p-3 text-[10px] leading-4 text-gray-800">
        <strong className="block text-xs">Nature of this document</strong>
        This document acknowledges receipt of the merchant&apos;s wallet recharge amount through the payment gateway. The recharge increases the merchant&apos;s available wallet balance and may subsequently be adjusted against platform or service fees under the applicable merchant terms. This receipt is not an invoice for the underlying sale of goods or services and does not represent the full recharge amount as SimulaFly service revenue at the time of recharge.
        <strong className="mt-2 block text-xs">GST / Tax note</strong>
        Simula Technologies LLP is currently not GST registered. Accordingly, this receipt does not charge or separately collect GST.
      </div>
      <p className="mt-5 text-right text-[10px] font-bold">This is a system generated document; no signature or seal is needed.</p>
    </>
  );
}

export default function WalletInvoiceDocument({ transaction, merchant, verification }: InvoiceProps) {
  const details = merchantInvoiceDetails(merchant, verification);

  return (
    <article className="mx-auto w-full max-w-[850px] bg-white p-4 text-gray-900 sm:p-7">
      {invoiceKind(transaction) === "recharge" ? (
        <RechargeReceipt transaction={transaction} details={details} />
      ) : (
        <CommercialInvoice transaction={transaction} details={details} />
      )}
    </article>
  );
}

function escapeHtml(value: unknown) {
  return String(value ?? "—")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlCell(label: string, value: unknown, span = 1) {
  return `<div class="cell span-${span}"><span class="label">${escapeHtml(label)}</span><strong>${escapeHtml(value || "—")}</strong></div>`;
}

function printStyles() {
  return `
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    body { color: #111827; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 1.35; margin: 0; }
    .page { width: 100%; }
    .company h1 { font-size: 20px; margin: 0 0 6px; }
    .company p { margin: 2px 0; }
    .document-title { margin: 24px 0 10px; text-align: center; }
    .document-title h2 { font-size: 21px; margin: 0; text-transform: uppercase; }
    .document-title p { color: #5f6368; font-size: 11px; font-weight: 700; margin: 5px 0 0; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); }
    .cell { border: 1px solid #9ca3af; min-height: 48px; padding: 7px; overflow-wrap: anywhere; }
    .span-2 { grid-column: span 2; }
    .label { color: #60646c; display: block; font-size: 8px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; }
    .section { background: #d7dce2; border: 1px solid #9ca3af; font-size: 11px; font-weight: 800; padding: 7px; text-transform: uppercase; }
    table { border-collapse: collapse; width: 100%; }
    td { border: 1px solid #9ca3af; padding: 7px; }
    .muted-row { background: #eef0f2; }
    .success-row { background: #e7f3e9; }
    .amount { font-size: 15px; font-weight: 800; margin: 10px 0 0; text-align: right; text-transform: uppercase; }
    .note { background: #f3f4f6; line-height: 1.45; margin-top: 24px; padding: 10px; }
    .note strong { display: block; margin-bottom: 3px; }
    .note .tax { margin-top: 8px; }
    .system { font-weight: 700; margin-top: 16px; text-align: right; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  `;
}

function companyHtml() {
  return `<header class="company"><h1>${COMPANY.name}</h1><p><b>PAN:</b> ${COMPANY.pan}</p><p><b>GSTIN:</b> ${COMPANY.gstin}</p><p><b>Registered / Business Address:</b> ${COMPANY.address}</p><p><b>Email:</b> ${COMPANY.email} &nbsp;|&nbsp; <b>Contact:</b> ${COMPANY.contact}</p></header>`;
}

function merchantHtml(details: MerchantInvoiceDetails) {
  return `<div class="section">Merchant Partner Details</div><div class="grid">${htmlCell("Merchant Partner’s ID", details.id)}${htmlCell("Merchant Name", details.name)}${htmlCell("Merchant GSTIN", details.gstin)}${htmlCell("Merchant PAN No.", details.pan)}${htmlCell("Merchant Contact", details.contact)}${htmlCell("Merchant E-mail ID", details.email)}${htmlCell("Merchant Address", details.address)}${htmlCell("State & PIN code", details.stateAndPin)}</div>`;
}

function commercialHtml(transaction: BalanceHistoryItem, details: MerchantInvoiceDetails) {
  const order = transaction.order;
  const products = orderProducts(transaction);
  const hasOrder = transaction.reason === "order_confirmation";
  return `${companyHtml()}<div class="document-title"><h2>Commercial Invoice</h2><p>${hasOrder ? "Platform Service / Order Facilitation Fee" : "Platform Service / Wallet Deduction"}</p></div><div class="grid">${htmlCell("Invoice No.", invoiceNumber(transaction))}${htmlCell("Invoice Date", formatDate(transaction.created_at))}${htmlCell("Service Txn ID", transactionReference(transaction))}${htmlCell("Transaction ID", transaction.reference_id)}${htmlCell("Order ID", order?.id)}${htmlCell("Merchant Partner ID", details.id)}${htmlCell("Order Date", formatDateTime(order?.created_at))}${htmlCell("Order Status", order ? "Confirmed by merchant" : "Posted")}</div>${merchantHtml(details)}<div class="section">${hasOrder ? "Order Reference — For Transaction Traceability" : "Service Reference — For Transaction Traceability"}</div><div class="grid-2">${htmlCell("Buyer Name", order?.buyer_name)}${htmlCell("Buyer Address", order?.buyer_address)}</div><div class="grid">${htmlCell("Product ID (as listed)", products.ids)}${htmlCell("Product Name (as listed)", products.names)}${htmlCell("Product SKU (as listed)", products.skus)}${htmlCell("Order Quantity", products.quantity)}</div><div class="cell"><span class="label">Total Order Value</span><strong>${order ? escapeHtml(formatCurrency(order.total_value)) : "—"}</strong></div><div class="section">SimulaFly Platform Service Fee & Wallet Deduction</div><table><tbody><tr><td>${escapeHtml(invoiceDescription(transaction))}</td><td><b>${escapeHtml(formatCurrency(transaction.amount))}</b></td></tr><tr><td>GST</td><td>Not charged — Simula Technologies LLP is not GST registered</td></tr><tr class="muted-row"><td><b>Total Service Fee</b></td><td><b>${escapeHtml(formatCurrency(transaction.amount))}</b></td></tr></tbody></table><div class="note"><strong>Nature of this document</strong>This document records Simula Technologies LLP's platform service fee charged against the merchant wallet. The underlying sale, where applicable, is between the merchant and the customer. Simula Technologies LLP is not the seller of the goods or services. The merchant remains responsible for the applicable customer invoice or tax invoice.<br>Reference note: Transaction details only; not a sale invoice.</div><div class="system">This is a system generated document; no signature or seal is needed.</div>`;
}

function rechargeHtml(transaction: BalanceHistoryItem, details: MerchantInvoiceDetails) {
  const balanceAfter = transaction.running_balance;
  const balanceBefore = balanceAfter - transaction.amount;
  return `${companyHtml()}<div class="document-title"><h2>Wallet Recharge Receipt</h2><p>Acknowledgement Receipt</p></div><div class="grid">${htmlCell("Receipt No.", invoiceNumber(transaction))}${htmlCell("Receipt Date", formatDate(transaction.created_at))}${htmlCell("Wallet Txn ID", transactionReference(transaction))}${htmlCell("Merchant ID", details.id)}${htmlCell("Razorpay Transaction ID", transaction.gateway_ref, 2)}${htmlCell("Payment Date", formatDateTime(transaction.created_at))}${htmlCell("Payment Status", "Successful")}</div><div class="grid-3">${htmlCell("Currency", "INR")}${htmlCell("Gateway Order Reference", transaction.payment_order_id)}${htmlCell("Settlement Date", "—")}</div>${merchantHtml(details)}<div class="section">Payment / Gateway Details</div><div class="grid-3">${htmlCell("Payment Gateway", transaction.gateway || "Razorpay")}${htmlCell("Payment Mode", transaction.payment_method || "Online")}${htmlCell("Convenience Fee", formatCurrency(0))}</div><div class="section">Wallet Ledger</div><table><tbody><tr><td>Wallet Balance Before Recharge</td><td>${escapeHtml(formatCurrency(balanceBefore))}</td></tr><tr class="muted-row"><td>Recharge Amount Received</td><td><b>${escapeHtml(formatCurrency(transaction.amount))}</b></td></tr><tr class="success-row"><td><b>Wallet Balance After Recharge</b></td><td><b>${escapeHtml(formatCurrency(balanceAfter))}</b></td></tr><tr><td>Wallet Recharge ID</td><td>${escapeHtml(transactionReference(transaction))}</td></tr></tbody></table><div class="amount">Amount Received: ${escapeHtml(formatCurrency(transaction.amount))}</div><div class="note"><strong>Nature of this document</strong>This document acknowledges receipt of the merchant's wallet recharge amount through the payment gateway. The recharge increases the merchant's available wallet balance and may subsequently be adjusted against platform or service fees under the applicable merchant terms. This receipt is not an invoice for the underlying sale of goods or services and does not represent the full recharge amount as SimulaFly service revenue at the time of recharge.<strong class="tax">GST / Tax note</strong>Simula Technologies LLP is currently not GST registered. Accordingly, this receipt does not charge or separately collect GST.</div><div class="system">This is a system generated document; no signature or seal is needed.</div>`;
}

export function printWalletInvoice({ transaction, merchant, verification }: InvoiceProps) {
  const details = merchantInvoiceDetails(merchant, verification);
  const printWindow = window.open("", "_blank", "width=920,height=1050");
  if (!printWindow) return false;

  const body = invoiceKind(transaction) === "recharge"
    ? rechargeHtml(transaction, details)
    : commercialHtml(transaction, details);

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(invoiceNumber(transaction))}</title><style>${printStyles()}</style></head><body><main class="page">${body}</main></body></html>`);
  printWindow.document.close();
  return true;
}
