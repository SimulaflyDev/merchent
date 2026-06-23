import { listContacts } from "@/lib/api/contacts";
import { listProducts } from "@/lib/api/products";
import BuyerNetworkClient from "./BuyerNetworkClient";

export default async function BuyerNetworkPage() {
  const [data, productsData] = await Promise.all([
    listContacts({ limit: 100 }).catch(() => ({
      items: [],
      total: 0,
      limit: 100,
      offset: 0,
    })),
    listProducts({ status: "published", limit: 100 }).catch(() => ({
      items: [],
      total: 0,
      limit: 100,
      offset: 0,
    })),
  ]);

  const productTitles = productsData.items.map((p) => p.title);

  return <BuyerNetworkClient initialContacts={data.items} products={productTitles} />;
}
