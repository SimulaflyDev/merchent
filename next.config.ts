import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      {
        source: '/merchant_signin',
        destination: '/merchant/sign_in',
        permanent: false,
      },
      {
        source: '/merchant_sign_in',
        destination: '/merchant/sign_in',
        permanent: false,
      },
      {
        source: '/merchant_sign_up',
        destination: '/merchant/sign_up',
        permanent: false,
      },
      {
        source: '/merchant_signup',
        destination: '/merchant/sign_up',
        permanent: false,
      }
    ];
  },
};

export default nextConfig;
