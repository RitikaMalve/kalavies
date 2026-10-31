import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600 // Regenerate sitemap every hour

const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://kalavies.com' : 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/wishlist`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  let categoryRoutes: MetadataRoute.Sitemap = []
  let productRoutes: MetadataRoute.Sitemap = []

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })

    categoryRoutes = categories.map((cat) => ({
      url: `${BASE_URL}/products?category=${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))

    const products = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    })

    productRoutes = products.map((prod) => ({
      url: `${BASE_URL}/products/${prod.slug}`,
      lastModified: prod.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    }))
  } catch (err) {
    console.error('Error generating sitemap:', err)
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
