import type { NextConfig } from "next";

const strapiAdminOrigin =
  process.env.STRAPI_ADMIN_ORIGIN || "http://localhost:1337";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/preview",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${strapiAdminOrigin}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
