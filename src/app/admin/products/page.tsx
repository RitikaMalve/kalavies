import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, ArrowUpDown, Filter, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    search?: string
    category?: string
    status?: string
    page?: string
  }>
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const search = params.search || ''
  const categoryId = params.category || ''
  const status = params.status || ''
  const page = Number(params.page) || 1
  const limit = 15

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { material: { contains: search } },
    ]
  }
  if (categoryId) {
    where.categoryId = categoryId
  }
  if (status) {
    where.status = status
  }

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        images: { take: 1, orderBy: { isPrimary: 'desc' } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            Products Management
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Manage your catalogue of {totalCount} jewellery pieces, pricing, and stock.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#B8963B] transition-colors"
        >
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-[#E8E3DC] bg-white p-4 shadow-sm">
        <form method="GET" className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by name, SKU, or material..."
              className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] py-2 pl-10 pr-4 text-sm focus:border-[#C9A84C] focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-[#6B6B6B]" size={18} />
          </div>

          <div>
            <select
              name="category"
              defaultValue={categoryId}
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
              defaultValue={status}
              className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
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

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-[#E8E3DC] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-[#E8E3DC] bg-[#FAF8F5] text-xs font-semibold uppercase text-[#6B6B6B]">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Pricing</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5">Flags</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3DC]">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#6B6B6B]">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="px-6 py-4">
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

                      <td className="px-4 py-4 text-xs font-medium text-[#6B6B6B]">
                        {p.category.name}
                      </td>

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

                      <td className="px-6 py-4 text-right">
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
                            title="Edit"
                            className="rounded p-1 text-[#6B6B6B] hover:bg-[#FAF8F5] hover:text-[#C9A84C]"
                          >
                            <Edit size={16} />
                          </Link>
                        </div>
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
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, totalCount)} of {totalCount} entries
            </div>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={`/admin/products?page=${page - 1}&search=${search}&category=${categoryId}&status=${status}`}
                  className="rounded border border-[#E8E3DC] bg-white px-3 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/admin/products?page=${i + 1}&search=${search}&category=${categoryId}&status=${status}`}
                  className={`rounded border px-3 py-1 text-xs font-medium ${
                    page === i + 1
                      ? 'border-[#C9A84C] bg-[#C9A84C] text-white'
                      : 'border-[#E8E3DC] bg-white hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={`/admin/products?page=${page + 1}&search=${search}&category=${categoryId}&status=${status}`}
                  className="rounded border border-[#E8E3DC] bg-white px-3 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
