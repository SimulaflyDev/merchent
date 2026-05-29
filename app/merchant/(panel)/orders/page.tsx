import { listLeads } from "@/lib/api/leads";
import { adaptLead } from "@/lib/types/lead";
import OrdersClient from "./OrdersClient";

export default async function OrdersPage() {
  const data = await listLeads({ limit: 100 });
  const leads = data.items.map(adaptLead);
  // Keep a raw-id → backend-id map so the client can send the right UUID
  const idMap = Object.fromEntries(
    data.items.map((raw) => [raw.id.slice(0, 8).toUpperCase(), raw.id])
  );

  return <OrdersClient initialLeads={leads} backendIdMap={idMap} />;
}
