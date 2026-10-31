'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown,
  Phone, Mail
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'

interface Category {
  id: string
  name: string
  slug: string
  children?: Category[]
}

interface StoreHeaderProps {
  categories: Category[]
  user: { firstName: string; lastName: string; email: string } | null
}

export default function StoreHeader({ categories, user }: StoreHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const { itemCount, openCart } = useCart()
  const { itemCount: wishlistCount } = useWishlist()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
      setSearchOpen(false)
    }
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#1A1A1A] text-white/80 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> +91 98765 43210
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> hello@kalavies.com
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Free Shipping on orders above ₹699</span>
            <span className="text-amber-400 font-medium">✨ Premium Oxidised & Traditional Jewellery</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-[#E8E3DC] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[#FAF8F5] rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Actual Brand Logo in Circle */}
            <Link href="/" className="flex items-center gap-3 group py-1">
              <div className="relative h-11 w-11 md:h-14 md:w-14 rounded-full overflow-hidden shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo-circle.png"
                  alt="KALAVIES Jewellery"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-lg md:text-2xl font-bold tracking-wider text-[#1A1A1A] block leading-none"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  KALAVIES
                </span>
                <span className="text-[9px] md:text-[10px] text-[#C9A84C] font-semibold tracking-[0.28em] uppercase block mt-1">
                  Jewellery
                </span>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  placeholder="Search jewellery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#E8E3DC] rounded-full bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 hover:bg-[#FAF8F5] rounded-lg transition-colors"
              >
                <Search className="w-5 h-5 text-[#2D2D2D]" />
              </button>

              <Link
                href="/wishlist"
                className="relative p-2 hover:bg-[#FAF8F5] rounded-lg transition-colors"
              >
                <Heart className="w-5 h-5 text-[#2D2D2D]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C9A84C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href={user ? '/account' : '/auth/login'}
                className="p-2 hover:bg-[#FAF8F5] rounded-lg transition-colors hidden md:flex"
              >
                <User className="w-5 h-5 text-[#2D2D2D]" />
              </Link>

              <button
                onClick={openCart}
                className="relative p-2 hover:bg-[#FAF8F5] rounded-lg transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-[#2D2D2D]" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#C9A84C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden md:flex items-center gap-1 pb-2 -mx-2">
            <Link
              href="/products"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                pathname === '/products' ? 'text-[#C9A84C]' : 'text-[#2D2D2D] hover:text-[#C9A84C] hover:bg-[#FAF8F5]'
              }`}
            >
              All Jewellery
            </Link>
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => setActiveDropdown(category.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    pathname.includes(category.slug) ? 'text-[#C9A84C]' : 'text-[#2D2D2D] hover:text-[#C9A84C] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {category.name}
                  {category.children && category.children.length > 0 && (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </Link>
                {activeDropdown === category.id && category.children && category.children.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-[#E8E3DC] py-2 z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/products?category=${child.slug}`}
                        className="block px-4 py-2 text-sm text-[#2D2D2D] hover:bg-[#FAF8F5] hover:text-[#C9A84C] transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/products?filter=new"
              className="px-3 py-1.5 text-sm font-medium text-[#B76E79] hover:bg-[#FAF8F5] rounded-md transition-colors"
            >
              New Arrivals
            </Link>
            <Link
              href="/products?filter=sale"
              className="px-3 py-1.5 text-sm font-medium text-[#E53935] hover:bg-[#FAF8F5] rounded-md transition-colors"
            >
              Sale
            </Link>
          </nav>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-[#E8E3DC] p-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 border border-[#E8E3DC] rounded-full bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8E3DC] bg-white max-h-[70vh] overflow-y-auto">
            <div className="p-4 space-y-1">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[#2D2D2D] hover:bg-[#FAF8F5] rounded-lg"
              >
                All Jewellery
              </Link>
              {categories.map((category) => (
                <div key={category.id}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-[#2D2D2D] hover:bg-[#FAF8F5] rounded-lg"
                  >
                    {category.name}
                  </Link>
                  {category.children && category.children.length > 0 && (
                    <div className="ml-4 space-y-0.5">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/products?category=${child.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 text-sm text-[#6B6B6B] hover:text-[#C9A84C] hover:bg-[#FAF8F5] rounded-lg"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <hr className="my-2 border-[#E8E3DC]" />
              <Link
                href={user ? '/account' : '/auth/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[#2D2D2D] hover:bg-[#FAF8F5] rounded-lg"
              >
                {user ? 'My Account' : 'Sign In'}
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[#2D2D2D] hover:bg-[#FAF8F5] rounded-lg"
              >
                Wishlist ({wishlistCount})
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
