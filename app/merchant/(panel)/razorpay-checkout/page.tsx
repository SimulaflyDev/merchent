import { redirect } from "next/navigation";

export default function RazorpayCheckoutPage() {
  redirect("/merchant/billing");
}

