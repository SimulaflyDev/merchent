import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { displayPrice, loadPublicStorefront, publicImageUrl } from "@/lib/public-storefront";

type Props = {
  params: Promise<{ lookup: string }>;
  searchParams: Promise<{ product?: string | string[] }>;
};

async function readPage({ params, searchParams }: Props) {
  const [{ lookup }, query] = await Promise.all([params, searchParams]);
  if (Array.isArray(query.product) || query.product === "") notFound();
  return loadPublicStorefront(lookup, query.product);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { shop, selected } = await readPage(props);
  const title = selected ? `${selected.title} | ${shop.display_name}` : `${shop.display_name} | Simulafly`;
  const description = (selected?.description || shop.storefront?.description || `Explore furniture from ${shop.display_name} on Simulafly.`).slice(0, 240);
  const image = publicImageUrl(selected?.primary_image_url || shop.logo_url);
  return { title, description,
    openGraph: { title, description, type: "website", images: image ? [{ url: image, alt: selected?.title || shop.display_name }] : [] },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : [] },
  };
}

export default async function PublicShopPage(props: Props) {
  const { shop, products, selected } = await readPage(props);
  const shopPath = `/shop/${encodeURIComponent(shop.slug)}`;
  const phone = shop.support_phone?.replace(/[^+0-9]/g, "");
  const shown = selected ? [selected] : products;
  return (
    <main className="min-h-screen bg-[#f5faf4] text-[#202c21]">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:py-14">
        <Link href={shopPath} className="text-sm font-semibold uppercase tracking-widest text-green-700">Simulafly · Shop</Link>
        <header className="mt-8 rounded-3xl border border-green-100 bg-white p-6 sm:p-9">
          <h1 className="text-3xl font-bold sm:text-4xl">{shop.display_name}</h1>
          {shop.storefront?.tagline && <p className="mt-3 text-lg text-gray-600">{shop.storefront.tagline}</p>}
          {shop.legal_name !== shop.display_name && <p className="mt-3 text-sm text-gray-600">Merchant: {shop.legal_name}</p>}
          {shop.address && <p className="mt-2 text-sm text-gray-600">{shop.address}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            {phone && <a href={`tel:${phone}`} className="rounded-full bg-[#202c21] px-5 py-3 text-sm font-semibold text-white">Call shop</a>}
            {shop.support_email && <a href={`mailto:${encodeURIComponent(shop.support_email)}`} className="rounded-full border border-green-200 px-5 py-3 text-sm font-semibold">Email shop</a>}
            {selected && <Link href={shopPath} className="rounded-full border border-green-200 px-5 py-3 text-sm font-semibold">Browse all products</Link>}
          </div>
        </header>
        <h2 className="mb-5 mt-10 text-xl font-semibold">{selected ? "Shared product" : "Shop products"}</h2>
        {shown.length === 0 && <p className="rounded-2xl bg-white p-6">This shop has no available products right now.</p>}
        <div className={selected ? "grid gap-6" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
          {shown.map((product) => {
            const image = publicImageUrl(product.primary_image_url);
            return (
              <article key={product.id} className={`overflow-hidden rounded-3xl border border-green-100 bg-white ${selected ? "sm:grid sm:grid-cols-2" : ""}`}>
                <Link href={`${shopPath}?product=${encodeURIComponent(product.id)}`} aria-label={`View ${product.title}`} className="relative block aspect-square bg-[#edf2ea]">
                  {image ? <Image src={image} alt={product.title} fill unoptimized sizes="(max-width: 640px) 100vw, 50vw" className="object-contain p-4" /> : <span className="flex h-full items-center justify-center text-gray-500">Image unavailable</span>}
                </Link>
                <div className="p-6">
                  {product.category && <p className="text-xs uppercase tracking-wider text-green-700">{product.category}</p>}
                  <h3 className="mt-2 text-xl font-semibold"><Link href={`${shopPath}?product=${encodeURIComponent(product.id)}`}>{product.title}</Link></h3>
                  <p className="mt-4 text-xl font-bold">{displayPrice(product.in_app_price)}</p>
                  <p className="mt-2 text-sm text-gray-500">{product.in_app_stock == null ? "Contact shop for availability" : product.in_app_stock > 0 ? "In stock" : "Out of stock"}</p>
                  {selected && product.description && <p className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-600">{product.description}</p>}
                  <p className="mt-5 text-sm text-gray-600">View and visualise this product in the Simulafly Android app, or contact the shop above.</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
