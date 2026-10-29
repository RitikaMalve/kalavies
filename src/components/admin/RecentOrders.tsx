import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatPrice, formatDate } from '@/lib/utils'

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  createdAt: string | Date
  totalAmount: number
  status: string
  paymentStatus: string
}

interface RecentOrdersProps {
  orders: RecentOrder[]
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-[#E8E3DC] bg-white p-6">
        <h3 className="text-lg font-semibold text-[#2D2D2D]">Recent Orders</h3>
        <p className="mt-4 text-center text-sm text-[#6B6B6B]">
          No orders yet.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#E8E3DC] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E8E3DC] px-6 py-4">
        <h3 className="text-lg font-semibold text-[#2D2D2D]">Recent Orders</h3>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-[#C9A84C] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-[#E8E3DC] bg-[#FAF8F5]">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Payment
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E3DC]">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="transition-colors hover:bg-[#FAF8F5]"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-sm font-medium text-[#C9A84C] hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-[#2D2D2D]">
                  {order.customerName}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-[#6B6B6B]">
                  {formatDate(order.createdAt)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#2D2D2D]">
                  {formatPrice(order.totalAmount)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <StatusBadge status={order.status} type="order" />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
