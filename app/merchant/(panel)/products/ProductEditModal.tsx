"use client";

import { useState, useEffect } from "react";
import { Product } from "../../context/MerchantContext";

interface ProductEditModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Product>) => void;
}

export function ProductEditModal({ product, onClose, onSave }: ProductEditModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  if (!product) return null;

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#F8FAFB]">
          <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-200 text-gray-500 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Visual Indicator */}
          <div className="flex gap-4 mb-2">
            <div className={`w-20 h-20 rounded-lg ${product.img} shrink-0`} />
            <div>
              <p className="font-bold text-gray-900 text-lg">{product.name}</p>
              <p className="text-sm text-gray-500 font-mono mt-1">{product.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selling Price (₹)</label>
              <input 
                type="number" 
                value={formData.sellPrice || ''}
                onChange={e => handleChange('sellPrice', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#1FAF9A] focus:ring-1 focus:ring-[#1FAF9A]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Available</label>
              <input 
                type="number" 
                value={formData.stock || ''}
                onChange={e => handleChange('stock', Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#1FAF9A] focus:ring-1 focus:ring-[#1FAF9A]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Status</label>
            <select 
              value={formData.status || ''}
              onChange={e => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#1FAF9A] focus:ring-1 focus:ring-[#1FAF9A]"
            >
              <option value="Published">Published Active</option>
              <option value="Draft List">Draft / Hidden</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* AI Info Block (Readonly) */}
          <div className="bg-[#1FAF9A]/5 border border-[#1FAF9A]/20 rounded-xl p-4 mt-2">
            <p className="text-xs font-bold text-[#1FAF9A] uppercase tracking-wider mb-2">SimulaFly AI Metrics</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-black text-gray-900">{product.aiMentions}</p>
                <p className="text-[10px] font-medium text-gray-500">AI VISUALIZATIONS</p>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{product.aiConversions}</p>
                <p className="text-[10px] font-medium text-gray-500">LEADS GENERATED</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-[#1FAF9A] text-white font-bold text-sm rounded-lg hover:bg-[#189986] transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
