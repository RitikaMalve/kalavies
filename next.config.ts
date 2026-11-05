import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/**': ['./prisma/dev.db', './dev.db'],
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, HEAD, OPTIONS' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/collections/new-arrivals',
        destination: '/products?filter=new',
        permanent: true,
      },
      {
        source: '/collections/:slug',
        destination: '/products?collection=:slug',
        permanent: true,
      },
      {
        source: '/collections',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/categories/:slug',
        destination: '/products?category=:slug',
        permanent: true,
      },
      {
        source: '/categories',
        destination: '/products',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
