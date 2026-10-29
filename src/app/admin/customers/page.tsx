import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { Users, Mail, Phone, ShoppingBag } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    include: {
      orders: {
        select: { id: true, totalAmount: true, status: true },
      },
      addresses: { take: 1 },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
          Customer Directory
        </h1>
        <p className="text-sm text-[#6B6B6B]">
          Browse customer registered profiles, order histories, and lifetime jewellery spend.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E8E3DC] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-[#E8E3DC] bg-[#FAF8F5] text-xs font-semibold uppercase text-[#6B6B6B]">
              <tr>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">Joined Date</th>
                <th className="px-4 py-3.5">Total Orders</th>
                <th className="px-4 py-3.5">Lifetime Spend</th>
                <th className="px-6 py-3.5 text-right">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3DC]">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6B6B6B]">
                    No registered customers yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const lifetimeSpend = c.orders.reduce((sum, o) => sum + o.totalAmount, 0)

                  return (
                    <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-amber-50 border border-[#C9A84C]/30 flex items-center justify-center font-bold text-xs text-[#C9A84C]">
                            {c.firstName[0]}
                            {c.lastName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-[#2D2D2D]">
                              {c.firstName} {c.lastName}
                            </div>
                            <div className="text-xs text-[#6B6B6B]">ID: {c.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs text-[#6B6B6B] space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-[#C9A84C]" /> {c.email}
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-[#C9A84C]" /> {c.phone}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-xs text-[#6B6B6B]">
                        {formatDate(c.createdAt)}
                      </td>

                      <td className="px-4 py-4 font-semibold text-[#2D2D2D]">
                        {c.orders.length} orders
                      </td>

                      <td className="px-4 py-4 font-bold text-[#C9A84C]">
                        {formatPrice(lifetimeSpend)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
