import { listLeads } from "@/lib/api/leads";
import { isApiError } from "@/lib/api/errors";
import { adaptLead } from "@/lib/types/lead";
import { redirect, unstable_rethrow } from "next/navigation";
import OrdersClient from "./OrdersClient";

export default async function OrdersPage() {
  let data;
  try {
    data = await listLeads({ limit: 100 });
  } catch (error) {
    unstable_rethrow(error);
    if (isApiError(error) && error.status === 401) {
      redirect("/api/auth/logout");
    }

    console.error("Could not load merchant orders", error);
    return (
      <OrdersClient
        initialLeads={[]}
        backendIdMap={{}}
        initialLoadError="The order service is temporarily unavailable. Your orders are safe—retry after the service is restored."
      />
    );
  }

  const leads = data.items.map(adaptLead);
  // Keep a raw-id → backend-id map so the client can send the right UUID
  const idMap = Object.fromEntries(
    data.items.map((raw) => [raw.id.slice(0, 8).toUpperCase(), raw.id])
  );

  return <OrdersClient initialLeads={leads} backendIdMap={idMap} />;
}
