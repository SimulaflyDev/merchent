import { redirect } from "next/navigation";
import { getMerchantSession } from "@/lib/auth/session";
import { listProducts } from "@/lib/api/products";
import { listLeads } from "@/lib/api/leads";
import SupportClient from "./SupportClient";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; orderId?: string; productId?: string }>;
}) {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");

  const params = await searchParams;
  const initialReason = params.reason || "";
  const initialOrderId = params.orderId || "";
  const initialProductId = params.productId || "";

  // Fetch up to 100 products for the dropdown (backend max page size = 100)
  const { items: products } = await listProducts({ limit: 100 });

  // Fetch up to 100 orders (leads) for the dropdown
  const { items: leads } = await listLeads({ limit: 100 });

  const orders = leads.map((l) => ({
    id: l.id,
    displayId: l.id.slice(0, 8).toUpperCase(),
    customerName: l.customer.name || "Protected Customer",
    total: l.estimated_value,
    date: new Date(l.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" }),
  }));

  return (
    <SupportClient
      products={products.map((p) => ({ id: p.id, title: p.title, sku: p.sku }))}
      orders={orders}
      initialReason={initialReason}
      initialOrderId={initialOrderId}
      initialProductId={initialProductId}
    />
  );
}
