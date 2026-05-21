"use client";

import { useState, useEffect } from "react";
import Wheel from '@uiw/react-color-wheel';
import ShadeSlider from '@uiw/react-color-shade-slider';
import { hsvaToHex, hexToHsva } from '@uiw/color-convert';
import { Product, ProductVariant } from "../../context/MerchantContext";

const CATEGORY_MAP: Record<string, string[]> = {
  "Furniture": ["Sofas", "Sectionals", "Sofa Cum Beds", "Accent Chairs", "Lounge Chairs", "Recliners", "Coffee Tables", "Side Tables", "Console Tables", "TV Units", "Bookshelves", "Display Units", "Cabinets", "Cabinets with Glass", "Ottomans", "Poufs", "Beds", "Bed Frames", "Storage Beds", "Headboards", "Wardrobes", "Dressing Tables", "Dining Tables", "Dining Chairs", "Benches", "Bar Stools", "Office Desks", "Office Chairs", "Gaming Desks", "Storage Cabinets", "Shoe Racks"],
  "Decor": ["Vases", "Sculptures", "Figurines", "Candle Holders", "Wall Art", "Photo Frames", "Mirrors", "Clocks", "Trays", "Decorative Bowls", "Table Decor", "Floor Decor", "Centerpieces"],
  "Furnishing": ["Curtains", "Drapes", "Blinds", "Cushions", "Throws", "Bed Linen", "Bedsheets", "Blankets", "Carpets", "Rugs", "Table Linen", "Upholstery Fabric"],
  "Lighting": ["Ceiling Lights", "Chandeliers", "Pendant Lights", "Wall Lights", "Floor Lamps", "Table Lamps", "Study Lamps", "Bedside Lamps", "Cove Lights", "Track Lights", "Spot Lights", "Smart Lights"],
  "Wall": ["Wallpaper", "Wall Panels", "Fluted Panels", "Wood Panels", "Stone Cladding", "Wall Tiles", "Paint Finish", "Wall Art Panels"],
  "Ceiling": ["False Ceiling", "Cove Ceiling", "Wooden Ceiling", "Gypsum Ceiling", "Decorative Ceiling Panels", "Acoustic Ceiling Panels"],
  "Flooring": ["Vitrified Tiles", "Ceramic Tiles", "Marble Flooring", "Granite Flooring", "Wooden Flooring", "Laminate Flooring", "Vinyl Flooring", "SPC Flooring", "Rugs", "Carpets"],
  "Kitchen": ["Modular Kitchens", "Base Cabinets", "Wall Cabinets", "Tall Units", "Pantry Units", "Kitchen Islands", "Countertops", "Kitchen Sinks", "Chimneys", "Backsplash Tiles", "Kitchen Hardware"],
  "Bathroom": ["Wash Basins", "Wall Hung Toilets", "Bathtubs", "Shower Panels", "Faucets", "Mirrors", "Vanity Units", "Bathroom Cabinets", "Tiles", "Accessories"],
  "Outdoor": ["Balcony Furniture", "Patio Furniture", "Garden Furniture", "Outdoor Sofas", "Outdoor Chairs", "Outdoor Tables", "Swing Chairs", "Planters", "Outdoor Lighting", "Deck Flooring"],
  "Plants": ["Artificial Plants", "Indoor Plants", "Outdoor Plants", "Hanging Plants", "Bonsai", "Planters", "Plant Stands", "Vertical Gardens"],
  "Storage": ["Shelves", "Cabinets", "Drawers", "Sideboards", "Crockery Units", "Wardrobes", "Shoe Cabinets", "Utility Cabinets"],
  "Doors & Windows": ["Main Doors", "Interior Doors", "Sliding Doors", "Glass Doors", "Windows", "Window Grills", "Curtains", "Blinds"],
  "Office": ["Workstations", "Office Desks", "Executive Desks", "Office Chairs", "Meeting Tables", "Storage Units", "Conference Furniture", "Reception Furniture"],
  "Dining": ["Dining Tables", "Dining Chairs", "Benches", "Crockery Units", "Bar Cabinets", "Bar Stools"],
  "Bedroom": ["Beds", "Wardrobes", "Side Tables", "Dressers", "Mirrors", "Headboards", "Bedroom Chairs"],
  "Living Room": ["Sofas", "Chairs", "Coffee Tables", "TV Units", "Console Tables", "Bookshelves", "Lounge Furniture"],
  "Study": ["Study Tables", "Study Chairs", "Bookcases", "Reading Lamps", "Storage Units"],
  "Balcony": ["Balcony Chairs", "Balcony Tables", "Planters", "Swing Chairs", "Outdoor Rugs", "Lanterns"],
  "Entrance": ["Console Tables", "Shoe Cabinets", "Mirrors", "Wall Art", "Lamps", "Decor Accents"],
  "Renovation Materials": ["Tiles", "Paint", "Wallpapers", "Panels", "Flooring", "Ceiling Materials", "Adhesives", "Hardware"]
};

interface ProductEditModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Product>) => void;
}

function CollapsibleSection({ title, defaultOpen = true, children, warning }: { title: string, defaultOpen?: boolean, children: React.ReactNode, warning?: string }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 bg-white mb-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div 
        className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">{title}</h3>
          {warning && (
            <span className="text-gray-500 text-[11px] font-medium flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {warning}
            </span>
          )}
        </div>
        <svg className={`w-4 h-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {isOpen && (
        <div className="p-6 space-y-6">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductEditModal({ product, onClose, onSave }: ProductEditModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [rightTab, setRightTab] = useState<'merchant' | 'customer'>('customer');
  const [activeColorPicker, setActiveColorPicker] = useState<number | null>(null);
  const [pickerHsva, setPickerHsva] = useState({ h: 0, s: 0, v: 100, a: 1 });

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        v2Dimensions: product.v2Dimensions || {},
        v2Materials: product.v2Materials || {},
        roomStorytelling: product.roomStorytelling || { placements: [], bestUsedIn: '', pairsWellWith: '', mood: '' },
        visibility: product.visibility || { status: 'Private Draft', featured: false, priorityTags: [] },
        inventory: product.inventory || { lowStockWarning: 5, preorder: false, madeToOrder: false },
        variants: product.variants || [{ id: 'VAR-1', name: 'Walnut', price: product.sellPrice || 0, stock: product.stock || 0, sku: `${product.id}-WAL`, img: null }],
        media: product.media || { additionalAngles: [], lifestyleImages: [], spatialFileUrl: null }
      });
    }
  }, [product]);

  if (!product) return null;

  const handleChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: keyof Product, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    handleChange('variants', newVariants);
  };

  const addVariant = () => {
    const newVariants = [...(formData.variants || [])];
    newVariants.push({ id: `VAR-${Date.now()}`, name: '', price: 0, stock: 0, sku: '', img: null });
    handleChange('variants', newVariants);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product.id, formData);
    onClose();
  };

  // Hardened typography & inputs
  const inputClass = "w-full h-[38px] px-3 bg-white border border-gray-300 rounded-[3px] text-[13px] text-gray-900 font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-gray-400 transition-colors";
  const labelClass = "block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5";
  const helperClass = "block text-[11px] text-gray-400 mt-1.5 font-medium leading-snug";
  
  // Calculate completion score
  let score = 0;
  const missingFields = [];
  if (formData.name) score += 20; else missingFields.push("Product Title");
  if (formData.sellPrice) score += 20; else missingFields.push("Pricing");
  if (formData.roomStorytelling?.placements?.length) score += 20; else missingFields.push("Room Placement Tags");
  if (formData.img && formData.img !== 'bg-gray-100') score += 20; else missingFields.push("Primary Image");
  if (formData.v2Dimensions?.width) score += 20; else missingFields.push("Dimensions");

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-[75vw] h-full bg-[#F9FAFB] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Product Merchandising</h2>
              <p className="text-[11px] text-gray-500 mt-1 font-mono">{product.id}</p>
            </div>
            {score < 100 && (
              <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-2 rounded-[3px]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-[#DCFCE7]" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4" />
                    <path className="text-[#15803D] transition-all duration-500" strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                  <span className="text-[9px] font-black text-[#15803D] absolute">{score}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#15803D]">Listing Ready</span>
                  <span className="text-[10px] font-medium text-[#166534] opacity-80">Missing: {missingFields[0]}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-gray-400 font-medium">Auto-saved just now</span>
            <button onClick={onClose} className="p-2 rounded-sm hover:bg-gray-100 text-gray-500 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex overflow-hidden">
          
          {/* LEFT SIDE (65%) - Data Entry */}
          <div className="w-[65%] h-full overflow-y-auto px-8 py-8 border-r border-gray-200 space-y-2 custom-scrollbar pb-32">
            
            <CollapsibleSection title="Product Basics" defaultOpen={true}>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Product Title</label>
                  <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} className={`${inputClass} !text-sm font-bold h-[42px]`} placeholder="Primary marketplace title" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Brand</label>
                    <input type="text" value={formData.brand || ''} onChange={(e) => handleChange('brand', e.target.value)} className={inputClass} placeholder="Brand Name" />
                  </div>
                  <div>
                    <label className={labelClass}>Internal SKU</label>
                    <input type="text" value={product.id} readOnly className={`${inputClass} bg-gray-50 text-gray-500 font-mono text-xs`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Where should customers buy this product?</label>
                    <select value={formData.purchaseDestination || 'SimulaFly Checkout'} onChange={(e) => handleChange('purchaseDestination', e.target.value)} className={inputClass}>
                      <option value="SimulaFly Checkout">Buy on SimulaFly</option>
                      <option value="External Website">Buy on Brand Website</option>
                      <option value="Amazon">Buy on Amazon</option>
                      <option value="Shopify">Buy on Shopify</option>
                      <option value="Manual inquiry">Inquiry Only</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Product URL</label>
                    <input type="url" value={formData.url || ''} onChange={(e) => handleChange('url', e.target.value)} className={inputClass} placeholder="https://" />
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Nested Category Hierarchy</h4>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Main Category</label>
                      <select 
                        value={formData.category || ''} 
                        onChange={(e) => {
                          const newCat = e.target.value;
                          handleChange('category', newCat);
                          // Reset subcategory automatically to the first valid option
                          handleChange('subCategory', CATEGORY_MAP[newCat]?.[0] || '');
                        }} 
                        className={inputClass}
                      >
                        <option value="" disabled>Select Main Category</option>
                        {Object.keys(CATEGORY_MAP).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>Subcategory</label>
                      <select 
                        value={formData.subCategory || ''} 
                        onChange={(e) => handleChange('subCategory', e.target.value)} 
                        className={inputClass}
                        disabled={!formData.category}
                      >
                        <option value="" disabled>Select Subcategory</option>
                        {(CATEGORY_MAP[formData.category || ''] || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Product Variants" defaultOpen={true}>
              <div className="space-y-4">
                <p className="text-[11px] text-gray-500 font-medium mb-4">Manage options like color, fabric, and finish.</p>
                
                {/* Variant Table Header */}
                <div className="grid grid-cols-12 gap-3 px-4 mb-2">
                   <div className="col-span-1"></div>
                   <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Variant</div>
                   <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</div>
                   <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock</div>
                   <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU</div>
                   <div className="col-span-1"></div>
                </div>

                {/* Variant Rows */}
                {formData.variants?.map((variant, index) => (
                  <div key={variant.id} className="grid grid-cols-12 gap-3 items-center bg-white border border-gray-200 rounded-[3px] p-2 hover:border-gray-300 transition-colors group">
                    <div className="col-span-1 flex justify-center relative">
                       {/* Interactive Color Chip / Swatch Visual */}
                       <div 
                         className="w-6 h-6 rounded-full shadow-inner border border-gray-200 relative overflow-hidden cursor-pointer" 
                         style={{ backgroundColor: variant.colorCode || (variant.name.toLowerCase().includes('walnut') ? '#5c4033' : variant.name.toLowerCase().includes('oak') ? '#d4b895' : '#e5e7eb') }}
                         onClick={() => {
                           if (activeColorPicker === index) {
                             setActiveColorPicker(null);
                           } else {
                             setActiveColorPicker(index);
                             setPickerHsva(hexToHsva(variant.colorCode || '#e5e7eb'));
                           }
                         }}
                       ></div>
                       
                       {activeColorPicker === index && (
                          <div className="absolute top-8 left-0 z-50 p-4 bg-white shadow-xl border border-gray-200 rounded-lg animate-in fade-in zoom-in-95 duration-200 w-[240px]">
                             <div className="flex justify-between items-center mb-4">
                               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Color</span>
                               <button type="button" onClick={() => setActiveColorPicker(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                               </button>
                             </div>
                             <div className="flex flex-col items-center gap-4">
                               <Wheel 
                                 color={pickerHsva} 
                                 onChange={(color) => {
                                   setPickerHsva(color.hsva);
                                   handleVariantChange(index, 'colorCode', hsvaToHex(color.hsva));
                                 }} 
                               />
                               <ShadeSlider
                                 hsva={pickerHsva}
                                 style={{ width: '100%' }}
                                 onChange={(newShade) => {
                                   const nextHsva = { ...pickerHsva, ...newShade };
                                   setPickerHsva(nextHsva);
                                   handleVariantChange(index, 'colorCode', hsvaToHex(nextHsva));
                                 }}
                               />
                             </div>
                             <div className="mt-4">
                               <input type="text" value={variant.colorCode || '#e5e7eb'} onChange={(e) => handleVariantChange(index, 'colorCode', e.target.value)} className="w-full h-[28px] px-2 bg-white border border-gray-300 rounded-[3px] text-[11px] font-mono text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
                             </div>
                          </div>
                       )}
                    </div>
                    <div className="col-span-3">
                      <input type="text" value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} className={`${inputClass} !h-[32px] !border-transparent hover:!border-gray-300 focus:!border-black bg-transparent`} placeholder="Variant name" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))} className={`${inputClass} !h-[32px] !border-transparent hover:!border-gray-300 focus:!border-black bg-transparent`} placeholder="Price" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))} className={`${inputClass} !h-[32px] !border-transparent hover:!border-gray-300 focus:!border-black bg-transparent`} placeholder="Stock" />
                    </div>
                    <div className="col-span-3">
                      <input type="text" value={variant.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className={`${inputClass} !h-[32px] !border-transparent hover:!border-gray-300 focus:!border-black bg-transparent text-[11px] font-mono`} placeholder="SKU" />
                    </div>
                    <div className="col-span-1 flex justify-end pr-2">
                       <button type="button" className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={addVariant} className="text-[11px] font-bold text-gray-600 hover:text-black border border-gray-200 bg-gray-50 px-4 py-2 rounded-[3px] hover:bg-gray-100 transition-colors inline-flex items-center gap-2 mt-2">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add Variant Option
                </button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Product Details & Materials" defaultOpen={true}>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Structured Dimensions</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className={labelClass}>Width</label>
                      <input type="text" value={formData.v2Dimensions?.width || ''} onChange={(e) => handleNestedChange('v2Dimensions', 'width', e.target.value)} className={inputClass} placeholder="120cm" />
                    </div>
                    <div>
                      <label className={labelClass}>Height</label>
                      <input type="text" value={formData.v2Dimensions?.height || ''} onChange={(e) => handleNestedChange('v2Dimensions', 'height', e.target.value)} className={inputClass} placeholder="80cm" />
                    </div>
                    <div>
                      <label className={labelClass}>Depth</label>
                      <input type="text" value={formData.v2Dimensions?.depth || ''} onChange={(e) => handleNestedChange('v2Dimensions', 'depth', e.target.value)} className={inputClass} placeholder="60cm" />
                    </div>
                    <div>
                      <label className={labelClass}>Weight</label>
                      <input type="text" value={formData.v2Dimensions?.weight || ''} onChange={(e) => handleNestedChange('v2Dimensions', 'weight', e.target.value)} className={inputClass} placeholder="24kg" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Materials & Finish</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Primary Material</label>
                      <input type="text" value={formData.v2Materials?.primary || ''} onChange={(e) => handleNestedChange('v2Materials', 'primary', e.target.value)} className={inputClass} placeholder="e.g., Solid Wood" />
                    </div>
                    <div>
                      <label className={labelClass}>Finish</label>
                      <input type="text" value={formData.v2Materials?.finish || ''} onChange={(e) => handleNestedChange('v2Materials', 'finish', e.target.value)} className={inputClass} placeholder="e.g., Matte Walnut" />
                    </div>
                    <div>
                      <label className={labelClass}>Upholstery</label>
                      <input type="text" value={formData.v2Materials?.upholsteryType || ''} onChange={(e) => handleNestedChange('v2Materials', 'upholsteryType', e.target.value)} className={inputClass} placeholder="e.g., Beige Velvet" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className={labelClass}>About This Item (Bullet Builder)</label>
                  <textarea
                    value={formData.aboutThisItem || ''}
                    onChange={(e) => handleChange('aboutThisItem', e.target.value)}
                    className={`${inputClass} !h-32 py-3 resize-none`}
                    placeholder="Premium engineered wood frame&#10;Soft-touch velvet upholstery"
                  />
                  <p className={helperClass}>One bullet per line. Amazon-style formatting improves conversion.</p>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Room Experience" defaultOpen={false} warning={!formData.roomStorytelling?.placements?.length ? "Missing Room Intelligence" : ""}>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Visual Room Tagging</label>
                  <p className={helperClass}>Where does this product fit best in a customer's home?</p>
                  <div className="flex gap-2 flex-wrap mt-3">
                    {['Living Room', 'Bedroom', 'Dining', 'Studio Apartment', 'Office'].map(room => {
                      const isSelected = formData.roomStorytelling?.placements?.includes(room) || false;
                      return (
                        <label key={room} className={`flex items-center justify-center px-4 py-2 border rounded-[3px] cursor-pointer transition-colors ${isSelected ? 'border-[#059669] bg-[#ECFDF5] text-[#059669]' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                          <input type="checkbox" className="hidden" 
                            checked={isSelected}
                            onChange={(e) => {
                              const current = formData.roomStorytelling?.placements || [];
                              const next = e.target.checked ? [...current, room] : current.filter(r => r !== room);
                              handleNestedChange('roomStorytelling', 'placements', next);
                            }}
                          />
                          <span className="text-[11px] font-bold tracking-wide">{room}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Best Used In</label>
                    <input type="text" value={formData.roomStorytelling?.bestUsedIn || ''} onChange={(e) => handleNestedChange('roomStorytelling', 'bestUsedIn', e.target.value)} className={inputClass} placeholder="e.g., Compact living room" />
                  </div>
                  <div>
                    <label className={labelClass}>Mood / Ambience</label>
                    <input type="text" value={formData.roomStorytelling?.mood || ''} onChange={(e) => handleNestedChange('roomStorytelling', 'mood', e.target.value)} className={inputClass} placeholder="e.g., Warm minimal" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Pairs Well With (Cross-Sell)</label>
                  <input type="text" value={formData.roomStorytelling?.pairsWellWith || ''} onChange={(e) => handleNestedChange('roomStorytelling', 'pairsWellWith', e.target.value)} className={inputClass} placeholder="e.g., Oak coffee table, Neutral rugs" />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Advanced Product Experience" defaultOpen={false}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-3">Spatial Product File</h3>
                  <div className="w-full border-2 border-dashed border-gray-300 rounded-[3px] bg-[#FAFAFA] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black transition-colors">
                    <svg className="w-6 h-6 text-gray-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    <p className="text-[13px] font-bold text-gray-900 mb-1">Upload GLB / USDZ</p>
                    <p className={helperClass}>Used for room placement previews inside SimulaFly.</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Inventory & Publishing" defaultOpen={false}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Product Condition</label>
                  <select className={inputClass}>
                    <option value="New">New</option>
                    <option value="Made to Order">Made to Order</option>
                    <option value="Refurbished">Refurbished</option>
                    <option value="Sample Piece">Sample Piece</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Estimated Delivery Time</label>
                  <input type="text" className={inputClass} placeholder="e.g., 5-7 business days" />
                </div>
                <div>
                  <label className={labelClass}>Low Stock Warning Threshold</label>
                  <input type="number" value={formData.inventory?.lowStockWarning || ''} onChange={(e) => handleNestedChange('inventory', 'lowStockWarning', Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Publish Status</label>
                  <select value={formData.status || ''} onChange={(e) => handleChange('status', e.target.value)} className={inputClass}>
                    <option value="Draft">Draft</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Ready to Publish">Ready to Publish</option>
                    <option value="Published">Published</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Product Visibility & Discoverability" defaultOpen={false}>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Visibility Status</label>
                    <select value={formData.visibility?.status || 'Public'} onChange={(e) => handleNestedChange('visibility', 'status', e.target.value)} className={inputClass}>
                      <option value="Public">Public</option>
                      <option value="Hidden">Hidden</option>
                      <option value="Private Draft">Private Draft</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-black w-4 h-4 rounded-sm" checked={formData.visibility?.featured} onChange={(e) => handleNestedChange('visibility', 'featured', e.target.checked)} />
                      <span className="text-[12px] font-bold text-gray-800">Featured Product (Homepage Priority)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Search Priority Tags</label>
                  <input type="text" className={inputClass} placeholder="e.g., bestseller, premium, trending" />
                  <p className={helperClass}>This product may appear in {formData.roomStorytelling?.placements?.join(' or ') || 'general'} recommendations.</p>
                </div>
              </div>
            </CollapsibleSection>

          </div>

          {/* RIGHT SIDE (35%) - Media & View Mode (Sticky) */}
          <div className="w-[35%] h-full bg-[#FAFAFA] flex flex-col relative border-l border-gray-200">
            {/* View Toggle */}
            <div className="flex p-4 border-b border-gray-200 bg-white shrink-0 gap-2">
              <button 
                type="button"
                onClick={() => setRightTab('merchant')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-[3px] transition-colors ${rightTab === 'merchant' ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              >
                Media Studio
              </button>
              <button 
                type="button"
                onClick={() => setRightTab('customer')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-[3px] transition-colors ${rightTab === 'customer' ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              >
                Customer View
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {rightTab === 'merchant' ? (
                <>
                  {/* Quality Assistance */}
                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-3 rounded-[3px] flex items-start gap-3">
                     <svg className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     <p className="text-[12px] font-medium text-[#1E3A8A] leading-snug">Add at least 3 product images to improve buyer confidence and increase conversion rates.</p>
                  </div>

                  {/* Primary & Lifestyle Images */}
                  <div>
                    <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Product Imagery</h3>
                    
                    {/* Main Image */}
                    <label className="w-full aspect-square bg-white border border-gray-300 rounded-[3px] flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors relative group mb-3 shadow-sm overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleChange('img', URL.createObjectURL(file));
                        }} 
                      />
                      {formData.img && formData.img !== 'bg-gray-100' ? (
                        formData.img.startsWith('blob:') || formData.img.startsWith('http') || formData.img.startsWith('/') ? (
                          <img src={formData.img} className="absolute inset-0 w-full h-full object-cover" alt="Primary cover" />
                        ) : (
                          <div className={`absolute inset-0 ${formData.img} rounded-[3px]`} />
                        )
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-900 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Primary Cover Image</p>
                        </>
                      )}
                    </label>

                    {/* Thumbnails */}
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 mt-4">Additional Views & Lifestyle</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="aspect-square bg-white border border-gray-300 rounded-[3px] flex items-center justify-center cursor-pointer hover:border-gray-500 shadow-sm">
                        <span className="text-sm text-gray-400 font-bold">+</span>
                      </div>
                      <div className="aspect-square bg-white border border-gray-300 rounded-[3px] flex items-center justify-center cursor-pointer hover:border-gray-500 shadow-sm">
                        <span className="text-sm text-gray-400 font-bold">+</span>
                      </div>
                      <div className="aspect-square bg-white border border-dashed border-gray-300 rounded-[3px] flex items-center justify-center cursor-pointer hover:border-gray-500">
                        <span className="text-sm text-gray-400 font-bold">+</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Real Marketplace Preview */}
                  <div>
                    <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Mobile Shopping Experience
                    </h3>
                    
                    <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl overflow-hidden border border-gray-100 max-w-[320px] mx-auto">
                      <div className="w-full aspect-[4/5] bg-[#F3F4F6] relative group overflow-hidden">
                         {formData.img && formData.img !== 'bg-gray-100' && (
                           formData.img.startsWith('blob:') || formData.img.startsWith('http') || formData.img.startsWith('/') ? (
                             <img src={formData.img} className="absolute inset-0 w-full h-full object-cover" alt="Product preview" />
                           ) : (
                             <div className={`absolute inset-0 w-full h-full ${formData.img}`}></div>
                           )
                         )}
                         <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-black text-[9px] font-black px-2.5 py-1 rounded-sm uppercase tracking-widest shadow-sm">
                            {formData.roomStorytelling?.placements?.[0] || 'Room Config'}
                         </div>
                         <button className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform z-10">
                            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                         </button>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">{formData.brand || 'Your Brand'}</p>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-black fill-black" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            <span className="text-[12px] font-bold text-black">{formData.rating || '4.5'}</span>
                          </div>
                        </div>
                        <h4 className="text-xl font-black text-black leading-tight mb-2 tracking-tight">{formData.name || 'Premium Product Title'}</h4>
                        <div className="flex items-end gap-2 mb-4">
                          <span className="text-2xl font-black text-black tracking-tight">₹{(formData.variants?.[0]?.price || 0).toLocaleString('en-IN')}</span>
                          {formData.variants?.[0]?.price && formData.price && formData.variants[0].price < formData.price && (
                            <span className="text-sm text-gray-400 line-through font-medium mb-1">₹{(formData.price || 0).toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                           <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-sm">{formData.variants?.[0]?.name || 'Standard'}</span>
                           <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-sm">{formData.roomStorytelling?.mood || 'Modern'}</span>
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            </div>
                            <span className="text-[11px] font-bold text-gray-600">Saved by 142 shoppers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            </div>
                            <span className="text-[11px] font-bold text-gray-600">Viewed in 84 living rooms</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sticky Bottom Save Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-between items-center z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-[11px] uppercase tracking-widest rounded-[3px] hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <div className="flex gap-3">
              <button type="button" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-[11px] uppercase tracking-widest rounded-[3px] hover:bg-gray-50 transition-colors">
                Save Draft
              </button>
              <button type="submit" onClick={handleSubmit} className="px-8 py-2.5 bg-gray-900 text-white font-bold text-[11px] uppercase tracking-widest rounded-[3px] hover:bg-black transition-colors shadow-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Publish Listing
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
