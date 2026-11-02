"use client";

import { useEffect, useRef, useState } from "react";
import { callAction } from "@/lib/api/action-utils";
import { getTermsPageAction } from "@/lib/auth/terms-actions";
import type { TermsDocument, TermsPage } from "@/lib/types/terms";

export default function TermsViewer({ merchantId, document, onLoaded }: {
  merchantId: string; document: TermsDocument; onLoaded: (version: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: TermsPage; error?: string } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const key = `${document.version}:${page}:${retry}`;
  const current = result?.key === key ? result : null;

  useEffect(() => {
    let cancelled = false;
    callAction(getTermsPageAction(merchantId, document.version, page)).then((data) => {
      if (!cancelled) setResult({ key, data });
    }).catch((error) => {
      if (!cancelled) setResult({ key, error: error instanceof Error ? error.message : "Unable to load this page." });
    });
    return () => { cancelled = true; };
  }, [merchantId, document.version, page, key]);

  useEffect(() => {
    if (!current?.data) return;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled || !canvas.current) return;
      canvas.current.width = image.width; canvas.current.height = image.height;
      canvas.current.getContext("2d")?.drawImage(image, 0, 0);
      onLoaded(document.version);
    };
    image.onerror = () => { if (!cancelled) setResult({ key, error: "Unable to display this page. Please retry." }); };
    image.src = current.data.image;
    return () => { cancelled = true; };
  }, [current, document.version, onLoaded, key]);

  return <div className="select-none print:hidden" onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-3 text-xs">
      <div className="flex items-center gap-2">
        <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Previous</button>
        <span aria-live="polite">Page {page} / {document.page_count}</span>
        <button type="button" disabled={page === document.page_count} onClick={() => setPage(page + 1)} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Next</button>
      </div>
      <label className="flex items-center gap-2">Zoom<select aria-label="Document zoom" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="rounded-lg border bg-white p-2">
        {[100, 150, 200].map((value) => <option key={value} value={value}>{value === 100 ? "Fit width" : `${value}%`}</option>)}
      </select></label>
    </div>
    <div className="max-h-[65vh] min-h-64 overflow-auto rounded-xl border border-gray-200 bg-gray-100 p-2" aria-label={`${document.title}, page ${page}`} tabIndex={0}>
      {!current && <p role="status" className="p-8 text-center text-sm text-gray-500">Loading document page...</p>}
      {current?.error && <div role="alert" className="p-6 text-sm text-red-700">{current.error}<button type="button" onClick={() => setRetry(retry + 1)} className="ml-3 underline">Retry page</button></div>}
      {current?.data && <div style={{ width: `${zoom}%` }}><canvas ref={canvas} aria-hidden="true" className="block h-auto w-full bg-white" /><p className="sr-only whitespace-pre-wrap">{current.data.text}</p></div>}
    </div>
  </div>;
}
