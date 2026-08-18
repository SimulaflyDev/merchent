import { redirect } from "next/navigation";

import { getMerchantSession } from "@/lib/auth/session";
import { getMerchant } from "@/lib/api/merchants";
import { getMerchantVerification } from "@/lib/api/verification";
import VerificationClient from "./VerificationClient";

export default async function VerificationPage() {
  const session = await getMerchantSession();
  if (!session?.activeMerchantId) redirect("/merchant/sign_in");

  const [merchant, verification] = await Promise.all([
    getMerchant(session.activeMerchantId),
    getMerchantVerification(session.activeMerchantId),
  ]);
  const onboardingData = merchant.settings?.onboarding_data;
  const onboardingSubmission = merchant.settings?.onboarding_submission;
  const initialGstin =
    onboardingSubmission &&
    typeof onboardingSubmission === "object" &&
    "shop" in onboardingSubmission &&
    onboardingSubmission.shop &&
    typeof onboardingSubmission.shop === "object" &&
    "gstin" in onboardingSubmission.shop &&
    typeof onboardingSubmission.shop.gstin === "string"
      ? onboardingSubmission.shop.gstin
      : onboardingData &&
    typeof onboardingData === "object" &&
    "gst_number" in onboardingData &&
    typeof onboardingData.gst_number === "string"
      ? onboardingData.gst_number
      : "";

  return (
    <VerificationClient
      merchant={merchant}
      initialVerification={verification}
      initialGstin={initialGstin}
    />
  );
}
