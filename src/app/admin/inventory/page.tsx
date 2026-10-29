import { prisma } from '@/lib/prisma'
import InventoryManager from '@/components/admin/InventoryManager'

export const dynamic = 'force-dynamic'

export default async function AdminInventoryPage() {
  const [products, stockMovements] = await Promise.all([
    prisma.product.findMany({
      where: { status: { not: 'ARCHIVED' } },
      orderBy: { totalStock: 'asc' },
      select: {
        id: true,
        name: true,
        sku: true,
        totalStock: true,
        lowStockThreshold: true,
        sellingPrice: true,
        category: { select: { name: true } },
        variants: {
          select: { id: true, name: true, sku: true, stock: true },
        },
      },
    }),
    prisma.stockMovement.findMany({
      take: 25,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
      },
    }),
  ])

  return (
    <InventoryManager initialProducts={products} initialMovements={stockMovements} />
  )
}
