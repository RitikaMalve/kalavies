import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface LowStockProduct {
  id: string
  name: string
  sku: string
  totalStock: number
  lowStockThreshold: number
}

interface LowStockAlertProps {
  products: LowStockProduct[]
}

export default function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#2D2D2D]">Low Stock Alert</h3>
        <div className="mt-4 flex flex-col items-center py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <svg
              className="h-6 w-6 text-[#4CAF50]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="mt-2 text-sm text-[#6B6B6B]">All stock levels are healthy.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#E8E3DC] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E8E3DC] px-6 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-[#FF9800]" />
          <h3 className="text-lg font-semibold text-[#2D2D2D]">Low Stock Alert</h3>
        </div>
        <span className="rounded-full bg-[#FF9800]/10 px-2.5 py-0.5 text-xs font-semibold text-[#FF9800]">
          {products.length} item{products.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="divide-y divide-[#E8E3DC]">
        {products.map((product) => {
          const stockPercent =
            product.lowStockThreshold > 0
              ? Math.round((product.totalStock / product.lowStockThreshold) * 100)
              : 0
          const isOutOfStock = product.totalStock === 0

          return (
            <div
              key={product.id}
              className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-[#FAF8F5]"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="text-sm font-medium text-[#2D2D2D] hover:text-[#C9A84C]"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-[#6B6B6B]">SKU: {product.sku}</p>
              </div>

              <div className="ml-4 flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold ${
                      isOutOfStock ? 'text-[#E53935]' : 'text-[#FF9800]'
                    }`}
                  >
                    {product.totalStock}
                  </span>
                  <span className="text-xs text-[#6B6B6B]">
                    / {product.lowStockThreshold}
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOutOfStock
                        ? 'bg-[#E53935]'
                        : stockPercent <= 50
                          ? 'bg-[#FF9800]'
                          : 'bg-[#4CAF50]'
                    }`}
                    style={{ width: `${Math.min(stockPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-[#E8E3DC] px-6 py-3">
        <Link
          href="/admin/inventory"
          className="text-sm font-medium text-[#C9A84C] hover:underline"
        >
          Manage Inventory →
        </Link>
      </div>
    </div>
  )
}
