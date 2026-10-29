'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Warehouse,
  ShoppingBag,
  Percent,
  TrendingUp,
  Image,
  Users,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react'

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string | null
}

interface AdminShellProps {
  user: AdminUser
  children: React.ReactNode
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Discounts & Coupons', href: '/admin/discounts', icon: Percent },
  { label: 'Trending', href: '/admin/trending', icon: TrendingUp },
  { label: 'Banners', href: '/admin/banners', icon: Image },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Invoices', href: '/admin/invoices', icon: FileText },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch {
      router.push('/auth/login')
    }
  }

  const initials =
    (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1A1A1A] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-full overflow-hidden shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <img
                src="/logo-circle.png"
                alt="KALAVIES"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span className="text-base font-bold tracking-wider text-white block leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>
                KALAVIES
              </span>
              <span className="text-[9px] text-[#C9A84C] font-semibold tracking-widest uppercase block mt-1">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-gray-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <Icon
                  size={20}
                  className={active ? 'text-[#C9A84C]' : 'text-gray-500 group-hover:text-gray-300'}
                />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A84C]/20 text-xs font-bold text-[#C9A84C]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-200">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E8E3DC] bg-white px-4 lg:px-6">
          {/* Left: hamburger + search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-[#6B6B6B] hover:bg-gray-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="hidden items-center gap-2 rounded-lg bg-[#FAF8F5] px-3 py-2 md:flex">
              <Search size={16} className="text-[#6B6B6B]" />
              <input
                type="text"
                placeholder="Search..."
                className="w-56 bg-transparent text-sm text-[#2D2D2D] outline-none placeholder:text-[#6B6B6B]"
              />
            </div>
          </div>

          {/* Right: notifications + profile */}
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-[#6B6B6B] transition-colors hover:bg-[#FAF8F5] hover:text-[#2D2D2D]">
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E53935]" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#FAF8F5]"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A84C] text-xs font-bold text-white">
                    {initials}
                  </div>
                )}
                <span className="hidden text-sm font-medium text-[#2D2D2D] md:inline">
                  {user.firstName}
                </span>
                <ChevronDown size={14} className="text-[#6B6B6B]" />
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-[#E8E3DC] bg-white py-1 shadow-lg">
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#2D2D2D] hover:bg-[#FAF8F5]"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={16} className="text-[#6B6B6B]" />
                      Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#2D2D2D] hover:bg-[#FAF8F5]"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings size={16} className="text-[#6B6B6B]" />
                      Settings
                    </Link>
                    <hr className="my-1 border-[#E8E3DC]" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#E53935] hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
