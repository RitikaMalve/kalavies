import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

/**
 * Cached homepage data loader.
 * Caches banners, featured collections, testimonials, and jewellery universe counts for 3 minutes (180s).
 * Eliminates 10+ remote database roundtrips to Neon on every visitor page hit.
 */
export const getCachedHomepageData = unstable_cache(
  async () => {
    try {
      const results = await Promise.all([
        prisma.homepageBanner.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        }),
        prisma.product.findMany({
          where: { isTrending: true, isDeleted: false, status: 'PUBLISHED', sellingPrice: { gt: 0 } },
          take: 8,
          include: { images: true, category: true },
          orderBy: { soldCount: 'desc' },
        }),
        prisma.product.findMany({
          where: { isBestseller: true, isDeleted: false, status: 'PUBLISHED', sellingPrice: { gt: 0 } },
          take: 8,
          include: { images: true, category: true },
          orderBy: { soldCount: 'desc' },
        }),
        prisma.product.findMany({
          where: { isNewArrival: true, isDeleted: false, status: 'PUBLISHED', sellingPrice: { gt: 0 } },
          take: 8,
          include: { images: true, category: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.coupon.findMany({
          where: { isActive: true },
          take: 2,
        }),
        prisma.testimonial.findMany({
          where: { isActive: true },
          take: 3,
          orderBy: { sortOrder: 'asc' },
        }),
        // Counts across the store for core jewellery universes
        prisma.product.count({
          where: {
            isDeleted: false,
            status: 'PUBLISHED',
            sellingPrice: { gt: 0 },
            OR: [
              { category: { slug: { contains: 'necklace' } } },
              { category: { name: { contains: 'necklace', mode: 'insensitive' } } },
              { name: { contains: 'necklace', mode: 'insensitive' } },
              { name: { contains: 'choker', mode: 'insensitive' } },
            ],
          },
        }),
        prisma.product.count({
          where: {
            isDeleted: false,
            status: 'PUBLISHED',
            sellingPrice: { gt: 0 },
            OR: [
              { category: { slug: { contains: 'earring' } } },
              { category: { slug: { contains: 'earing' } } },
              { category: { slug: { contains: 'cuff' } } },
              { name: { contains: 'earring', mode: 'insensitive' } },
              { name: { contains: 'jhumka', mode: 'insensitive' } },
              { name: { contains: 'dangler', mode: 'insensitive' } },
              { name: { contains: 'ear cuff', mode: 'insensitive' } },
            ],
          },
        }),
        prisma.product.count({
          where: {
            isDeleted: false,
            status: 'PUBLISHED',
            sellingPrice: { gt: 0 },
            OR: [
              { category: { slug: { contains: 'nose' } } },
              { name: { contains: 'nose pin', mode: 'insensitive' } },
              { name: { contains: 'nath', mode: 'insensitive' } },
            ],
          },
        }),
        prisma.product.count({
          where: {
            isDeleted: false,
            status: 'PUBLISHED',
            sellingPrice: { gt: 0 },
            OR: [
              { category: { slug: { contains: 'bangle' } } },
              { category: { slug: { contains: 'bracelet' } } },
              { name: { contains: 'bangle', mode: 'insensitive' } },
              { name: { contains: 'kada', mode: 'insensitive' } },
              { name: { contains: 'bracelet', mode: 'insensitive' } },
            ],
          },
        }),
        prisma.product.count({
          where: {
            isDeleted: false,
            status: 'PUBLISHED',
            sellingPrice: { gt: 0 },
            AND: [
              {
                NOT: [
                  { category: { slug: { contains: 'earring' } } },
                  { name: { contains: 'earring', mode: 'insensitive' } },
                  { name: { contains: 'earing', mode: 'insensitive' } },
                ],
              },
              {
                OR: [
                  { category: { slug: 'rings' } },
                  { category: { slug: { contains: 'finger-ring' } } },
                  { name: { contains: 'finger ring', mode: 'insensitive' } },
                  { name: { contains: 'band ring', mode: 'insensitive' } },
                ],
              },
            ],
          },
        }),
      ])

      return {
        banners: results[0] || [],
        trendingProducts: results[1] || [],
        bestsellers: results[2] || [],
        newArrivals: results[3] || [],
        coupons: results[4] || [],
        testimonials: results[5] || [],
        necklaceCount: results[6] || 0,
        earringCount: results[7] || 0,
        nosePinCount: results[8] || 0,
        bangleCount: results[9] || 0,
        ringCount: results[10] || 0,
      }
    } catch (err) {
      console.error('Error fetching homepage data:', err)
      return {
        banners: [],
        trendingProducts: [],
        bestsellers: [],
        newArrivals: [],
        coupons: [],
        testimonials: [],
        necklaceCount: 0,
        earringCount: 0,
        nosePinCount: 0,
        bangleCount: 0,
        ringCount: 0,
      }
    }
  },
  ['store-homepage-data'],
  {
    revalidate: 180, // 3 minutes
    tags: ['homepage', 'products', 'banners'],
  }
)
