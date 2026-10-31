import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import StoreLayout from '@/components/store/StoreLayout'
import ProductDetailClient from '@/components/store/ProductDetailClient'
import ProductCard from '@/components/store/ProductCard'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: 'asc' } }, category: true },
    })

    if (!product) {
      return {
        title: 'Product Not Found',
      }
    }

    const price = product.sellingPrice
    const ogImage = product.images?.[0]?.url || '/logo-circle.png'
    const desc = product.metaDescription || (product.description
      ? product.description.slice(0, 155)
      : `Buy ${product.name} handcrafted ${product.category?.name || 'jewellery'} online at ₹${price}. Premium finish, authentic design & Cash on Delivery across India.`)

    return {
      title: product.seoTitle || `${product.name} - Handcrafted ${product.category?.name || 'Jewellery'}`,
      description: desc,
      alternates: {
        canonical: `/products/${product.slug}`,
      },
      openGraph: {
        title: product.seoTitle || `${product.name} | KALAVIES Jewellery`,
        description: desc,
        url: `https://kalavies.com/products/${product.slug}`,
        siteName: 'KALAVIES Jewellery',
        images: [
          {
            url: ogImage,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.seoTitle || `${product.name} | KALAVIES Jewellery`,
        description: desc,
        images: [ogImage],
      },
    }
  } catch {
    return {
      title: 'KALAVIES Handcrafted Jewellery',
    }
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params

  let product: any = null
  let relatedProducts: any[] = []

  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true } },
        category: true,
      },
    })

    if (product) {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          status: 'PUBLISHED',
        },
        take: 4,
        include: { images: true, category: true },
      })
    }
  } catch (err) {
    console.error('Error fetching product detail:', err)
  }

  if (!product) notFound()

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img: any) => img.url) || [],
    description: product.description || product.name,
    sku: product.sku || product.slug,
    brand: {
      '@type': 'Brand',
      name: 'KALAVIES',
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: `https://kalavies.com/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.sellingPrice,
      priceValidUntil: '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.totalStock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'KALAVIES Jewellery',
      },
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.avgRating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://kalavies.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category.name,
        item: `https://kalavies.com/products?category=${product.category.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://kalavies.com/products/${product.slug}`,
      },
    ],
  }

  return (
    <StoreLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-8">
          <Link href="/" className="hover:text-[#C9A84C]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-[#C9A84C]">Catalogue</Link>
          <ChevronRight size={12} />
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#C9A84C]">
            {product.category.name}
          </Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-[#2D2D2D] line-clamp-1">{product.name}</span>
        </div>

        {/* Product Detail Interactive Component */}
        <ProductDetailClient product={product as any} />

        {/* Related Jewellery Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E8E3DC]">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                Pairs Beautifully With
              </span>
              <h3
                className="text-2xl font-bold tracking-tight text-[#1A1A1A] mt-1"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Similar Jewellery Pieces
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel as any} />
              ))}
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  )
}
