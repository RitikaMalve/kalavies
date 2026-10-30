import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/**': ['./prisma/dev.db', './dev.db'],
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
