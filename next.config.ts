import type { NextConfig } from "next";

const mobileExport = process.env.MOBILE_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(mobileExport
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {
        async redirects() {
          return [
            {
              source: "/online/sala/:code",
              destination: "/online/sala?code=:code",
              permanent: false,
            },
          ];
        },
      }),
};

export default nextConfig;
