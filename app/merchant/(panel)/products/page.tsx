"use client";

import { useState } from "react";
import { useMerchant, Product } from "../../context/MerchantContext";
import { ProductEditModal } from "./ProductEditModal";

export default function ProductsPage() {
  const { products, updateProduct, showToast } = useMerchant();
  const [activeTab, setActiveTab] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const counts = {
    all: products.length,
    active: products.filter(p => p.status === 'Published').length,
    draft: products.filter(p => p.status === 'Draft List').length,
  };

  const filteredProducts = products.filter(product => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return product.status === 'Published';
    if (activeTab === 'draft') return product.status === 'Draft List';
    return true;
  });

  const handleSave = (id: string, updates: Partial<Product>) => {
    updateProduct(id, updates);
    showToast(`Product ${updates.name || 'catalog'} updated successfully.`, 'success');
  };

  return (
    <div className="p-6 md:p-8 w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-dark mb-1 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-gray-500">Manage your inventory, prices, and track AI performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-200 bg-white text-neutral-dark text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Export CSV
          </button>
          <button 
            className="px-4 py-2 bg-[#1FAF9A] text-white text-sm font-semibold rounded-lg hover:bg-[#189986] transition-colors shadow-sm flex items-center gap-2"
            onClick={() => setEditingProduct({ id: '', name: '', category: '', status: 'Draft List', sellPrice: 0, aiConversions: 0, img: 'bg-gray-100' })}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'all' ? "bg-white border border-gray-200 text-neutral-dark shadow-sm" : "text-gray-500 hover:text-neutral-dark hover:bg-gray-50"}`}
        >
          All Products <span className={`text-[10px] py-0.5 px-2 rounded-full ${activeTab === 'all' ? 'bg-gray-100' : 'bg-gray-100'}`}>{counts.all}</span>
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'active' ? "bg-white border border-gray-200 text-neutral-dark shadow-sm" : "text-gray-500 hover:text-neutral-dark hover:bg-gray-50"}`}
        >
          Active <span className={`text-[10px] py-0.5 px-2 rounded-full ${activeTab === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}`}>{counts.active}</span>
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'draft' ? "bg-white border border-gray-200 text-neutral-dark shadow-sm" : "text-gray-500 hover:text-neutral-dark hover:bg-gray-50"}`}
        >
          Drafts <span className={`text-[10px] py-0.5 px-2 rounded-full ${activeTab === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100'}`}>{counts.draft}</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-100 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFB] border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Selling Price</th>
                <th className="px-6 py-4 text-center">SimulaFly AI Leads</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${product.img} shrink-0 border border-gray-100`} />
                      <div>
                        <p className="text-sm font-bold text-neutral-dark group-hover:text-[#1FAF9A] transition-colors cursor-pointer" onClick={() => setEditingProduct(product)}>{product.name}</p>
                        <p className="text-[11px] font-mono text-gray-500 mt-0.5">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-600">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    {product.status === 'Published' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Active</span>}
                    {product.status === 'Draft List' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Draft</span>}
                    {product.status === 'Out of Stock' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Out of Stock</span>}
                    {product.status === 'Inactive' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>Inactive</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-bold text-neutral-dark">₹{product.sellPrice.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Stock: {product.stock}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-[#1FAF9A]/10 text-[#1FAF9A] px-2 py-1 rounded text-xs font-bold" title={`${product.aiMentions} AI views`}>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      {product.aiConversions} Leads
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setEditingProduct(product)}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded hover:bg-gray-50 hover:text-[#1FAF9A] transition-colors shadow-sm inline-flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductEditModal 
        product={editingProduct} 
        onClose={() => setEditingProduct(null)} 
        onSave={handleSave} 
      />
    </div>
  );
}
