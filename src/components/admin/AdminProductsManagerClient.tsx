'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  TrendingUp,
  FolderTree,
  RotateCcw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import ProductDeleteButton from '@/components/admin/ProductDeleteButton'

export interface ProductItem {
  id: string
  name: string
  slug: string
  sku: string
  sellingPrice: number
  mrp: number
  totalStock: number
  lowStockThreshold: number
  isFeatured: boolean
  isTrending: boolean
  isBestseller: boolean
  isNewArrival: boolean
  status: string
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  category: {
    id: string
    name: string
  }
  images: {
    url: string
  }[]
}

export interface CategoryOption {
  id: string
  name: string
  children: { id: string; name: string }[]
}

interface Props {
  products: ProductItem[]
  categories: CategoryOption[]
  totalCount: number
  activeCount: number
  trashCount: number
  currentPage: number
  totalPages: number
  limit: number
  currentTab: 'active' | 'trash'
  searchQuery: string
  selectedCategoryId: string
  selectedStatus: string
}

export default function AdminProductsManagerClient({
  products,
  categories,
  totalCount,
  activeCount,
  trashCount,
  currentPage,
  totalPages,
  limit,
  currentTab,
  searchQuery,
  selectedCategoryId,
  selectedStatus,
}: Props) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [targetCategory, setTargetCategory] = useState<string>('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Toggle selection for a single product
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Toggle select all on current page
  const isAllSelected = products.length > 0 && selectedIds.length === products.length
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map((p) => p.id))
    }
  }

  // Execute bulk action
  const handleBulkAction = async (
    action: 'delete' | 'restore' | 'permanent_delete' | 'set_trending' | 'set_category',
    extraPayload?: any
  ) => {
    if (selectedIds.length === 0) return
    setBulkLoading(true)

    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          productIds: selectedIds,
          ...extraPayload,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Bulk operation failed')
      }

      showToast(data.message || 'Operation completed successfully.')
      setSelectedIds([])
      setCategoryModalOpen(false)
      setDeleteConfirmOpen(false)
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'An error occurred during bulk operation', 'error')
    } finally {
      setBulkLoading(false)
    }
  }

  // Individual Restore
  const handleSingleRestore = async (id: string, name: string) => {
    setBulkLoading(true)
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          productIds: [id],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(`Restored "${name}" back to catalogue.`)
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Failed to restore product', 'error')
    } finally {
      setBulkLoading(false)
    }
  }

  // Individual Permanent Delete
  const handleSinglePermanentDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete "${name}"? This action cannot be undone.`)) {
      return
    }
    setBulkLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${id}?permanent=true`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(`Permanently deleted "${name}".`)
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product permanently', 'error')
    } finally {
      setBulkLoading(false)
    }
  }

  // Purge all expired trash
  const handlePurgeExpired = async () => {
    setBulkLoading(true)
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purge_expired' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(data.message || 'Trash purged successfully.')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Failed to purge trash', 'error')
    } finally {
      setBulkLoading(false)
    }
  }

  // Calculate remaining hours until permanent deletion (24 hours from deletedAt)
  const getRemainingTime = (deletedAtStr: string | null) => {
    if (!deletedAtStr) return 'Pending deletion'
    const deletedTime = new Date(deletedAtStr).getTime()
    const purgeTime = deletedTime + 24 * 60 * 60 * 1000
    const diffMs = purgeTime - Date.now()

    if (diffMs <= 0) return 'Expiring shortly'
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m remaining`
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl transition animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Page Title & Add Product */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            Products Management
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Manage catalogue, bulk category assignment, trending items, and trash recovery.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#B8963B] transition-colors"
          >
            <Plus size={18} /> Add New Product
          </Link>
        </div>
      </div>

      {/* Tabs: Active Catalogue vs Trash Bin */}
      <div className="flex items-center justify-between border-b border-[#E8E3DC] pb-1">
        <div className="flex gap-2">
          <Link
            href="/admin/products?tab=active"
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              currentTab === 'active'
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#2D2D2D]'
            }`}
          >
            Active Catalogue
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                currentTab === 'active'
                  ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                  : 'bg-gray-100 text-[#6B6B6B]'
              }`}
            >
              {activeCount}
            </span>
          </Link>

          <Link
            href="/admin/products?tab=trash"
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              currentTab === 'trash'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-[#6B6B6B] hover:text-red-600'
            }`}
          >
            <Trash2 size={16} />
            Trash Folder (1-Day Retention)
            {trashCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                {trashCount}
              </span>
            )}
          </Link>
        </div>

        {currentTab === 'trash' && trashCount > 0 && (
          <button
            onClick={handlePurgeExpired}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
          >
            <Clock size={14} />
            Purge Expired (&gt;24h)
          </button>
        )}
      </div>

      {/* Filter and Search Bar (Active Tab Only) */}
      {currentTab === 'active' && (
        <div className="rounded-xl border border-[#E8E3DC] bg-white p-4 shadow-sm">
          <form method="GET" className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input type="hidden" name="tab" value="active" />
            <div className="relative sm:col-span-2">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search by name, SKU, or material..."
                className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] py-2 pl-10 pr-4 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-[#6B6B6B]" size={18} />
            </div>

            <div>
              <select
                name="category"
                defaultValue={selectedCategoryId}
                className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <optgroup key={c.id} label={c.name}>
                    <option value={c.id}>{c.name} (All)</option>
                    {c.children.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        └ {sub.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <select
                name="status"
                defaultValue={selectedStatus}
                className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              >
                <option value="">Active (Published & Draft)</option>
                <option value="ALL">All Products (Inc. Archived)</option>
                <option value="PUBLISHED">Published Only</option>
                <option value="DRAFT">Draft Only</option>
              </select>
              <button
                type="submit"
                className="rounded-lg bg-[#2D2D2D] px-4 py-2 text-sm font-semibold text-white hover:bg-black transition-colors"
              >
                Filter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Action Sticky Bar (appears when 1 or more items selected) */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#C9A84C] bg-white p-4 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A84C] text-xs font-bold text-white">
              {selectedIds.length}
            </span>
            <span className="text-sm font-bold text-[#2D2D2D]">
              {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentTab === 'active' ? (
              <>
                {/* Bulk Move to Category */}
                <button
                  onClick={() => setCategoryModalOpen(true)}
                  disabled={bulkLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3 py-2 text-xs font-bold text-[#2D2D2D] hover:bg-[#E8E3DC] transition cursor-pointer"
                >
                  <FolderTree size={15} className="text-[#C9A84C]" />
                  Move to Category
                </button>

                {/* Bulk Add to Trending */}
                <button
                  onClick={() => handleBulkAction('set_trending', { isTrending: true })}
                  disabled={bulkLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                >
                  <TrendingUp size={15} />
                  Add to Trending
                </button>

                {/* Bulk Remove from Trending */}
                <button
                  onClick={() => handleBulkAction('set_trending', { isTrending: false })}
                  disabled={bulkLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  Remove Trending
                </button>

                {/* Bulk Move to Trash (Delete) */}
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={bulkLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition cursor-pointer"
                >
                  <Trash2 size={15} />
                  Move to Trash ({selectedIds.length})
                </button>
              </>
            ) : (
              <>
                {/* Trash Actions: Restore Selected */}
                <button
                  onClick={() => handleBulkAction('restore')}
                  disabled={bulkLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                >
                  <RotateCcw size={15} />
                  Restore Selected ({selectedIds.length})
                </button>

                {/* Trash Actions: Permanent Delete Selected */}
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Permanently delete ${selectedIds.length} product(s)? This cannot be undone.`
                      )
                    ) {
                      handleBulkAction('permanent_delete')
                    }
                  }}
                  disabled={bulkLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-800 transition cursor-pointer"
                >
                  <Trash2 size={15} />
                  Delete Permanently Now
                </button>
              </>
            )}

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedIds([])}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-black transition"
              title="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-[#E8E3DC] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-[#E8E3DC] bg-[#FAF8F5] text-xs font-semibold uppercase text-[#6B6B6B]">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all products"
                    className="h-4 w-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Pricing</th>
                {currentTab === 'active' ? (
                  <>
                    <th className="px-4 py-3.5">Stock</th>
                    <th className="px-4 py-3.5">Flags</th>
                    <th className="px-4 py-3.5">Status</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3.5">Deleted Date</th>
                    <th className="px-4 py-3.5">Auto-Purge Countdown</th>
                  </>
                )}
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8E3DC]">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentTab === 'active' ? 8 : 7}
                    className="px-6 py-12 text-center text-[#6B6B6B]"
                  >
                    {currentTab === 'trash' ? (
                      <div className="space-y-1">
                        <Trash2 className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="font-semibold text-[#2D2D2D]">Trash folder is empty</p>
                        <p className="text-xs">
                          Deleted products stay in this folder for 24 hours before automatic permanent removal.
                        </p>
                      </div>
                    ) : (
                      'No products found matching your search.'
                    )}
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isSelected = selectedIds.includes(p.id)

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-amber-50/50 hover:bg-amber-50'
                          : 'hover:bg-[#FAF8F5]/80'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(p.id)}
                          aria-label={`Select ${p.name}`}
                          className="h-4 w-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C] cursor-pointer"
                        />
                      </td>

                      {/* Product Thumbnail & Name */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] flex items-center justify-center overflow-hidden">
                            {p.images[0]?.url ? (
                              <img
                                src={p.images[0].url}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-[#C9A84C]">KLV</span>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-medium text-[#2D2D2D] hover:text-[#C9A84C]"
                            >
                              {p.name}
                            </Link>
                            <div className="text-xs text-[#6B6B6B]">SKU: {p.sku}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 text-xs font-medium text-[#6B6B6B]">
                        {p.category.name}
                      </td>

                      {/* Pricing */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#2D2D2D]">
                          {formatPrice(p.sellingPrice)}
                        </div>
                        {p.mrp > p.sellingPrice && (
                          <div className="text-xs text-[#6B6B6B] line-through">
                            {formatPrice(p.mrp)}
                          </div>
                        )}
                      </td>

                      {currentTab === 'active' ? (
                        <>
                          {/* Stock */}
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                p.totalStock === 0
                                  ? 'bg-red-100 text-red-800'
                                  : p.totalStock <= p.lowStockThreshold
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {p.totalStock} in stock
                            </span>
                          </td>

                          {/* Flags */}
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {p.isFeatured && (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-[#C9A84C]">
                                  Featured
                                </span>
                              )}
                              {p.isTrending && (
                                <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">
                                  Trending
                                </span>
                              )}
                              {p.isBestseller && (
                                <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600">
                                  Bestseller
                                </span>
                              )}
                              {p.isNewArrival && (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                                  New
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                p.status === 'PUBLISHED'
                                  ? 'bg-green-50 text-green-700'
                                  : p.status === 'DRAFT'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Deleted Date */}
                          <td className="px-4 py-4 text-xs text-[#6B6B6B]">
                            {p.deletedAt
                              ? new Date(p.deletedAt).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recently'}
                          </td>

                          {/* Auto-Purge Countdown */}
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200">
                              <Clock size={13} />
                              {getRemainingTime(p.deletedAt)}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {currentTab === 'active' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/products/${p.slug}`}
                              target="_blank"
                              title="View on storefront"
                              className="rounded p-1 text-[#6B6B6B] hover:bg-[#FAF8F5] hover:text-[#2D2D2D]"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              href={`/admin/products/${p.id}`}
                              title="Edit product"
                              className="rounded p-1 text-[#6B6B6B] hover:bg-[#FAF8F5] hover:text-[#C9A84C]"
                            >
                              <Edit size={16} />
                            </Link>
                            <ProductDeleteButton
                              productId={p.id}
                              productName={p.name}
                              productSku={p.sku}
                              productImage={p.images[0]?.url}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {/* Restore from Trash */}
                            <button
                              onClick={() => handleSingleRestore(p.id, p.name)}
                              disabled={bulkLoading}
                              title="Restore product to active catalogue"
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                            >
                              <RotateCcw size={13} />
                              Restore
                            </button>

                            {/* Permanent Delete Now */}
                            <button
                              onClick={() => handleSinglePermanentDelete(p.id, p.name)}
                              disabled={bulkLoading}
                              title="Delete permanently now"
                              className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E8E3DC] px-6 py-3 bg-[#FAF8F5]">
            <div className="text-xs text-[#6B6B6B]">
              Showing {(currentPage - 1) * limit + 1} to{' '}
              {Math.min(currentPage * limit, totalCount)} of {totalCount} entries
            </div>
            <div className="flex gap-1">
              {currentPage > 1 && (
                <Link
                  href={`/admin/products?tab=${currentTab}&page=${currentPage - 1}&search=${searchQuery}&category=${selectedCategoryId}&status=${selectedStatus}`}
                  className="rounded border border-[#E8E3DC] bg-white px-3 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/admin/products?tab=${currentTab}&page=${i + 1}&search=${searchQuery}&category=${selectedCategoryId}&status=${selectedStatus}`}
                  className={`rounded border px-3 py-1 text-xs font-medium ${
                    currentPage === i + 1
                      ? 'border-[#C9A84C] bg-[#C9A84C] text-white'
                      : 'border-[#E8E3DC] bg-white hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/products?tab=${currentTab}&page=${currentPage + 1}&search=${searchQuery}&category=${selectedCategoryId}&status=${selectedStatus}`}
                  className="rounded border border-[#E8E3DC] bg-white px-3 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Delete / Move to Trash Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E8E3DC] space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="rounded-full bg-red-100 p-2">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2D2D2D]">Move to Trash Folder?</h3>
                <p className="text-xs text-[#6B6B6B]">
                  {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} will be moved to the Trash Folder.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 leading-relaxed">
              <strong>1-Day Automatic Deletion:</strong> Products remain in your Trash Folder for 24 hours where you can restore them anytime. After 24 hours, they are automatically purged permanently.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="rounded-xl border border-[#E8E3DC] bg-white px-4 py-2 text-xs font-bold text-[#6B6B6B] hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={bulkLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition cursor-pointer"
              >
                {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Move Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E8E3DC] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-full bg-amber-100 p-2 text-[#C9A84C]">
                  <FolderTree size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D2D2D]">
                    Move to Category
                  </h3>
                  <p className="text-xs text-[#6B6B6B]">
                    Assign {selectedIds.length} selected product{selectedIds.length > 1 ? 's' : ''} to a category
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="text-gray-400 hover:text-black transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                Choose Destination Category:
              </label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full rounded-xl border border-[#E8E3DC] bg-[#FAF8F5] p-3 text-xs focus:border-[#C9A84C] focus:outline-none"
              >
                <option value="">-- Select a Category --</option>
                {categories.map((c) => (
                  <optgroup key={c.id} label={c.name}>
                    <option value={c.id}>{c.name} (Parent)</option>
                    {c.children.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        └ {sub.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="rounded-xl border border-[#E8E3DC] bg-white px-4 py-2 text-xs font-bold text-[#6B6B6B] hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleBulkAction('set_category', { categoryId: targetCategory })
                }
                disabled={!targetCategory || bulkLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C9A84C] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#B8963B] transition disabled:opacity-50 cursor-pointer"
              >
                {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Apply Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
