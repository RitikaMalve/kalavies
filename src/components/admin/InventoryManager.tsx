'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Warehouse,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
  Search,
  X,
  History,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ProductStock {
  id: string
  name: string
  sku: string
  totalStock: number
  lowStockThreshold: number
  sellingPrice: number
  category: { name: string }
  variants: { id: string; name: string; sku: string; stock: number }[]
}

interface StockMovement {
  id: string
  type: string
  quantity: number
  reason: string | null
  previousQty: number
  newQty: number
  createdAt: Date | string
  product: { name: string; sku: string }
}

export default function InventoryManager({
  initialProducts,
  initialMovements,
}: {
  initialProducts: ProductStock[]
  initialMovements: StockMovement[]
}) {
  const router = useRouter()
  const [products] = useState<ProductStock[]>(initialProducts)
  const [movements] = useState<StockMovement[]>(initialMovements)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'LOW' | 'OUT'>('ALL')

  // Stock Adjustment Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductStock | null>(null)
  const [adjType, setAdjType] = useState<'PURCHASE' | 'ADJUSTMENT' | 'DAMAGED'>('PURCHASE')
  const [adjQuantity, setAdjQuantity] = useState<number>(10)
  const [adjReason, setAdjReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'STOCK' | 'LOGS'>('STOCK')

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false

    if (filterType === 'LOW') return p.totalStock <= p.lowStockThreshold && p.totalStock > 0
    if (filterType === 'OUT') return p.totalStock === 0
    return true
  })

  const openAdjustModal = (product: ProductStock) => {
    setSelectedProduct(product)
    setAdjType('PURCHASE')
    setAdjQuantity(10)
    setAdjReason('Stock restock batch')
    setModalOpen(true)
  }

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    setLoading(true)

    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          type: adjType,
          quantity: Number(adjQuantity),
          reason: adjReason,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Adjustment failed')

      setModalOpen(false)
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      alert(err.message || 'Stock adjustment failed')
    } finally {
      setLoading(false)
    }
  }

  const outOfStockCount = products.filter((p) => p.totalStock === 0).length
  const lowStockCount = products.filter(
    (p) => p.totalStock <= p.lowStockThreshold && p.totalStock > 0
  ).length
  const totalStockUnits = products.reduce((sum, p) => sum + p.totalStock, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            Inventory & Stock Control
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Real-time stock quantities, reorder alerts, batch purchases, and movement history.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('STOCK')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'STOCK'
                ? 'bg-[#C9A84C] text-white shadow-sm'
                : 'bg-white border border-[#E8E3DC] text-[#2D2D2D] hover:bg-gray-50'
            }`}
          >
            Inventory Table
          </button>
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'LOGS'
                ? 'bg-[#C9A84C] text-white shadow-sm'
                : 'bg-white border border-[#E8E3DC] text-[#2D2D2D] hover:bg-gray-50'
            }`}
          >
            Stock Movement History
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[#6B6B6B]">Total Inventory Units</p>
              <p className="mt-1 text-2xl font-bold text-[#2D2D2D]">{totalStockUnits} units</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Warehouse size={22} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setFilterType('LOW')}
          className="cursor-pointer rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm hover:border-[#FF9800] transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[#6B6B6B]">Low Stock Alerts</p>
              <p className="mt-1 text-2xl font-bold text-[#FF9800]">{lowStockCount} items</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-[#FF9800]">
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setFilterType('OUT')}
          className="cursor-pointer rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm hover:border-red-500 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[#6B6B6B]">Out of Stock</p>
              <p className="mt-1 text-2xl font-bold text-[#E53935]">{outOfStockCount} items</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-[#E53935]">
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'STOCK' ? (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col gap-3 rounded-xl border border-[#E8E3DC] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search stock by product name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] py-2 pl-10 pr-4 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-[#6B6B6B]" size={18} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType('ALL')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filterType === 'ALL'
                    ? 'bg-[#2D2D2D] text-white'
                    : 'border border-[#E8E3DC] bg-white text-[#6B6B6B]'
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setFilterType('LOW')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filterType === 'LOW'
                    ? 'bg-[#FF9800] text-white'
                    : 'border border-[#E8E3DC] bg-white text-[#6B6B6B]'
                }`}
              >
                Low Stock ({lowStockCount})
              </button>
              <button
                onClick={() => setFilterType('OUT')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filterType === 'OUT'
                    ? 'bg-[#E53935] text-white'
                    : 'border border-[#E8E3DC] bg-white text-[#6B6B6B]'
                }`}
              >
                Out of Stock ({outOfStockCount})
              </button>
            </div>
          </div>

          {/* Stock Table */}
          <div className="overflow-hidden rounded-xl border border-[#E8E3DC] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="border-b border-[#E8E3DC] bg-[#FAF8F5] text-xs font-semibold uppercase text-[#6B6B6B]">
                  <tr>
                    <th className="px-6 py-3.5">Product & SKU</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Threshold</th>
                    <th className="px-4 py-3.5">Stock Status</th>
                    <th className="px-4 py-3.5">Available Units</th>
                    <th className="px-6 py-3.5 text-right">Quick Stock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3DC]">
                  {filteredProducts.map((p) => {
                    const isOut = p.totalStock === 0
                    const isLow = p.totalStock <= p.lowStockThreshold && !isOut

                    return (
                      <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#2D2D2D]">{p.name}</div>
                          <div className="text-xs text-[#6B6B6B]">SKU: {p.sku}</div>
                        </td>

                        <td className="px-4 py-4 text-xs font-medium text-[#6B6B6B]">
                          {p.category.name}
                        </td>

                        <td className="px-4 py-4 text-xs text-[#6B6B6B]">
                          alert at ≤ {p.lowStockThreshold}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isOut
                                ? 'bg-red-100 text-red-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock Alert' : 'Healthy Stock'}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-base font-bold text-[#2D2D2D]">{p.totalStock}</span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openAdjustModal(p)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9A84C] bg-white px-3 py-1.5 text-xs font-semibold text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white transition"
                          >
                            <RefreshCw size={13} /> Adjust Stock
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Stock Movement Log Table */
        <div className="overflow-hidden rounded-xl border border-[#E8E3DC] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-[#E8E3DC] bg-[#FAF8F5] text-xs font-semibold uppercase text-[#6B6B6B]">
                <tr>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Change</th>
                  <th className="px-4 py-3.5">Before → After</th>
                  <th className="px-6 py-3.5">Reason / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3DC]">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#6B6B6B]">
                      No movement history found.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isPositive = m.quantity > 0

                    return (
                      <tr key={m.id} className="hover:bg-[#FAF8F5]/80 transition">
                        <td className="px-6 py-3.5 text-xs text-[#6B6B6B]">
                          {formatDate(m.createdAt)}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-medium text-[#2D2D2D]">{m.product.name}</div>
                          <div className="text-xs text-[#6B6B6B]">{m.product.sku}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                            {m.type}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`font-bold ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {isPositive ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-xs text-[#6B6B6B]">
                          {m.previousQty} → {m.newQty}
                        </td>

                        <td className="px-6 py-3.5 text-xs text-[#2D2D2D]">
                          {m.reason || 'Manual record'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#E8E3DC]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DC]">
              <div>
                <h3 className="text-lg font-bold text-[#2D2D2D]">Adjust Stock Quantity</h3>
                <p className="text-xs text-[#6B6B6B]">
                  {selectedProduct.name} ({selectedProduct.sku})
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-[#6B6B6B] hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Adjustment Type
                </label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value as any)}
                  className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                >
                  <option value="PURCHASE">Stock Purchase / Restock (+)</option>
                  <option value="ADJUSTMENT">Manual Inventory Correction (+ / -)</option>
                  <option value="DAMAGED">Damaged / Written-off Stock (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Quantity ({adjType === 'DAMAGED' ? 'Units to Deduct' : 'Units to Add'}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjQuantity}
                  onChange={(e) => setAdjQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Reason / Reference Note *
                </label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Supplier PO #4928 or Showroom display damaged"
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="rounded-lg bg-[#FAF8F5] p-3 text-xs text-[#6B6B6B]">
                Current stock: <strong className="text-[#2D2D2D]">{selectedProduct.totalStock}</strong> → New
                stock will be:{' '}
                <strong className="text-[#C9A84C]">
                  {adjType === 'DAMAGED'
                    ? Math.max(0, selectedProduct.totalStock - adjQuantity)
                    : selectedProduct.totalStock + adjQuantity}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E3DC]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[#6B6B6B] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#C9A84C] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Record Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
