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

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { where: { isActive: true } },
      category: true,
    },
  })

  if (!product) notFound()

  // Fetch related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: 'PUBLISHED',
    },
    take: 4,
    include: { images: true, category: true },
  })

  return (
    <StoreLayout>
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
