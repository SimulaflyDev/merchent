"use client";

import { useState } from "react";
import { useMerchant, Lead } from "../../context/MerchantContext";
import { LeadDrawer } from "./LeadDrawer";

export default function LeadsPage() {
  const { leads, updateLeadStatus, showToast } = useMerchant();
  const [activeTab, setActiveTab] = useState("all");
  const [leadMode, setLeadMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: 'date' | 'value', direction: 'asc' | 'desc' } | null>(null);

  const modeFilteredLeads = leads.filter(l => leadMode === 'all' || l.type === leadMode);

  const counts = {
    all: modeFilteredLeads.length,
    'new-lead': modeFilteredLeads.filter(l => l.status === 'New Lead').length,
    'synced': modeFilteredLeads.filter(l => l.status === 'Synced').length,
    'converted': modeFilteredLeads.filter(l => l.status === 'Converted').length,
    'lost': modeFilteredLeads.filter(l => l.status === 'Lost').length
  };

  const filteredLeads = modeFilteredLeads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    const matchesStatus = activeTab === 'all' || 
      (activeTab === 'new-lead' && lead.status === 'New Lead') ||
      (activeTab === 'synced' && lead.status === 'Synced') ||
      (activeTab === 'converted' && lead.status === 'Converted') ||
      (activeTab === 'lost' && lead.status === 'Lost');
    const matchesSearch = !q || 
      lead.id.toLowerCase().includes(q) ||
      lead.customer.city.toLowerCase().includes(q) ||
      (lead.status !== 'New Lead' && lead.customer.name.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (!sortConfig) return 0;
    if (sortConfig.key === 'value') {
      return sortConfig.direction === 'asc' ? a.total - b.total : b.total - a.total;
    }
    if (sortConfig.key === 'date') {
      // Basic date string comparison for mock
      return sortConfig.direction === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    }
    return 0;
  });

  const selectedLead = leads.find(l => l.id === selectedLeadId) || null;

  return (
    <div className="p-6 md:p-8 w-full space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-dark mb-1 tracking-tight">Orders</h1>
          <p className="text-sm text-gray-500">Track AI-generated leads and purchase intents from SimulaFly.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setLeadMode(leadMode === 'direct_purchase' ? 'all' : 'direct_purchase')}
            className={`px-4 py-2 border text-sm font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 ${leadMode === 'direct_purchase' ? 'bg-[#1FAF9A] border-[#1FAF9A] text-white' : 'bg-white border-gray-200 text-neutral-dark hover:bg-gray-50'}`}
          >
            <svg className={`w-4 h-4 ${leadMode === 'direct_purchase' ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Direct Purchases
          </button>
          <button 
            onClick={() => setLeadMode(leadMode === 'high_intent_view' ? 'all' : 'high_intent_view')}
            className={`px-4 py-2 border text-sm font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 ${leadMode === 'high_intent_view' ? 'bg-[#1FAF9A] border-[#1FAF9A] text-white' : 'bg-white border-gray-200 text-neutral-dark hover:bg-gray-50'}`}
          >
            <svg className={`w-4 h-4 ${leadMode === 'high_intent_view' ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            High Intent Views
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar Filter/Tabs */}
        <div className="w-full md:w-48 shrink-0">
          <nav className="flex flex-col space-y-1">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pipeline Status</span>
            </div>
            
            <button
              onClick={() => setActiveTab('all')}
              className={`flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'all' ? "bg-[#1FAF9A]/10 text-[#1FAF9A]" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>All</span>
              <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${activeTab === 'all' ? 'bg-[#1FAF9A] text-white' : 'bg-gray-100 text-gray-500'}`}>{counts.all}</span>
            </button>
            <button
              onClick={() => setActiveTab('new-lead')}
              className={`flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'new-lead' ? "bg-[#1FAF9A]/10 text-[#1FAF9A]" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>New Lead</span>
              <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${activeTab === 'new-lead' ? 'bg-[#1FAF9A] text-white' : 'bg-blue-100 text-blue-700'}`}>{counts['new-lead']}</span>
            </button>
            <button
              onClick={() => setActiveTab('synced')}
              className={`flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'synced' ? "bg-[#1FAF9A]/10 text-[#1FAF9A]" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>Synced/Ack</span>
              <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${activeTab === 'synced' ? 'bg-[#1FAF9A] text-white' : 'bg-amber-100 text-amber-700'}`}>{counts.synced}</span>
            </button>
            <button
              onClick={() => setActiveTab('converted')}
              className={`flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'converted' ? "bg-[#1FAF9A]/10 text-[#1FAF9A]" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>Converted</span>
              <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${activeTab === 'converted' ? 'bg-[#1FAF9A] text-white' : 'bg-emerald-100 text-emerald-700'}`}>{counts.converted}</span>
            </button>
            <button
              onClick={() => setActiveTab('lost')}
              className={`flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'lost' ? "bg-[#1FAF9A]/10 text-[#1FAF9A]" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>Lost</span>
              <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${activeTab === 'lost' ? 'bg-[#1FAF9A] text-white' : 'bg-gray-100 text-gray-500'}`}>{counts.lost}</span>
            </button>
          </nav>
        </div>

        {/* Search bar */}
        <div className="flex-1 relative">
          <div className="relative mb-4">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Search by Order ID, city..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1FAF9A] focus:ring-1 focus:ring-[#1FAF9A] transition-all shadow-sm"
            />
          </div>

        {/* Main Table Content */}
        <div className="flex-1 bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="bg-[#F8FAFB] border-b border-gray-100 px-6 py-4 grid grid-cols-12 gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest items-center">
                <div 
                  className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-gray-600 transition-colors"
                  onClick={() => setSortConfig(current => ({ key: 'date', direction: current?.key === 'date' && current.direction === 'desc' ? 'asc' : 'desc' }))}
                >
                  Lead ID & Date
                  {sortConfig?.key === 'date' && (sortConfig.direction === 'desc' ? ' ↓' : ' ↑')}
                </div>
                <div className="col-span-2">Customer</div>
                <div className="col-span-2">Lead Type</div>
                <div 
                  className="col-span-2 text-right cursor-pointer flex items-center justify-end gap-1 hover:text-gray-600 transition-colors"
                  onClick={() => setSortConfig(current => ({ key: 'value', direction: current?.key === 'value' && current.direction === 'desc' ? 'asc' : 'desc' }))}
                >
                  Potential Value
                  {sortConfig?.key === 'value' && (sortConfig.direction === 'desc' ? ' ↓' : ' ↑')}
                </div>
                <div className="col-span-2 text-center">AI Interactions</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {/* Body */}
              <div className="divide-y divide-gray-50">
                {sortedLeads.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-gray-500">No leads found for this filter.</div>
                ) : sortedLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <div className="col-span-2">
                      <p className="text-sm font-bold text-neutral-dark group-hover:text-[#1FAF9A] transition-colors">{lead.id}</p>
                      <p className="text-[11px] font-medium text-gray-500">{lead.date}</p>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-sm font-bold text-neutral-dark truncate">
                        {lead.status === 'New Lead' ? 'Protected Customer' : lead.customer.name}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500 truncate">
                        {lead.customer.city}, India
                      </p>
                    </div>
                    
                    <div className="col-span-2 text-sm font-medium text-gray-600">
                      {lead.type === 'direct_purchase' ? 'Purchase Intent' : 
                       lead.type === 'cart_abandonment' ? 'Abandoned Cart' : 
                       'High Intent View'}
                    </div>
                    
                    <div className="col-span-2 text-sm font-bold text-neutral-dark text-right tabular-nums">
                      ₹{lead.total.toLocaleString('en-IN')}
                    </div>

                    <div className="col-span-2 flex justify-center">
                       <span className="inline-flex items-center gap-1 bg-[#1FAF9A]/10 text-[#1FAF9A] px-2 py-1 rounded text-xs font-bold">
                         <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                         {lead.aiInteractions}
                       </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-3">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        {lead.status === 'Converted' ? (
                          <span className="text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{lead.status}</span>
                        ) : lead.status === 'Lost' ? (
                          <span className="text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>{lead.status}</span>
                        ) : lead.status === 'Synced' ? (
                          <span className="text-amber-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{lead.status}</span>
                        ) : (
                          <span className="text-blue-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{lead.status}</span>
                        )}
                      </span>
                      <button className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-neutral-dark transition-colors">
                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div> {/* end Main Table Content */}
        </div> {/* end search and table wrapper */}

      </div> {/* end flex row */}

      <LeadDrawer 
        lead={selectedLead} 
        onClose={() => setSelectedLeadId(null)}
        onUpdateStatus={updateLeadStatus}
      />
    </div>
  );
}
