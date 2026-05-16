import { redirect } from "next/navigation";

export default function AccountPage() {
  // Redirect to Settings where account details are managed
  redirect("/merchant/settings");
}
