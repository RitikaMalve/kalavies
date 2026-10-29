import { prisma } from '@/lib/prisma'
import DashboardStats from '@/components/admin/DashboardStats'
import RecentOrders from '@/components/admin/RecentOrders'
import LowStockAlert from '@/components/admin/LowStockAlert'
import Link from 'next/link'
import { Package, FolderTree, ShoppingBag, Percent, ArrowUpRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [
    totalProducts,
    totalCategories,
    totalOrders,
    totalCustomers,
    recentOrdersData,
    lowStockProducts,
    allOrders,
  ] = await Promise.all([
    prisma.product.count({ where: { status: { not: 'ARCHIVED' } } }),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.product.findMany({
      where: {
        totalStock: { lte: 10 },
        status: 'PUBLISHED',
      },
      take: 6,
      select: {
        id: true,
        name: true,
        sku: true,
        totalStock: true,
        lowStockThreshold: true,
      },
      orderBy: { totalStock: 'asc' },
    }),
    prisma.order.findMany({
      select: {
        totalAmount: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
  ])

  // Calculate total revenue from delivered or paid orders
  const totalRevenue = allOrders
    .filter((o) => o.paymentStatus === 'PAID' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  // Pending orders count
  const pendingOrdersCount = allOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED'
  ).length

  // Recent orders formatted
  const formattedRecentOrders = recentOrdersData.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.user ? `${order.user.firstName} ${order.user.lastName}` : (order.shippingName || 'Guest'),
    createdAt: order.createdAt,
    totalAmount: order.totalAmount,
    status: order.status,
    paymentStatus: order.paymentStatus,
  }))

  const stats = [
    {
      label: 'Total Revenue',
      value: totalRevenue,
      icon: 'revenue' as const,
      change: 14.2,
      subtitle: `${allOrders.length} orders total`,
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: 'orders' as const,
      change: 8.5,
      subtitle: `${pendingOrdersCount} pending action`,
    },
    {
      label: 'Total Products',
      value: totalProducts,
      icon: 'products' as const,
      subtitle: `${totalCategories} categories`,
    },
    {
      label: 'Total Customers',
      value: totalCustomers,
      icon: 'customers' as const,
      change: 12.0,
      subtitle: 'Registered buyers',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Welcome back to KALAVIES Jewellery administration overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#B8963B] transition-colors"
          >
            <Package size={16} /> Add Product
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E3DC] bg-white px-4 py-2 text-sm font-semibold text-[#2D2D2D] shadow-sm hover:bg-[#FAF8F5] transition-colors"
          >
            View Store <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Quick Actions Shortcuts */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link
          href="/admin/products"
          className="flex items-center gap-3 rounded-xl border border-[#E8E3DC] bg-white p-4 shadow-sm transition hover:border-[#C9A84C] hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-[#C9A84C]">
            <Package size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#2D2D2D]">Products</div>
            <div className="text-xs text-[#6B6B6B]">Manage Catalog</div>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="flex items-center gap-3 rounded-xl border border-[#E8E3DC] bg-white p-4 shadow-sm transition hover:border-[#C9A84C] hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FolderTree size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#2D2D2D]">Categories</div>
            <div className="text-xs text-[#6B6B6B]">Hierarchy & Order</div>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="flex items-center gap-3 rounded-xl border border-[#E8E3DC] bg-white p-4 shadow-sm transition hover:border-[#C9A84C] hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <ShoppingBag size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#2D2D2D]">Orders</div>
            <div className="text-xs text-[#6B6B6B]">{pendingOrdersCount} Pending</div>
          </div>
        </Link>

        <Link
          href="/admin/discounts"
          className="flex items-center gap-3 rounded-xl border border-[#E8E3DC] bg-white p-4 shadow-sm transition hover:border-[#C9A84C] hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Percent size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#2D2D2D]">Discounts</div>
            <div className="text-xs text-[#6B6B6B]">Coupons & Offers</div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Orders & Low Stock */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrders orders={formattedRecentOrders} />
        </div>
        <div>
          <LowStockAlert products={lowStockProducts} />
        </div>
      </div>
    </div>
  )
}
