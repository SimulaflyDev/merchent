import { redirect } from "next/navigation";
import { getMerchantSession } from "@/lib/auth/session";
import { listProducts } from "@/lib/api/products";
import SupportClient from "./SupportClient";

export default async function SupportPage() {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");

  // Fetch up to 100 products for the dropdown (backend max page size = 100)
  const { items: products } = await listProducts({ limit: 100 });

  return (
    <SupportClient
      products={products.map((p) => ({ id: p.id, title: p.title, sku: p.sku }))}
    />
  );
}
