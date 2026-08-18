"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { uploadProductImageAction } from "@/lib/auth/product-actions";
import { callAction } from "@/lib/api/action-utils";
import { isApiError } from "@/lib/api/errors";
import { resolveImageUrl } from "@/lib/api/image-utils";

const MAX_IMAGES = 5;
const MAX_BYTES = 8 * 1024 * 1024;

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  onError?: (message: string | null) => void;
  compact?: boolean;
}

function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const match = String(reader.result).match(/^data:(.+);base64,(.+)$/);
      if (!match) {
        reject(new Error("Unable to read image"));
        return;
      }
      resolve({ mediaType: match[1], base64: match[2] });
    };
    reader.readAsDataURL(file);
  });
}

export default function ProductImagesField({
  images,
  onChange,
  onUploadingChange,
  onError,
  compact = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const setBusy = (value: boolean) => {
    setUploading(value);
    onUploadingChange?.(value);
  };

  const uploadFiles = async (fileList: FileList | File[]) => {
    const available = MAX_IMAGES - images.length;
    const files = Array.from(fileList);
    if (available <= 0) {
      onError?.("A product can have up to 5 images.");
      return;
    }
    if (files.length > available) {
      onError?.(`You can add ${available} more image${available === 1 ? "" : "s"}.`);
      return;
    }
    const invalid = files.find(
      (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );
    if (invalid) {
      onError?.("Use JPEG, PNG, or WebP images only.");
      return;
    }
    const oversized = files.find((file) => file.size > MAX_BYTES);
    if (oversized) {
      onError?.(`${oversized.name} is larger than 8 MB.`);
      return;
    }

    onError?.(null);
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const { base64, mediaType } = await fileToBase64(file);
        const formData = new FormData();
        formData.append("imageBase64", base64);
        formData.append("mediaType", mediaType);
        const result = await callAction(uploadProductImageAction(formData));
        uploaded.push(result.url);
      }
      onChange([...images, ...uploaded]);
    } catch (error) {
      onError?.(
        isApiError(error)
          ? `Image upload failed: ${error.detail}`
          : "Image upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div
        className={`rounded-2xl border-2 border-dashed transition-colors ${
          dragOver
            ? "border-[#0E9F88] bg-[#F0FDF4]"
            : "border-[#DDE3E7] bg-[#FAFBFC] hover:border-[#0E9F88]/50"
        } ${images.length >= MAX_IMAGES || uploading ? "opacity-60" : "cursor-pointer"}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (images.length < MAX_IMAGES && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (!uploading) void uploadFiles(event.dataTransfer.files);
        }}
        onClick={() => {
          if (images.length < MAX_IMAGES && !uploading) inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) void uploadFiles(event.target.files);
          }}
        />
        <div className={`flex items-center justify-center gap-3 text-center ${compact ? "p-5" : "p-7"}`}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
            {uploading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0E9F88] border-t-transparent" />
            ) : (
              <svg className="h-5 w-5 text-[#0E9F88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            )}
          </div>
          <div className="text-left">
            <p className="text-[12px] font-semibold text-[#111827]">
              {uploading
                ? "Uploading images…"
                : images.length >= MAX_IMAGES
                  ? "Maximum 5 images added"
                  : "Drop images here or browse"}
            </p>
            <p className="mt-0.5 text-[10px] text-gray-400">
              JPEG, PNG or WebP · 8 MB each · {images.length}/{MAX_IMAGES}
            </p>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`group relative overflow-hidden rounded-xl border bg-white ${
                index === 0 ? "border-[#0E9F88] ring-2 ring-[#0E9F88]/10" : "border-[#EAECEF]"
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                <Image
                  src={resolveImageUrl(image)}
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 220px"
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-1 px-2 py-2">
                <span className={`truncate text-[9px] font-bold uppercase tracking-wide ${index === 0 ? "text-[#0E9F88]" : "text-gray-400"}`}>
                  {index === 0 ? "AI visualisation" : `Gallery ${index + 1}`}
                </span>
                <div className="flex items-center">
                  <button
                    type="button"
                    aria-label="Move image left"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-20"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Move image right"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, index + 1)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-20"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => remove(index)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-gray-400">
        Image 1 is the primary storefront photo and the only product reference sent to AI visualisation. Use the arrows to control the order.
      </p>
    </div>
  );
}
