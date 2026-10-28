import type { NextConfig } from "next";
import { authStagingEnabled, stagingPreviewOrigin } from "./src/lib/security/staging-policy";

// Runs before compiling any public Supabase URL/key into a client bundle.
const authStaging = authStagingEnabled();

const nextConfig: NextConfig = {
  ...(authStaging ? { env: {
    NEXT_PUBLIC_APP_URL: stagingPreviewOrigin(process.env),
    NEXT_PUBLIC_SITE_URL: stagingPreviewOrigin(process.env),
  }} : {}),
  async headers() { return [{ source: "/:path*", headers: [
    {key:"Content-Security-Policy",value:"frame-ancestors 'self'; object-src 'none'; base-uri 'self'"},
    {key:"X-Frame-Options",value:"SAMEORIGIN"},
    {key:"X-Content-Type-Options",value:"nosniff"},
    {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
    {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
    ...(process.env.NODE_ENV === "production" ? [{key:"Strict-Transport-Security",value:"max-age=31536000"}] : []),
  ]}]; },
  images: {
    remotePatterns: authStaging ? [] : [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
