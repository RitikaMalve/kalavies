import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Search, Eye, Filter } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    search?: string
    status?: string
    page?: string
  }>
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams
  const search = params.search || ''
  const status = params.status || ''
  const page = Number(params.page) || 1
  const limit = 15

  const where: any = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { shippingName: { contains: search } },
      { shippingPhone: { contains: search } },
    ]
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: true,
      },
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            Order Management
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Track customer orders, manage fulfillments, courier tracking, and invoices.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-[#E8E3DC] bg-white p-4 shadow-sm">
        <form method="GET" className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by order number or customer name..."
              className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] py-2 pl-10 pr-4 text-sm focus:border-[#C9A84C] focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-[#6B6B6B]" size={18} />
          </div>

          <div className="flex gap-2">
            <select
              name="status"
              defaultValue={status}
              className="rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="RETURNED">Returned</option>
            </select>

            <button
              type="submit"
              className="rounded-lg bg-[#2D2D2D] px-4 py-2 text-sm font-semibold text-white hover:bg-black transition"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl border border-[#E8E3DC] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-[#E8E3DC] bg-[#FAF8F5] text-xs font-semibold uppercase text-[#6B6B6B]">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Items</th>
                <th className="px-4 py-3.5">Total Amount</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Fulfillment Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3DC]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#6B6B6B]">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const customerName = o.user
                    ? `${o.user.firstName} ${o.user.lastName}`
                    : o.shippingName || 'Guest'

                  return (
                    <tr key={o.id} className="hover:bg-[#FAF8F5]/80 transition">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-semibold text-[#C9A84C] hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-[#2D2D2D]">{customerName}</div>
                        <div className="text-xs text-[#6B6B6B]">{o.shippingCity || o.user?.email}</div>
                      </td>

                      <td className="px-4 py-4 text-xs text-[#6B6B6B]">
                        {formatDate(o.createdAt)}
                      </td>

                      <td className="px-4 py-4 text-xs text-[#6B6B6B]">
                        {o.items.length} item{o.items.length !== 1 ? 's' : ''}
                      </td>

                      <td className="px-4 py-4 font-bold text-[#2D2D2D]">
                        {formatPrice(o.totalAmount)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <StatusBadge status={o.paymentStatus} type="payment" />
                          <div className="text-[10px] text-[#6B6B6B] uppercase font-semibold">
                            {o.paymentMethod}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={o.status} type="order" />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs font-semibold text-[#2D2D2D] hover:border-[#C9A84C] hover:text-[#C9A84C] transition"
                        >
                          <Eye size={14} /> View Order
                        </Link>
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
              {Math.min(page * limit, totalCount)} of {totalCount} orders
            </div>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={`/admin/orders?page=${page - 1}&search=${search}&status=${status}`}
                  className="rounded border border-[#E8E3DC] bg-white px-3 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/admin/orders?page=${i + 1}&search=${search}&status=${status}`}
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
                  href={`/admin/orders?page=${page + 1}&search=${search}&status=${status}`}
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
