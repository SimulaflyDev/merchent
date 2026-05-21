"use client";

import { useState, useMemo } from "react";
import { useMerchant, Product } from "../../context/MerchantContext";
import { ProductEditModal } from "./ProductEditModal";
import { ProductPreviewModal } from "./ProductPreviewModal";
import { ProductImportModal } from "./ProductImportModal";

// ─── Utilities ────────────────────────────────────────────────────────────────

function getProductHealth(p: Product): number {
  let score = 0;
  if (p.name) score += 20;
  if (p.sellPrice) score += 20;
  if (p.roomStorytelling?.placements?.length) score += 20;
  if (p.img && p.img !== 'bg-gray-100') score += 20;
  if (p.v2Dimensions?.width) score += 20;
  return score;
}

function getMissingFields(p: Product): string[] {
  const m: string[] = [];
  if (!p.name) m.push("Title");
  if (!p.sellPrice) m.push("Price");
  if (!p.roomStorytelling?.placements?.length) m.push("Room Placement");
  if (!p.img || p.img === 'bg-gray-100') m.push("Cover Image");
  if (!p.v2Dimensions?.width) m.push("Dimensions");
  return m;
}

// ─── Status Badge — minimal, two colors only ──────────────────────────────────

function StatusBadge({ status, health }: { status: Product['status']; health: number }) {
  const base = "inline-flex items-center gap-1.5 text-[10px] font-medium";

  if (status === 'Published') return (
    <span className={`${base} text-[#0E9F88]`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F88]" />
      Published
    </span>
  );
  if (status === 'Out of Stock') return (
    <span className={`${base} text-gray-400`}>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
      Out of Stock
    </span>
  );
  if (status === 'Draft List' && health === 100) return (
    <span className={`${base} text-gray-600`}>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Ready to Publish
    </span>
  );
  if (status === 'Draft List' && health < 60) return (
    <span className={`${base} text-gray-400`}>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
      Incomplete
    </span>
  );
  return (
    <span className={`${base} text-gray-400`}>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
      Draft
    </span>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

function ProductThumb({ img, name, onClick }: { img: string; name: string; onClick: () => void }) {
  const isUrl = img && !img.startsWith('bg-') && img !== 'bg-gray-100';
  return (
    <button
      onClick={onClick}
      title="Preview"
      className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#EAECEF] bg-[#F8F9FA] hover:opacity-80 transition-opacity cursor-pointer"
    >
      {isUrl ? (
        <img src={img} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full ${img || 'bg-gray-100'}`} />
      )}
    </button>
  );
}

// ─── Readiness Bar — lives in status column ────────────────────────────────────

function ReadinessBar({ score }: { score: number }) {
  const color = score === 100 ? 'bg-[#0E9F88]' : 'bg-gray-200';
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex-1 h-[2px] bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[9px] text-gray-400 tabular-nums shrink-0">{score}%</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { products, updateProduct, showToast } = useMerchant();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleSave = (id: string, updates: Partial<Product>) => {
    updateProduct(id, updates);
    showToast(`${updates.name || 'Product'} updated`, 'success');
  };

  const handleImport = (imported: Partial<Product>[]) => {
    imported.forEach((p) => {
      updateProduct(p.id || `IMP-${Date.now()}`, p);
    });
    showToast(`${imported.length} product${imported.length !== 1 ? 's' : ''} imported`, 'success');
  };

  const counts = useMemo(() => ({
    all: products.length,
    published: products.filter(p => p.status === 'Published').length,
    draft: products.filter(p => p.status === 'Draft List').length,
    ready: products.filter(p => p.status === 'Draft List' && getProductHealth(p) === 100).length,
    needs: products.filter(p => getProductHealth(p) < 100).length,
  }), [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.roomStorytelling?.placements?.some(r => r.toLowerCase().includes(q))
      );
    }
    if (activeTab === 'published') result = result.filter(p => p.status === 'Published');
    else if (activeTab === 'draft') result = result.filter(p => p.status === 'Draft List');
    else if (activeTab === 'ready') result = result.filter(p => p.status === 'Draft List' && getProductHealth(p) === 100);
    else if (activeTab === 'needs') result = result.filter(p => getProductHealth(p) < 100);
    return result;
  }, [products, activeTab, searchQuery]);

  const needsAttention = useMemo(() => products.filter(p => getProductHealth(p) < 100), [products]);
  const mostSaved = useMemo(() =>
    [...products].sort((a, b) => (b.customerInterest?.saves || 0) - (a.customerInterest?.saves || 0))[0],
  [products]);
  const catalogHealth = Math.round((products.filter(p => getProductHealth(p) === 100).length / Math.max(1, products.length)) * 100);

  const TABS = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'published', label: 'Published', count: counts.published },
    { key: 'needs', label: 'Needs Attention', count: counts.needs },
    { key: 'ready', label: 'Ready to Publish', count: counts.ready },
    { key: 'draft', label: 'Draft', count: counts.draft },
  ];

  return (
    <div className="min-h-screen bg-[#EDEEF0]">
      <div className="max-w-[1440px] mx-auto px-8 py-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">Showroom Catalog</h1>
            <p className="text-[12px] text-gray-400 mt-1 font-normal">{counts.all} products · {counts.published} published · {catalogHealth}% catalog ready</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-3.5 bg-white border border-[#EAECEF] text-gray-500 text-[11px] font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Export
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="h-8 px-3.5 bg-white border border-[#EAECEF] text-gray-500 text-[11px] font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Import CSV
            </button>
            <button
              onClick={() => setEditingProduct({
                id: 'NEW-PRODUCT', name: '', category: '',
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                price: 0, sellPrice: 0, stock: 0, status: 'Draft List', img: 'bg-gray-100',
                impressions: 0, clicks: 0, ctr: 0, aiImageGenerations: 0, leadsGenerated: 0, convertedLeads: 0,
                tokenSpend: 0, ragQueries: [], ctrTrend: [], impressionTrend: [], healthScore: 'review', aiRelevanceScore: 0, healthReason: ''
              })}
              className="h-8 px-4 bg-[#111827] text-white text-[11px] font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Product
            </button>
          </div>
        </div>

        {/* ── KPI Strip ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Primary card — Publishing Readiness dominates */}
          <button
            onClick={() => setActiveTab(activeTab === 'needs' ? 'all' : 'needs')}
            className={`text-left p-5 rounded-xl border transition-all ${
              activeTab === 'needs'
                ? 'bg-white border-[#111827] ring-1 ring-[#111827]'
                : 'bg-white border-[#EAECEF] hover:border-gray-300'
            }`}
          >
            <p className="text-[10px] text-gray-400 font-medium mb-3">Publishing Readiness</p>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-[28px] font-bold text-[#111827] leading-none tabular-nums">{catalogHealth}%</p>
              <p className="text-[11px] text-gray-400 mb-0.5 font-normal">complete</p>
            </div>
            <div className="w-full h-[2px] bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#0E9F88] rounded-full transition-all" style={{ width: `${catalogHealth}%` }} />
            </div>
          </button>

          {/* Secondary cards — quieter */}
          <button
            onClick={() => setActiveTab(activeTab === 'published' ? 'all' : 'published')}
            className={`text-left p-5 rounded-xl border transition-all ${
              activeTab === 'published'
                ? 'bg-white border-[#111827] ring-1 ring-[#111827]'
                : 'bg-white border-[#EAECEF] hover:border-gray-300'
            }`}
          >
            <p className="text-[10px] text-gray-400 font-medium mb-3">Published</p>
            <p className="text-[28px] font-bold text-[#111827] leading-none tabular-nums">{counts.published}</p>
            <p className="text-[11px] text-gray-400 mt-1 font-normal">live listings</p>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'ready' ? 'all' : 'ready')}
            className={`text-left p-5 rounded-xl border transition-all ${
              activeTab === 'ready'
                ? 'bg-white border-[#111827] ring-1 ring-[#111827]'
                : 'bg-white border-[#EAECEF] hover:border-gray-300'
            }`}
          >
            <p className="text-[10px] text-gray-400 font-medium mb-3">Ready to Publish</p>
            <p className="text-[28px] font-bold text-[#111827] leading-none tabular-nums">{counts.ready}</p>
            <p className="text-[11px] text-gray-400 mt-1 font-normal">queued</p>
          </button>

          <div className="p-5 rounded-xl border border-[#EAECEF] bg-white">
            <p className="text-[10px] text-gray-400 font-medium mb-3">Top Saved Product</p>
            <p className="text-[13px] font-semibold text-[#111827] leading-tight truncate">{mostSaved?.name || '—'}</p>
            <p className="text-[11px] text-gray-400 mt-1 font-normal">{mostSaved?.customerInterest?.saves || (((mostSaved?.name || '').length * 3 % 50) + 12)} shopper saves</p>
          </div>
        </div>

        {/* ── Main Layout: Table (9) + Rail (3) ───────────────────────────── */}
        <div className="flex gap-6 items-start">

          {/* ── Table Area ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, SKU, rooms…"
                className="w-full h-9 pl-9 pr-14 bg-white border border-[#EAECEF] rounded-lg text-[12px] text-gray-700 placeholder-gray-300 font-normal focus:outline-none focus:border-[#0E9F88] focus:ring-1 focus:ring-[#0E9F88]/30 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-medium text-gray-300 border border-gray-200 px-1.5 py-0.5 rounded">⌘K</span>
            </div>

            {/* Tabs — calm pill group */}
            <div className="flex items-center gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all ${
                    activeTab === tab.key
                      ? 'bg-[#111827] text-white font-medium'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white font-normal'
                  }`}
                >
                  {tab.label}
                  <span className={`text-[9px] tabular-nums ${activeTab === tab.key ? 'opacity-60' : 'text-gray-400'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#EAECEF] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F1F3F5]">
                    <th className="px-5 py-3 text-[10px] font-medium text-gray-400">Product</th>
                    <th className="px-4 py-3 text-[10px] font-medium text-gray-400">Category</th>
                    <th className="px-4 py-3 text-[10px] font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-[10px] font-medium text-gray-400 text-right">Price</th>
                    <th className="px-4 py-3 text-[10px] font-medium text-gray-400 text-right">Saves</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center">
                        <p className="text-[12px] text-gray-400 font-normal">No products match this filter.</p>
                        <button onClick={() => { setSearchQuery(''); setActiveTab('all'); }} className="mt-2 text-[11px] text-[#0E9F88] font-medium hover:underline">
                          Clear filter
                        </button>
                      </td>
                    </tr>
                  )}
                  {filteredProducts.map((product, idx) => {
                    const health = getProductHealth(product);
                    const saves = product.customerInterest?.saves || ((product.name || '').length * 3 % 50) + 12;
                    const missing = getMissingFields(product);
                    return (
                      <tr
                        key={product.id}
                        className={`group hover:bg-[#FAFBFC] transition-colors border-l-2 hover:border-l-[#0E9F88] border-transparent ${idx < filteredProducts.length - 1 ? 'border-b border-[#F1F3F5]' : ''}`}
                      >
                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <ProductThumb img={product.img} name={product.name} onClick={() => setPreviewProduct(product)} />
                            <div className="min-w-0">
                              <p
                                onClick={() => setPreviewProduct(product)}
                                className="text-[13px] font-semibold text-[#111827] cursor-pointer hover:text-[#0E9F88] transition-colors truncate leading-tight"
                              >{product.name || 'Untitled Product'}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{product.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <p className="text-[12px] text-gray-600 font-normal">{product.category || 'Uncategorized'}</p>
                          {product.roomStorytelling?.placements?.[0] && (
                            <p className="text-[10px] text-gray-400 mt-0.5 font-normal">{product.roomStorytelling.placements[0]}</p>
                          )}
                        </td>

                        {/* Status + Readiness */}
                        <td className="px-4 py-4">
                          <StatusBadge status={product.status} health={health} />
                          <ReadinessBar score={health} />
                          {missing.length > 0 && (
                            <p className="text-[9px] text-gray-400 mt-1 font-normal truncate max-w-[130px]">
                              {missing.slice(0, 2).join(', ')}{missing.length > 2 ? ` +${missing.length - 2}` : ''}
                            </p>
                          )}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4 text-right">
                          <p className="text-[13px] font-semibold text-[#111827] tabular-nums">₹{(product.sellPrice || 0).toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 tabular-nums">{product.stock} in stock</p>
                        </td>

                        {/* Saves */}
                        <td className="px-4 py-4 text-right">
                          <p className="text-[13px] font-semibold text-[#111827] tabular-nums">{saves}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">saves</p>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setPreviewProduct(product)}
                              className="px-2.5 py-1 text-[10px] text-gray-500 font-medium border border-[#EAECEF] rounded-md hover:bg-gray-50 transition-colors bg-white"
                            >Preview</button>
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="px-2.5 py-1 text-[10px] text-white font-medium bg-[#111827] rounded-md hover:bg-black transition-colors"
                            >Edit</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Trending — text list, not cards */}
            <div className="pt-4 pb-2">
              <p className="text-[10px] text-gray-400 font-medium mb-3">Trending in customer searches</p>
              <div className="flex items-center gap-6">
                {[
                  { term: 'Compact Sofa', pct: '+34%' },
                  { term: 'Warm Walnut', pct: '+28%' },
                  { term: 'Japandi', pct: '+22%' },
                  { term: 'Minimal TV Unit', pct: '+17%' },
                ].map(t => (
                  <button
                    key={t.term}
                    onClick={() => setSearchQuery(t.term)}
                    className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-[#0E9F88] transition-colors group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-[#0E9F88] transition-colors" />
                    {t.term}
                    <span className="text-[10px] text-gray-400">{t.pct}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Rail — single surface, no inner cards ─────────────────── */}
          <div
            className="w-[240px] shrink-0 sticky top-0 self-start rounded-xl border border-[#DDDFE3] bg-white overflow-hidden shadow-sm"
          >
            {/* Needs Action */}
            {needsAttention.length > 0 && (
              <div className="px-5 pt-5 pb-4 border-b border-[#EAECEF]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-medium text-gray-500">Needs Action</p>
                  <span className="text-[9px] font-bold text-white bg-[#111827] w-4 h-4 rounded-full flex items-center justify-center">
                    {Math.min(needsAttention.length, 9)}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {needsAttention.slice(0, 3).map(p => (
                    <li key={p.id}>
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="w-full text-left group"
                      >
                        <p className="text-[11px] font-medium text-[#111827] truncate group-hover:text-[#0E9F88] transition-colors">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-normal mt-0.5 truncate">{getMissingFields(p).slice(0, 2).join(', ')}</p>
                      </button>
                    </li>
                  ))}
                  {needsAttention.length > 3 && (
                    <li>
                      <button onClick={() => setActiveTab('needs')} className="text-[10px] text-gray-400 hover:text-[#0E9F88] transition-colors">
                        +{needsAttention.length - 3} more listings
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Catalog Health */}
            <div className="px-5 py-4 border-b border-[#EAECEF]">
              <p className="text-[10px] font-medium text-gray-500 mb-3">Catalog Health</p>
              <div className="space-y-2.5">
                <button onClick={() => setActiveTab('all')} className="w-full flex justify-between items-center text-[11px] hover:text-[#0E9F88] transition-colors text-gray-600">
                  <span className="font-normal">Fully merchandised</span>
                  <span className="font-medium text-[#111827]">{products.filter(p => getProductHealth(p) === 100).length}</span>
                </button>
                <button onClick={() => setActiveTab('needs')} className="w-full flex justify-between items-center text-[11px] hover:text-[#0E9F88] transition-colors text-gray-500">
                  <span className="font-normal">Missing image</span>
                  <span className="font-medium text-[#111827]">{products.filter(p => !p.img || p.img === 'bg-gray-100').length}</span>
                </button>
                <button onClick={() => setActiveTab('needs')} className="w-full flex justify-between items-center text-[11px] hover:text-[#0E9F88] transition-colors text-gray-500">
                  <span className="font-normal">Missing dimensions</span>
                  <span className="font-medium text-[#111827]">{products.filter(p => !p.v2Dimensions?.width).length}</span>
                </button>
                <button onClick={() => setActiveTab('needs')} className="w-full flex justify-between items-center text-[11px] hover:text-[#0E9F88] transition-colors text-gray-500">
                  <span className="font-normal">Missing room tag</span>
                  <span className="font-medium text-[#111827]">{products.filter(p => !p.roomStorytelling?.placements?.length).length}</span>
                </button>
              </div>
            </div>

            {/* Trending terms */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-medium text-gray-500 mb-3">Trending searches</p>
              <div className="space-y-2">
                {['Compact Sofa', 'Japandi', 'Walnut', 'Studio Apartment'].map(term => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="block text-[11px] text-gray-500 hover:text-[#0E9F88] transition-colors text-left font-normal"
                  >{term}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <ProductEditModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSave}
      />
      {previewProduct && (
        <ProductPreviewModal
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
        />
      )}
      {showImportModal && (
        <ProductImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
}
