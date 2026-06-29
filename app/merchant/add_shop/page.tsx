import { redirect } from "next/navigation";
import { getMerchantSession } from "@/lib/auth/session";
import AddShopClient from "./AddShopClient";

export const metadata = {
  title: "Add New Shop · SimulaFly Merchant",
  description: "Create a separate new shop workspace under your account.",
};

export default async function AddShopPage() {
  const session = await getMerchantSession();
  
  // Note: if user is not logged in, redirect them to sign_in
  if (!session) {
    redirect("/merchant/sign_in");
  }

  return <AddShopClient />;
}
