import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "100MB",
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "nyc.cloud.appwrite.io",
                pathname: "/v1/storage/buckets/**",
            },
        ],
    },
};

export default nextConfig;
