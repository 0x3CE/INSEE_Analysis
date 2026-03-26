import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow SVG topojson files served from external CDN for the France map
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
  // Expose safe public env vars to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: "Observatoire National",
  },
};

export default nextConfig;
