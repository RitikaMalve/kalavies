import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  if (!product) {
    notFound()
  }

  return <ProductForm initialData={product} categories={categories} isEditing={true} />
}
