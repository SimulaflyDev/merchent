import { listContacts } from "@/lib/api/contacts";
import BuyerNetworkClient from "./BuyerNetworkClient";

export default async function BuyerNetworkPage() {
  const data = await listContacts({ limit: 100 }).catch(() => ({
    items: [],
    total: 0,
    limit: 100,
    offset: 0,
  }));

  return <BuyerNetworkClient initialContacts={data.items} />;
}
