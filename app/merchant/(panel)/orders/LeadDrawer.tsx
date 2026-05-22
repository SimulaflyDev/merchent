"use client";

import type { Lead, LeadStatus } from "@/lib/types/lead";

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: LeadStatus) => void;
  onShowToast: (msg: string) => void;
}

export function LeadDrawer({
  lead,
  onClose,
  onUpdateStatus,
  onShowToast,
}: LeadDrawerProps) {
  if (!lead) return null;

  const isNewLead = lead.status === "New Lead";

  // Mock Amazon-style CRM ID (only shown when PII is revealed)
  const customerId = isNewLead
    ? "HIDDEN"
    : `CID-${lead.customer.name.substring(0, 3).toUpperCase()}${lead.customer.phone.slice(-4)}`;

  const handleUpdate = (newStatus: LeadStatus) => {
    onUpdateStatus(lead.id, newStatus);
    if (newStatus === "Synced") {
      onShowToast(
        `WhatsApp sent to ${lead.customer.name}: "Hi ${lead.customer.name.split(" ")[0]}, SimulaFly Merchant has confirmed. We will connect shortly."`
      );
    } else if (newStatus === "Converted") {
      onShowToast("Lead marked as Payment Received. Fulfillment process started.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-[95vw] md:w-[700px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white z-10">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Order Details
              </h2>
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                  lead.status === "New Lead"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                    : lead.status === "Synced"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : lead.status === "Converted"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                {lead.status === "New Lead"
                  ? "Pending Acceptance"
                  : lead.status === "Synced"
                    ? "In Communication"
                    : lead.status === "Converted"
                      ? "Payment Received"
                      : "Lost"}
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
        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-gray-50/50">
          {/* Payment warning */}
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

          <div className="grid grid-cols-2 gap-12">
            {/* Customer Contact */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Customer Details
              </h3>
              <div className="text-sm text-gray-800">
                {isNewLead ? (
                  <div className="space-y-3">
                    <p className="font-bold text-xl text-gray-400 select-none">
                      Protected Customer
                    </p>
                    <p className="text-gray-900 font-medium">
                      Location: {lead.customer.city}, India
                    </p>
                    <p className="text-xs text-gray-500 italic mt-2">
                      Confirm order to reveal full contact info.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="font-bold text-xl text-gray-900">
                      {lead.customer.name}
                    </p>
                    <p className="text-[#1FAF9A] font-semibold">
                      {lead.customer.phone}
                    </p>
                    <p className="text-gray-600">{lead.customer.email}</p>
                    <p className="text-gray-600">{lead.customer.city}, India</p>
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
                    ₹{lead.total.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs italic">
                  <span>Shipping & Taxes</span>
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

          <hr className="border-gray-200" />

          {/* Shopper Insights */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#1FAF9A]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Shopper Insights & CRM
              </h3>
              <span className="text-xs font-mono bg-white border border-gray-200 text-gray-500 px-2.5 py-1 rounded-md shadow-sm">
                ID: {customerId}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Customer interacted with SimulaFly Commerce visualizations{" "}
              <strong className="text-gray-900">
                {lead.aiInteractions} times
              </strong>{" "}
              before converting to a lead.
            </p>

            {lead.aiGeneratedImage && (
              <div className="mb-6">
                {isNewLead ? (
                  <div className="w-full h-48 bg-gray-100 rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-center p-6">
                    <svg
                      className="w-8 h-8 text-gray-400 mb-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <p className="text-sm font-medium text-gray-600">
                      Shopper Visual Context Locked
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Accept order to see the exact scene they generated.
                    </p>
                  </div>
                ) : (
                  <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={lead.aiGeneratedImage}
                      alt="Shopper generated visualization"
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl pointer-events-none" />
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-white font-bold tracking-wider flex items-center gap-1.5 shadow-lg">
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      SimulaFly Commerce
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isNewLead && (
              <button className="text-sm font-bold text-[#1FAF9A] hover:text-[#189986] transition-colors inline-flex items-center gap-1">
                Offer Extra Discount &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-white border-t border-gray-100 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-10">
          {lead.status === "New Lead" && (
            <button
              onClick={() => handleUpdate("Synced")}
              className="flex-1 py-3 bg-[#1FAF9A] hover:bg-[#189986] text-white font-bold text-sm rounded-xl shadow-md shadow-[#1FAF9A]/20 transition-all"
            >
              Confirm Order
            </button>
          )}
          {lead.status === "Synced" && (
            <button
              onClick={() => handleUpdate("Converted")}
              className="flex-1 py-3 bg-[#1FAF9A] hover:bg-[#189986] text-white font-bold text-sm rounded-xl shadow-md shadow-[#1FAF9A]/20 transition-all"
            >
              Mark Payment Received
            </button>
          )}
          {!isNewLead && (
            <a
              href={`tel:${lead.customer.phone}`}
              className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all text-center block shadow-sm"
            >
              Call Customer
            </a>
          )}
          {(lead.status === "New Lead" || lead.status === "Synced") && (
            <button
              onClick={() => handleUpdate("Lost")}
              className="px-6 py-3 bg-white border border-gray-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-all shadow-sm"
            >
              Mark Lost
            </button>
          )}
        </div>
      </div>
    </>
  );
}
