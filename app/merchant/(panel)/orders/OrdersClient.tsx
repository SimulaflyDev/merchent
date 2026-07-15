"use client";

import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/types/lead";
import { reverseLeadStatus, adaptLead } from "@/lib/types/lead";
import { updateLeadStatusAction, cancelLeadAction } from "@/lib/auth/lead-actions";
import type { CancellationReason } from "@/lib/api/leads";
import { LeadDrawer } from "./LeadDrawer";
import { callAction } from "@/lib/api/action-utils";

interface Props {
  initialLeads: Lead[];
  /** Maps the short display id (8-char) → full backend UUID */
  backendIdMap: Record<string, string>;
}

export default function OrdersClient({ initialLeads, backendIdMap }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeTab, setActiveTab] = useState("all");
  const [leadMode, setLeadMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: "date" | "value";
    direction: "asc" | "desc";
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const updateLeadStatus = async (displayId: string, newStatus: LeadStatus) => {
    const backendId = backendIdMap[displayId];
    if (!backendId) return;

    const backendStatus = reverseLeadStatus(newStatus);
    try {
      const updated = await callAction(updateLeadStatusAction(backendId, backendStatus));
      const adapted = adaptLead(updated);
      setLeads((prev) =>
        prev.map((l) => (l.id === displayId ? adapted : l))
      );
      if (newStatus === "Order Confirmed") {
        const lead = leads.find((l) => l.id === displayId);
        showToast(
          `WhatsApp sent to ${lead?.customer.name ?? "customer"}: "Hi, SimulaFly Merchant confirmed. We'll connect shortly."`
        );
      } else if (newStatus === "Converted") {
        showToast("Order marked as Payment Received. Fulfillment process started.");
      }
    } catch {
      showToast("Failed to update order status. Please try again.");
    }
  };

  const cancelLead = async (
    displayId: string,
    reason: CancellationReason,
  ) => {
    const backendId = backendIdMap[displayId];
    if (!backendId) return;
    try {
      const updated = await callAction(cancelLeadAction(backendId, reason));
      const adapted = adaptLead(updated);
      setLeads((prev) => prev.map((l) => (l.id === displayId ? adapted : l)));
    } catch {
      showToast("Failed to cancel order. Please try again.");
    }
  };


  const modeFilteredLeads = leads.filter(
    (l) => leadMode === "all" || l.type === leadMode
  );

  const counts = {
    all: modeFilteredLeads.filter((l) => l.status !== "Cancelled Orders").length,
    "new-lead": modeFilteredLeads.filter((l) => l.status === "New Order").length,
    synced: modeFilteredLeads.filter((l) => l.status === "Order Confirmed").length,
    converted: modeFilteredLeads.filter((l) => l.status === "Converted").length,
    lost: modeFilteredLeads.filter((l) => l.status === "Cancelled Orders").length,
  };

  const filteredLeads = modeFilteredLeads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    const matchesStatus =
      (activeTab === "all" && lead.status !== "Cancelled Orders") ||
      (activeTab === "new-lead" && lead.status === "New Order") ||
      (activeTab === "synced" && lead.status === "Order Confirmed") ||
      (activeTab === "converted" && lead.status === "Converted") ||
      (activeTab === "lost" && lead.status === "Cancelled Orders");
    const matchesSearch =
      !q ||
      lead.id.toLowerCase().includes(q) ||
      lead.customer.city.toLowerCase().includes(q) ||
      (lead.status !== "New Order" &&
        lead.customer.name.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (!sortConfig) return 0;
    if (sortConfig.key === "value")
      return sortConfig.direction === "asc"
        ? a.total - b.total
        : b.total - a.total;
    if (sortConfig.key === "date")
      return sortConfig.direction === "asc"
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    return 0;
  });

  const selectedLead = leads.find((l) => l.id === selectedLeadId) ?? null;

  return (
    <div className="p-6 md:p-8 w-full space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg max-w-sm">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-dark mb-1 tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-gray-500">
            Track AI-generated orders and purchase intents from SimulaFly.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-48 shrink-0">
          <nav className="flex flex-col space-y-1">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Pipeline Status
              </span>
            </div>
            {(
              [
                { key: "all", label: "All", color: "bg-[#1FAF9A] text-white" },
                {
                  key: "new-lead",
                  label: "New Order",
                  color: "bg-blue-100 text-blue-700",
                },
                {
                  key: "synced",
                  label: "Order Confirmed",
                  color: "bg-amber-100 text-amber-700",
                },
                {
                  key: "converted",
                  label: "Converted",
                  color: "bg-emerald-100 text-emerald-700",
                },
                {
                  key: "lost",
                  label: "Cancelled Orders",
                  color: "bg-gray-100 text-gray-500",
                },
              ] as const
            ).map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === key
                    ? "bg-[#1FAF9A]/10 text-[#1FAF9A]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${
                    activeTab === key ? "bg-[#1FAF9A] text-white" : color
                  }`}
                >
                  {counts[key as keyof typeof counts]}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search + Table */}
        <div className="flex-1 relative">
          <div className="relative mb-4">
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by Order ID, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1FAF9A] focus:ring-1 focus:ring-[#1FAF9A] transition-all shadow-sm"
            />
          </div>

          <div className="flex-1 bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#F8FAFB] border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th
                      className="w-[18%] px-6 py-4 cursor-pointer hover:text-gray-600 transition-colors"
                      onClick={() =>
                        setSortConfig((c) => ({
                          key: "date",
                          direction:
                            c?.key === "date" && c.direction === "desc"
                              ? "asc"
                              : "desc",
                        }))
                      }
                    >
                      <div className="flex items-center gap-1">
                        Order ID & Date
                        {sortConfig?.key === "date" &&
                          (sortConfig.direction === "desc" ? " ↓" : " ↑")}
                      </div>
                    </th>
                    <th className="w-[18%] px-6 py-4">Customer</th>
                    <th className="w-[18%] px-6 py-4">Order Type</th>
                    <th
                      className="w-[16%] px-6 py-4 cursor-pointer hover:text-gray-600 transition-colors"
                      onClick={() =>
                        setSortConfig((c) => ({
                          key: "value",
                          direction:
                            c?.key === "value" && c.direction === "desc"
                              ? "asc"
                              : "desc",
                        }))
                      }
                    >
                      <div className="flex items-center justify-end gap-1">
                        Order Value
                        {sortConfig?.key === "value" &&
                          (sortConfig.direction === "desc" ? " ↓" : " ↑")}
                      </div>
                    </th>
                    <th className="w-[15%] px-6 py-4 text-center">Shopper Interactions</th>
                    <th className="w-[15%] px-6 py-4 text-right pr-9">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        No orders found for this filter.
                      </td>
                    </tr>
                  ) : (
                    sortedLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-neutral-dark group-hover:text-[#1FAF9A] transition-colors">
                            {lead.id}
                          </p>
                          <p className="text-[11px] font-medium text-gray-500">
                            {lead.date}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-neutral-dark truncate">
                            {lead.status === "New Order"
                              ? "Protected Customer"
                              : lead.customer.name}
                          </p>
                          <p className="text-[11px] font-medium text-gray-500 truncate">
                            {lead.customer.city}, India
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                          {lead.type === "direct_purchase"
                            ? "Purchase Intent"
                            : lead.type === "cart_abandonment"
                              ? "Abandoned Cart"
                              : "High Intent View"}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-neutral-dark text-right tabular-nums">
                          ₹{lead.total.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className="inline-flex items-center bg-[#1FAF9A]/10 text-[#1FAF9A] px-2 py-1 rounded text-xs font-bold">
                              {lead.aiInteractions}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-xs font-bold flex items-center gap-1.5">
                              {lead.status === "Converted" ? (
                                <span className="text-emerald-600 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {lead.status}
                                </span>
                              ) : lead.status === "Cancelled Orders" ? (
                                <span className="text-gray-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                  {lead.status}
                                </span>
                              ) : lead.status === "Order Confirmed" ? (
                                <span className="text-amber-600 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  {lead.status}
                                </span>
                              ) : (
                                <span className="text-blue-600 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  {lead.status}
                                </span>
                              )}
                            </span>
                            <button className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-neutral-dark transition-colors">
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLeadId(null)}
        onUpdateStatus={updateLeadStatus}
        onCancelLead={cancelLead}
        onShowToast={showToast}
      />
    </div>
  );
}
