"use client";

import { useState, useRef } from "react";
import { Product } from "@/app/merchant/context/MerchantContext";

interface ImportModalProps {
  onClose: () => void;
  onImport: (products: Partial<Product>[]) => void;
}

const IMPORTANT_FIELDS = [
  { key: "name", label: "Product Title", required: true },
  { key: "category", label: "Main Category" },
  { key: "sellPrice", label: "Price (₹)" },
  { key: "stock", label: "Stock Quantity" },
  { key: "img", label: "Primary Image URL" },
  { key: "url", label: "Website URL" },
];

const OPTIONAL_FIELDS = [
  { key: "subCategory", label: "Subcategory" },
  { key: "brand", label: "Brand" },
  { key: "purchaseDestination", label: "Purchase Destination" },
  { key: "material", label: "General Material" },
  { key: "color", label: "General Color" },
  { key: "width", label: "Width (cm)" },
  { key: "height", label: "Height (cm)" },
  { key: "depth", label: "Depth (cm)" },
  { key: "weight", label: "Weight (kg)" },
  { key: "primaryMaterial", label: "Primary Material (Spec)" },
  { key: "finish", label: "Finish (Spec)" },
  { key: "upholsteryType", label: "Upholstery Type (Spec)" },
  { key: "roomPlacements", label: "Room Placements (comma-separated)" },
  { key: "bestUsedIn", label: "Best Used In" },
  { key: "pairsWellWith", label: "Pairs Well With" },
  { key: "mood", label: "Style / Mood" },
  { key: "merchantNotes", label: "Internal Notes" },
];

// Combine for the sample CSV
const CSV_COLUMNS = [...IMPORTANT_FIELDS, ...OPTIONAL_FIELDS].map(f => f.key);

const SAMPLE_ROWS = [
  [
    "Nordic Lounge Chair", "Furniture", "18500", "25", "https://example.com/image1.jpg", "https://example.com/chair",
    "Accent Chairs", "Acme Furniture", "SimulaFly Checkout", "Teak Wood", "Walnut",
    "68", "82", "72", "12", "Solid Teak", "Natural Matte", "Cotton Blend",
    "Living room,Bedroom", "Modern apartments", "Coffee table, Floor lamp", "Warm minimalist", ""
  ],
];

function generateSampleCSV(): string {
  const header = CSV_COLUMNS.join(",");
  const rows = SAMPLE_ROWS.map((row) =>
    row.map((cell) => (cell.includes(",") ? `"${cell}"` : cell)).join(",")
  );
  return [header, ...rows].join("\n");
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (current || row.length > 0) {
        row.push(current.trim());
        rows.push(row);
        row = [];
        current = "";
      }
      if (ch === "\r" && text[i + 1] === "\n") i++;
    } else {
      current += ch;
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

// Auto-map based on similar text
function autoMapHeaders(csvHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const allFields = [...IMPORTANT_FIELDS, ...OPTIONAL_FIELDS];

  allFields.forEach(field => {
    // Exact match
    let match = csvHeaders.find(h => h.toLowerCase() === field.key.toLowerCase());
    
    // Fuzzy matching for common alternates
    if (!match) {
      const alternates: Record<string, string[]> = {
        name: ["title", "product title", "product name", "item"],
        sellPrice: ["price", "cost", "mrp", "selling price", "rate"],
        stock: ["qty", "quantity", "inventory"],
        img: ["image", "picture", "photo", "image url", "primary image", "image link"],
        url: ["link", "website link", "product link", "buy link", "website"],
        category: ["type", "main category"],
        brand: ["manufacturer", "make"],
        merchantNotes: ["notes", "remarks"]
      };

      const alts = alternates[field.key] || [];
      match = csvHeaders.find(h => alts.includes(h.toLowerCase()));
    }

    if (match) {
      mapping[field.key] = match;
    }
  });

  return mapping;
}

export function ProductImportModal({ onClose, onImport }: ImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  // Mapping state
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [showOptionalMapping, setShowOptionalMapping] = useState(false);

  // Preview state
  const [parsedProducts, setParsedProducts] = useState<Partial<Product>[]>([]);

  const handleDownloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simulafly_products_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const processFile = async (f: File) => {
    setFile(f);
    setError("");

    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx" && ext !== "xls") {
      setError("Please upload a .csv or .xlsx file.");
      return;
    }

    try {
      const text = await f.text();
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setError("File appears to be empty or has no data rows.");
        return;
      }

      const headers = rows[0].map((h) => h.trim());
      const dataRows = rows.slice(1).filter((r) => r.some((cell) => cell.trim()));

      setCsvHeaders(headers);
      setRawRows(dataRows);
      
      // Attempt auto-mapping
      setMapping(autoMapHeaders(headers));
      setStep("mapping");
    } catch {
      setError("Could not read the file. Please check the format and try again.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleMappingChange = (simulaFlyKey: string, csvHeader: string) => {
    setMapping(prev => ({
      ...prev,
      [simulaFlyKey]: csvHeader
    }));
  };

  const applyMappingAndPreview = () => {
    if (!mapping.name) {
      setError("You must map a column to 'Product Title' to continue.");
      return;
    }
    setError("");

    const products = rawRows.map((row) => {
      const get = (key: string) => {
        const headerName = mapping[key];
        if (!headerName) return "";
        const idx = csvHeaders.indexOf(headerName);
        return idx >= 0 && idx < row.length ? row[idx] : "";
      };

      const id = `IMPORT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      return {
        id,
        name: get("name"),
        category: get("category"),
        subCategory: get("subCategory"),
        sellPrice: parseFloat(get("sellPrice")) || 0,
        price: parseFloat(get("sellPrice")) || 0,
        stock: parseInt(get("stock")) || 0,
        status: "Draft List" as Product["status"],
        material: get("material"),
        color: get("color"),
        brand: get("brand"),
        img: get("img") || "bg-gray-100",
        url: get("url") || undefined,
        date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        purchaseDestination: (get("purchaseDestination") as Product["purchaseDestination"]) || undefined,
        merchantNotes: get("merchantNotes") || undefined,
        v2Dimensions: {
          width: get("width") || undefined,
          height: get("height") || undefined,
          depth: get("depth") || undefined,
          weight: get("weight") || undefined,
        },
        v2Materials: {
          primary: get("primaryMaterial") || undefined,
          finish: get("finish") || undefined,
          upholsteryType: get("upholsteryType") || undefined,
        },
        roomStorytelling: {
          placements: get("roomPlacements") ? get("roomPlacements").split(",").map((s) => s.trim()) : [],
          bestUsedIn: get("bestUsedIn"),
          pairsWellWith: get("pairsWellWith"),
          mood: get("mood"),
        },
        impressions: 0,
        clicks: 0,
        ctr: 0,
        leadsGenerated: 0,
        convertedLeads: 0,
        tokenSpend: 0,
        ragQueries: [],
        ctrTrend: [],
        impressionTrend: [],
        healthScore: "review",
        aiRelevanceScore: 0,
        healthReason: "",
      } as Partial<Product>;
    });

    setParsedProducts(products);
    setStep("preview");
  };

  const handleImport = () => {
    onImport(parsedProducts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#111827] tracking-tight">Import Products</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {step === "upload" && "Upload a CSV or Excel file to add products in bulk."}
              {step === "mapping" && "Match your columns to SimulaFly fields."}
              {step === "preview" && `${parsedProducts.length} product${parsedProducts.length !== 1 ? "s" : ""} ready to import.`}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">

          {/* ─── UPLOAD STEP ─── */}
          {step === "upload" && (
            <div className="space-y-6">
              {/* Download sample */}
              <div className="bg-[#F8FAFB] rounded-xl p-4 border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0E9F88]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#0E9F88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-[#111827] mb-1">Download sample template</h4>
                  <p className="text-[11px] text-gray-500 mb-3">
                    Use this template to see all the fields we support. Or simply upload your own file and we'll help you map the columns.
                  </p>
                  <button
                    onClick={handleDownloadSample}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#EAECEF] text-[#111827] text-[11px] font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 text-[#0E9F88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Download CSV template
                  </button>
                </div>
              </div>

              {/* Upload zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-[#0E9F88] bg-[#0E9F88]/5"
                    : "border-gray-200 bg-[#FAFBFC] hover:border-gray-300"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="text-sm font-bold text-gray-600 mb-1">
                  {dragActive ? "Drop your file here" : "Drop your CSV or Excel file here"}
                </p>
                <p className="text-[11px] text-gray-400">or click to browse · CSV, XLSX supported</p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-lg">
                  <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <p className="text-[12px] text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* ─── MAPPING STEP ─── */}
          {step === "mapping" && (
            <div className="space-y-6">
              
              {/* File summary */}
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFB] rounded-lg border border-gray-100 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#0E9F88]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#0E9F88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-[#111827] truncate">{file?.name}</p>
                  <p className="text-[10px] text-gray-400">Map the columns from your file to SimulaFly fields.</p>
                </div>
              </div>

              {/* Important Fields */}
              <div>
                <h3 className="text-[12px] font-bold text-gray-900 mb-3 uppercase tracking-widest">Important Fields</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {IMPORTANT_FIELDS.map(field => (
                    <div key={field.key} className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
                        {field.label}
                        {field.required && <span className="text-red-400">*</span>}
                      </label>
                      <select
                        value={mapping[field.key] || ""}
                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                        className={`w-full px-3 py-2 bg-[#F8FAFB] border rounded text-[12px] font-medium outline-none focus:ring-1 focus:ring-[#0E9F88] ${mapping[field.key] ? 'border-gray-200 text-gray-900' : 'border-dashed border-gray-300 text-gray-400'}`}
                      >
                        <option value="">-- Ignore this field --</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100 my-4"></div>

              {/* Optional Fields Toggle */}
              <div>
                <button 
                  onClick={() => setShowOptionalMapping(!showOptionalMapping)}
                  className="flex items-center gap-2 text-[12px] font-bold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className={`w-4 h-4 transform transition-transform ${showOptionalMapping ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                  Map Advanced Options (Dimensions, Room Placements, etc.)
                </button>
                
                {showOptionalMapping && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-5 p-5 bg-[#F8FAFB] border border-gray-100 rounded-xl">
                    {OPTIONAL_FIELDS.map(field => (
                      <div key={field.key} className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-gray-600">
                          {field.label}
                        </label>
                        <select
                          value={mapping[field.key] || ""}
                          onChange={(e) => handleMappingChange(field.key, e.target.value)}
                          className={`w-full px-3 py-2 bg-white border rounded text-[12px] font-medium outline-none focus:ring-1 focus:ring-[#0E9F88] ${mapping[field.key] ? 'border-gray-200 text-gray-900' : 'border-dashed border-gray-200 text-gray-400'}`}
                        >
                          <option value="">-- Ignore this field --</option>
                          {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-lg mt-4">
                  <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <p className="text-[12px] text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* ─── PREVIEW STEP ─── */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFB] rounded-lg border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-[#0E9F88]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#0E9F88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-[#111827] truncate">{file?.name}</p>
                  <p className="text-[10px] text-gray-400">{parsedProducts.length} products found based on your mapping.</p>
                </div>
                <button
                  onClick={() => setStep("mapping")}
                  className="text-[11px] text-gray-500 font-medium hover:text-[#111827] transition-colors"
                >
                  Edit Mapping
                </button>
              </div>

              {/* Preview table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-[#F8F9FA] border-b border-gray-100">
                        <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Name</th>
                        <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Category</th>
                        <th className="text-right px-4 py-2.5 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Price</th>
                        <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Image URL</th>
                        <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Website URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedProducts.map((p, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-[#FAFBFC]">
                          <td className="px-4 py-2.5 font-medium text-[#111827] max-w-[180px] truncate">{p.name || "—"}</td>
                          <td className="px-4 py-2.5 text-gray-500">{p.category || "—"}</td>
                          <td className="px-4 py-2.5 text-right text-[#111827] tabular-nums">
                            {p.sellPrice ? `₹${p.sellPrice.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500 max-w-[120px] truncate">{p.img === 'bg-gray-100' || !p.img ? "—" : p.img}</td>
                          <td className="px-4 py-2.5 text-gray-500 max-w-[120px] truncate">{p.url || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-[#FAFBFC]">
          {/* Back/Cancel Logic */}
          <button
            onClick={() => {
              if (step === "preview") setStep("mapping");
              else if (step === "mapping") { setStep("upload"); setFile(null); setCsvHeaders([]); }
              else onClose();
            }}
            className="px-4 py-2.5 text-[12px] font-semibold text-gray-500 hover:text-[#111827] transition-colors"
          >
            {step === "upload" ? "Cancel" : "Back"}
          </button>
          
          {/* Continue / Import Logic */}
          {step === "mapping" && (
             <button
              onClick={applyMappingAndPreview}
              className="px-5 py-2.5 bg-[#111827] text-white text-[12px] font-bold rounded-lg hover:bg-black transition-colors"
            >
              Continue to Preview
            </button>
          )}

          {step === "preview" && (
            <button
              onClick={handleImport}
              className="px-5 py-2.5 bg-[#1FAF9A] text-white text-[12px] font-bold rounded-lg hover:bg-[#189986] transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Import {parsedProducts.length} product{parsedProducts.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
