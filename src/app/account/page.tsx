import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StoreLayout from '@/components/store/StoreLayout'
import Link from 'next/link'
import { User, Package, Heart, LogOut, ChevronRight, FileText, ArrowUpRight } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function CustomerAccountPage() {
  const user = await getSession()

  if (!user) {
    redirect('/auth/login')
  }

  const [orders, wishlistCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    }),
    prisma.wishlistItem.count({
      where: { userId: user.id },
    }),
  ])

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Top Profile Banner */}
        <div className="rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-amber-50 border-2 border-[#C9A84C] flex items-center justify-center font-bold text-xl text-[#C9A84C]">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2D2D2D]">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-xs text-[#6B6B6B]">{user.email}</p>
              {user.role === 'ADMIN' && (
                <span className="mt-1 inline-block rounded bg-black px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  Administrator
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2D2D2D] px-4 py-2 text-xs font-semibold text-white hover:bg-black transition"
              >
                Go to Admin Panel <ArrowUpRight size={13} />
              </Link>
            )}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E3DC] bg-white px-4 py-2 text-xs font-semibold text-[#6B6B6B] hover:text-red-600 transition"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-[#6B6B6B]">Total Orders</p>
            <p className="mt-1 text-2xl font-bold text-[#2D2D2D]">{orders.length}</p>
          </div>

          <Link
            href="/wishlist"
            className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm hover:border-[#C9A84C] transition"
          >
            <p className="text-xs font-semibold uppercase text-[#6B6B6B]">Saved in Wishlist</p>
            <p className="mt-1 text-2xl font-bold text-[#C9A84C]">{wishlistCount} items</p>
          </Link>

          <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-[#6B6B6B]">Privilege Status</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">Gold Member</p>
          </div>
        </div>

        {/* Order History */}
        <div className="rounded-2xl border border-[#E8E3DC] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#E8E3DC] bg-[#FAF8F5] px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-base text-[#2D2D2D]">My Orders History</h3>
            <span className="text-xs text-[#6B6B6B]">{orders.length} Orders Placed</span>
          </div>

          <div className="divide-y divide-[#E8E3DC]">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-[#6B6B6B]">
                <Package size={32} className="mx-auto mb-2 text-[#C9A84C]" />
                <p className="text-sm font-semibold">You have not placed any orders yet.</p>
                <Link
                  href="/products"
                  className="mt-4 inline-block text-xs font-bold text-[#C9A84C] hover:underline"
                >
                  Explore Jewellery Designs →
                </Link>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="p-6 hover:bg-[#FAF8F5]/50 transition space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${o.id}`}
                          className="font-bold text-base text-[#C9A84C] hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                        <StatusBadge status={o.status} type="order" />
                      </div>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">
                        Placed on {formatDate(o.createdAt)} • Total: {formatPrice(o.totalAmount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${o.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs font-semibold text-[#2D2D2D] hover:bg-gray-50 transition"
                      >
                        Track Status
                      </Link>
                      <Link
                        href={`/api/orders/${o.id}/invoice`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs font-semibold text-[#C9A84C] hover:bg-[#FAF8F5] transition"
                      >
                        <FileText size={13} /> Invoice
                      </Link>
                    </div>
                  </div>

                  {/* Items snapshot */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {o.items.map((item) => (
                      <span
                        key={item.id}
                        className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-[#2D2D2D]"
                      >
                        {item.quantity}× {item.productName}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  )
}
