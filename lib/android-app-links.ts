// Public SHA-256 certificate verified from the project's directly installed
// com.simulafly APK. This is not a signing key or password.
const DIRECT_APK_CERTIFICATE = "0B:A8:AD:F9:80:4E:65:DE:5A:EA:BA:A6:1F:93:84:F6:85:55:08:A4:03:6D:33:C9:C6:BF:E0:74:9E:E2:DF:4B";

export function androidAssetLinks(fingerprints = process.env.ANDROID_APP_LINK_SHA256_FINGERPRINTS ?? DIRECT_APK_CERTIFICATE) {
  const values = [...new Set(fingerprints.split(/[\s,]+/).filter(Boolean).map((value) => value.toUpperCase()))];
  if (values.length === 0 || values.some((value) => !/^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(value))) {
    throw new Error("Android App Links require valid SHA-256 signing certificate fingerprints");
  }
  return [{
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.simulafly",
      sha256_cert_fingerprints: values,
    },
  }];
}
