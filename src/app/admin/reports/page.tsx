import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
  const [orders, products, users] = await Promise.all([
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      orderBy: { soldCount: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        sku: true,
        soldCount: true,
        sellingPrice: true,
        category: { select: { name: true } },
      },
    }),
    prisma.user.findMany({ where: { role: 'CUSTOMER' } }),
  ])

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
          Sales & Analytics Reports
        </h1>
        <p className="text-sm text-[#6B6B6B]">
          Performance metrics, revenue analytics, customer volume, and best performing jewellery.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-[#6B6B6B]">Total Gross Revenue</p>
          <p className="mt-1 text-2xl font-bold text-[#2D2D2D]">{formatPrice(totalSales)}</p>
          <p className="text-xs text-green-600 mt-1">Across all order channels</p>
        </div>

        <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-[#6B6B6B]">Average Order Value (AOV)</p>
          <p className="mt-1 text-2xl font-bold text-[#2D2D2D]">{formatPrice(averageOrderValue)}</p>
          <p className="text-xs text-[#6B6B6B] mt-1">Per completed transaction</p>
        </div>

        <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-[#6B6B6B]">Total Products Active</p>
          <p className="mt-1 text-2xl font-bold text-[#2D2D2D]">{products.length} Best Performers</p>
          <p className="text-xs text-[#C9A84C] mt-1">Top converting designs</p>
        </div>
      </div>

      {/* Top Performing Jewellery Pieces */}
      <div className="rounded-xl border border-[#E8E3DC] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E8E3DC] bg-[#FAF8F5] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#C9A84C]" />
            <h3 className="font-semibold text-[#2D2D2D]">Top Best-Selling Jewellery Pieces</h3>
          </div>
          <span className="text-xs text-[#6B6B6B]">Ranked by units sold</span>
        </div>

        <div className="divide-y divide-[#E8E3DC]">
          {products.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-[#FAF8F5]/80 transition">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-[#C9A84C]">
                  {i + 1}
                </span>
                <div>
                  <div className="font-semibold text-[#2D2D2D]">{p.name}</div>
                  <div className="text-xs text-[#6B6B6B]">
                    {p.category.name} • SKU: {p.sku}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-[#2D2D2D]">{p.soldCount} units sold</div>
                <div className="text-xs text-[#C9A84C] font-medium">
                  {formatPrice(p.soldCount * p.sellingPrice)} revenue
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
