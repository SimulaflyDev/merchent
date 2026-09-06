"use client";

import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/types/lead";
import type { CancellationReason } from "@/lib/api/leads";

// ── Cancellation reason taxonomy ─────────────────────────────────────────────

type CancelCategory = {
  label: string;
  children: string[];
};

const CANCEL_CATEGORIES: CancelCategory[] = [
  {
    label: "Inventory Related",
    children: [
      "Out of Stock",
      "Product Discontinued",
      "Inventory Count Error",
      "Product Damaged / Unsellable",
      "Variant Unavailable (Size, Color, Model)",
    ],
  },
  {
    label: "Pricing Related",
    children: [
      "Incorrect Price Listed",
      "Promotion / Discount Error",
      "Supplier Price Changed",
      "Pricing Configuration Error",
    ],
  },
  {
    label: "Fulfillment & Logistics",
    children: [
      "Unable to Deliver to Customer Location",
      "Delivery Partner Unavailable",
      "Service Area Not Supported",
      "Shipping Cost Too High",
      "Logistics Capacity Full",
    ],
  },
  {
    label: "Merchant Operations",
    children: [
      "Store Temporarily Closed",
      "Staff Unavailable",
      "Technical Issue Preventing Fulfillment",
      "Business Emergency",
      "Unable to Process Order",
    ],
  },
  {
    label: "Product Information Issues",
    children: [
      "Incorrect Product Listing",
      "Product Specification Mismatch",
      "Duplicate Listing Error",
      "Product No Longer Available",
    ],
  },
  {
    label: "Customer-Related (Use Carefully)",
    children: [
      "Suspected Fraudulent Order",
      "Duplicate Customer Order",
      "Customer Requested Modification Not Supported",
      "Address Verification Failed",
      "Contact Information Invalid",
    ],
  },
  {
    label: "Compliance & Verification",
    children: [
      "Payment Verification Failed",
      "Regulatory Restriction",
      "GST / Tax Compliance Issue",
      "Merchant Verification Pending",
    ],
  },
  {
    label: "Custom Reason",
    children: ["Other (specify below)"],
  },
];

// ── Cancel Modal ──────────────────────────────────────────────────────────────

interface CancelModalProps {
  onConfirm: (parentReason: string, childReason: string, note: string) => void;
  onDismiss: () => void;
}

function CancelModal({ onConfirm, onDismiss }: CancelModalProps) {
  const [parentReason, setParentReason] = useState("");
  const [childReason, setChildReason] = useState("");
  const [parentOther, setParentOther] = useState("");
  const [childOther, setChildOther] = useState("");
  const [note, setNote] = useState("");

  const selectedCategory = CANCEL_CATEGORIES.find(
    (c) => c.label === parentReason
  );

  const isCustomParent = parentReason === "Custom Reason";
  const isCustomChild = childReason === "Other (specify below)";

  const effectiveParent = isCustomParent ? parentOther : parentReason;
  const effectiveChild = isCustomChild ? childOther : childReason;

  const canSubmit =
    effectiveParent.trim() &&
    effectiveChild.trim() &&
    (!isCustomChild || childOther.trim()) &&
    (!isCustomParent || parentOther.trim());

  const handleSubmit = () => {
    if (!canSubmit) return;
    onConfirm(effectiveParent, effectiveChild, note.trim());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-red-50/60">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg
              className="w-4.5 h-4.5 text-red-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">Cancel Order</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Please select a reason so we can improve our service.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Parent category */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Primary Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={parentReason}
              onChange={(e) => {
                setParentReason(e.target.value);
                setChildReason("");
                setParentOther("");
                setChildOther("");
              }}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
            >
              <option value="" disabled>
                Select a category…
              </option>
              {CANCEL_CATEGORIES.map((cat) => (
                <option key={cat.label} value={cat.label}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Custom parent text */}
            {isCustomParent && (
              <input
                type="text"
                placeholder="Describe your primary reason…"
                value={parentOther}
                onChange={(e) => setParentOther(e.target.value)}
                className="mt-2 w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
              />
            )}
          </div>

          {/* Child category */}
          {parentReason && selectedCategory && !isCustomParent && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Specific Reason <span className="text-red-500">*</span>
              </label>
              <select
                value={childReason}
                onChange={(e) => {
                  setChildReason(e.target.value);
                  setChildOther("");
                }}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
              >
                <option value="" disabled>
                  Select a specific reason…
                </option>
                {selectedCategory.children.map((child) => (
                  <option key={child} value={child}>
                    {child}
                  </option>
                ))}
                <option value="Other (specify below)">
                  Other (specify below)
                </option>
              </select>

              {/* Custom child text */}
              {isCustomChild && (
                <input
                  type="text"
                  placeholder="Describe the specific reason…"
                  value={childOther}
                  onChange={(e) => setChildOther(e.target.value)}
                  className="mt-2 w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                />
              )}
            </div>
          )}

          {/* Custom parent → single specific reason field */}
          {isCustomParent && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Specific Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Describe the specific reason…"
                value={childOther}
                onChange={(e) => setChildOther(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
              />
            </div>
          )}

          {/* Optional note */}
          {(parentReason || isCustomParent) && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Additional Notes{" "}
                <span className="font-normal normal-case text-gray-400">
                  (optional)
                </span>
              </label>
              <textarea
                placeholder="Any extra context for our team…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-all"
          >
            Keep Order
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex-1 py-2.5 font-bold text-sm rounded-xl transition-all ${
              canSubmit
                ? "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200"
                : "bg-red-100 text-red-300 cursor-not-allowed"
            }`}
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}

// ── LeadDrawer ────────────────────────────────────────────────────────────────

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: LeadStatus) => void;
  onCancelLead: (id: string, reason: CancellationReason) => void;
  onShowToast: (msg: string) => void;
}

export function LeadDrawer({
  lead,
  onClose,
  onUpdateStatus,
  onCancelLead,
  onShowToast,
}: LeadDrawerProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!lead) return null;

  const isNewLead = lead.status === "New Order";
  // Hide PII for new leads AND cancelled orders
  const hidePii = isNewLead || lead.status === "Cancelled Orders";

  // Mock Amazon-style CRM ID (only shown when PII is revealed)
  const customerId = hidePii
    ? "HIDDEN"
    : `CID-${lead.customer.name.substring(0, 3).toUpperCase()}${lead.customer.phone.slice(-4)}`;

  const handleUpdate = (newStatus: LeadStatus) => {
    onUpdateStatus(lead.id, newStatus);
    if (newStatus === "Order Confirmed") {
      onShowToast(
        `WhatsApp sent to ${lead.customer.name}: "Hi ${lead.customer.name.split(" ")[0]}, SimulaFly Merchant has confirmed. We will connect shortly."`
      );
    } else if (newStatus === "Converted") {
      onShowToast("Lead marked as Payment Received. Fulfillment process started.");
    }
  };

  const handleCancelConfirm = (
    parentReason: string,
    childReason: string,
    note: string
  ) => {
    setShowCancelModal(false);
    onCancelLead(lead.id, {
      parent_reason: parentReason,
      child_reason: childReason,
      note: note || undefined,
    });
    const noteText = note ? ` — ${note}` : "";
    onShowToast(
      `Order cancelled. Reason: ${parentReason} › ${childReason}${noteText}`
    );
  };

  return (
    <>
      {/* Cancellation reason modal */}
      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancelConfirm}
          onDismiss={() => setShowCancelModal(false)}
        />
      )}

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full transform flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[95vw] md:w-[700px]">
        {/* Header */}
        <div className="z-10 flex items-start justify-between gap-3 border-b border-gray-100 bg-white px-4 py-4 sm:items-center sm:px-8 sm:py-6">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Order Details
              </h2>
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                  lead.status === "New Order"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                    : lead.status === "Order Confirmed"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : lead.status === "Converted"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                {lead.status === "New Order"
                  ? "New Order"
                  : lead.status === "Order Confirmed"
                    ? "Order Confirmed"
                    : lead.status === "Converted"
                      ? "Payment Received"
                      : "Cancelled Orders"}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Reference:{" "}
              <span className="font-mono text-[#1FAF9A]">{lead.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-7 overflow-y-auto bg-gray-50/50 p-4 sm:space-y-10 sm:p-8">
          {/* Payment warning (only for active orders) */}
          {lead.status !== "Cancelled Orders" && (
            <div className="bg-amber-50/80 border border-amber-200/60 p-3 rounded-lg flex items-center gap-3">
              <svg
                className="h-5 w-5 text-amber-500 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-amber-800">
                <strong className="font-bold">Payment Not Collected.</strong>{" "}
                Contact customer directly to arrange fulfillment and payment.
              </p>
            </div>
          )}

          {/* Cancelled banner */}
          {lead.status === "Cancelled Orders" && (
            <div className="bg-red-50/80 border border-red-200/60 p-3 rounded-lg flex items-center gap-3">
              <svg
                className="h-5 w-5 text-red-500 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-sm text-red-800">
                <strong className="font-bold">Order Cancelled.</strong>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12">
            {/* Customer Contact */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Customer Details
              </h3>
              <div className="text-sm text-gray-800">
                {hidePii ? (
                  <div className="space-y-3">
                    <p className="font-bold text-xl text-gray-400 select-none">
                      {lead.customer.name}
                    </p>
                    <p className="text-gray-900 font-medium">
                      Location: {lead.customer.city}, India
                    </p>
                    <p className="text-xs text-gray-500 italic mt-2">
                      {isNewLead
                        ? "Confirm order to reveal full contact info."
                        : "Contact info hidden for cancelled orders."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="font-bold text-xl text-gray-900">
                      {lead.customer.name}
                    </p>
                    <p className="text-[#1FAF9A] font-semibold text-lg">
                      {lead.customer.phone}
                    </p>
                    <p className="text-gray-600">{lead.customer.email}</p>
                    {lead.customer.address_line1 && (
                      <p className="text-gray-700 font-medium mt-1">
                        {lead.customer.address_line1}
                      </p>
                    )}
                    <p className="text-gray-600">
                      {[
                        lead.customer.city,
                        lead.customer.state,
                        lead.customer.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                      {lead.customer.city ? ", India" : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Financials */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Financials
              </h3>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Product Value</span>
                  <span className="font-medium">
                    ₹{lead.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                {lead.couponCode && lead.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>
                      Coupon used: <strong className="font-mono">{lead.couponCode}</strong>
                    </span>
                    <span className="font-semibold">
                      -₹{lead.discountAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400 text-xs italic">
                  <span>Shipping &amp; Taxes</span>
                  <span>To be negotiated</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Value</span>
                  <span className="font-bold text-lg text-gray-900">
                    ₹{lead.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Requested Items */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Requested Items
            </h3>
            <div className="space-y-4">
              {lead.products.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  No item details available.
                </p>
              ) : (
                lead.products.map((prod, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
                  >
                    {prod.img ? (
                      <img
                        src={prod.img}
                        alt={prod.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">
                        {prod.name}
                      </p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">
                        SKU: {prod.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ₹{prod.price.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {prod.qty}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="z-10 grid grid-cols-1 gap-3 border-t border-gray-100 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] sm:flex sm:flex-wrap sm:p-6">
          {lead.status === "New Order" && (
            <button
              onClick={() => handleUpdate("Order Confirmed")}
              className="flex-1 py-3 bg-[#1FAF9A] hover:bg-[#189986] text-white font-bold text-sm rounded-xl shadow-md shadow-[#1FAF9A]/20 transition-all"
            >
              Confirm Order
            </button>
          )}
          {lead.status === "Order Confirmed" && (
            <button
              onClick={() => handleUpdate("Converted")}
              className="flex-1 py-3 bg-[#1FAF9A] hover:bg-[#189986] text-white font-bold text-sm rounded-xl shadow-md shadow-[#1FAF9A]/20 transition-all"
            >
              Mark Payment Received
            </button>
          )}
          {!hidePii && (
            <>
              <a
                href={`tel:${lead.customer.phone}`}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all text-center block shadow-sm"
              >
                Call Customer
              </a>
              <a
                href={`https://wa.me/${(() => {
                  const cleaned = lead.customer.phone.replace(/[^0-9]/g, "");
                  return cleaned.length === 10 ? `91${cleaned}` : cleaned;
                })()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm rounded-xl transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 2.12.551 4.111 1.517 5.856L.078 23.505a.498.498 0 0 0 .618.618l5.35-1.439a11.968 11.968 0 0 0 5.954 1.613c6.63 0 12-5.373 12-12s-5.37-12-12-12zm0 22.029c-1.896 0-3.754-.486-5.385-1.408a.5.5 0 0 0-.486-.048l-3.325.895.895-3.325a.5.5 0 0 0-.048-.486C2.525 15.754 2.039 13.896 2.039 12c0-5.511 4.45-9.961 9.961-9.961 5.511 0 9.961 4.45 9.961 9.961s-4.45 9.961-9.961 9.961zm5.221-7.141c-.287-.144-1.696-.837-1.958-.933-.262-.096-.453-.144-.643.144-.19.287-.738.933-.905 1.124-.167.19-.334.215-.621.071-.287-.144-1.21-.446-2.304-1.423-.852-.76-1.427-1.699-1.594-1.986-.167-.287-.018-.442.125-.584.129-.128.287-.334.43-.502.144-.167.191-.287.287-.478.096-.191.048-.358-.024-.502-.072-.144-.643-1.55-.881-2.123-.232-.559-.469-.483-.643-.492-.167-.008-.358-.008-.55-.008-.19 0-.502.072-.764.358-.262.287-1.002 1.002-1.002 2.438 0 1.436 1.043 2.822 1.187 3.013.144.191 2.052 3.134 4.972 4.394.695.3 1.238.48 1.66.613.722.23 1.378.188 1.898.11.58-.086 1.696-.693 1.935-1.362.24-.669.24-1.242.168-1.362-.072-.12-.263-.191-.55-.335z"/>
                </svg>
                WhatsApp
              </a>
            </>
          )}
          {(lead.status === "New Order" || lead.status === "Order Confirmed") && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-6 py-3 bg-white border border-gray-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-all shadow-sm"
            >
              Cancel Order
            </button>
          )}
          <a
            href={`/merchant/support?reason=orders_leads&orderId=${lead.id}`}
            className="px-6 py-3 bg-white border border-gray-200 text-[#1FAF9A] hover:bg-[#1FAF9A]/5 font-bold text-sm rounded-xl transition-all shadow-sm text-center flex items-center justify-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Support
          </a>
        </div>
      </div>
    </>
  );
}
