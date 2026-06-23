"use client";

import type { MerchantProductOut } from "@/lib/types/product";

interface Props {
  product: MerchantProductOut;
  onClose: () => void;
}

export default function ProductPreviewModal({ product, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{product.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {product.primary_image_url && (
            <img
              src={product.primary_image_url}
              alt={product.title}
              className="w-full max-h-80 object-cover rounded-lg bg-gray-100"
            />
          )}

          <PreviewRow label="SKU" value={product.sku} mono />
          <PreviewRow label="Category" value={product.category ?? "—"} />
          <PreviewRow label="Brand" value={product.brand ?? "—"} />
          <PreviewRow label="Status" value={product.status} />
          {product.description && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</div>
              <p className="text-sm text-gray-700">{product.description}</p>
            </div>
          )}

          {product.has_simulafly_listing && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-green-700 font-semibold uppercase tracking-wider">
                Available on SimulaFly
              </div>
              <div className="mt-1 text-sm">
                {product.in_app_price != null
                  ? `₹${product.in_app_price.toLocaleString("en-IN")}`
                  : "Price not set"}
                {product.in_app_stock != null && ` · ${product.in_app_stock} in stock`}
              </div>
            </div>
          )}

          {product.external_links.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Also available on</div>
              <ul className="space-y-1">
                {product.external_links.map((l) => (
                  <li key={l.id} className="flex items-center justify-between text-sm">
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0E9F88] hover:underline"
                    >
                      {l.label ?? l.platform}
                    </a>
                    {l.last_seen_price != null && (
                      <span className="text-gray-500">
                        ~₹{l.last_seen_price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(Object.keys(product.dimensions).length > 0 ||
            Object.keys(product.materials).length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(product.dimensions).length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Dimensions
                  </div>
                  <ul className="text-sm text-gray-700">
                    {Object.entries(product.dimensions).map(([k, v]) => (
                      <li key={k}>
                        <span className="text-gray-500">{k}:</span> {String(v)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Object.keys(product.materials).length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Materials
                  </div>
                  <ul className="text-sm text-gray-700">
                    {Object.entries(product.materials).map(([k, v]) => (
                      <li key={k}>
                        <span className="text-gray-500">{k}:</span> {String(v)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-xs text-gray-500 uppercase tracking-wider w-24">{label}</span>
      <span className={`text-sm text-gray-900 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
