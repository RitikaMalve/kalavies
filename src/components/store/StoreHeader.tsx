'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown,
  Phone, Mail, Loader2, ArrowRight
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice } from '@/lib/utils'

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

  // Live autocomplete search state
  const [liveResults, setLiveResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showLiveDropdown, setShowLiveDropdown] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  // Debounced search query
  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) {
      setLiveResults([])
      setIsSearching(false)
      setShowLiveDropdown(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.products) {
            setLiveResults(data.products)
            setShowLiveDropdown(true)
          }
        })
        .catch(() => {})
        .finally(() => setIsSearching(false))
    }, 200)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowLiveDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowLiveDropdown(false)
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
      setSearchOpen(false)
    }
  }

  return (
    <>
      {/* Responsive Top Announcement Bar */}
      <div className="bg-[#1A1A1A] text-white/90 text-[11px] sm:text-xs py-1.5 sm:py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="hidden md:flex items-center gap-4 text-xs text-white/80">
            <a href="mailto:support@kalavies.com" className="flex items-center gap-1.5 hover:text-[#C9A84C] transition">
              <Mail className="w-3.5 h-3.5 text-[#C9A84C]" /> support@kalavies.com
            </a>
            <span className="text-white/20">|</span>
            <a
              href="https://www.instagram.com/kalavies?utm_source=ig_web_button_share_sheet&exln=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#C9A84C] transition"
            >
              <svg className="w-3.5 h-3.5 fill-current text-[#C9A84C]" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>@kalavies</span>
            </a>
          </div>
          <div className="w-full md:w-auto flex items-center justify-center md:justify-end gap-3 text-center">
            <span className="hidden sm:inline font-medium text-white/90">Free Express Shipping on orders above ₹699</span>
            <span className="text-amber-400 font-semibold tracking-wide">✨ Daily-Wear Gold &amp; Silver Imitation Jewellery</span>
          </div>
        </div>
      </div>

      {/* Main Header with Glassmorphism */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E8E3DC] sticky top-0 z-50 transition-shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="md:hidden p-2 hover:bg-[#FAF8F5] rounded-lg transition-colors active:scale-95 text-[#2D2D2D]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Actual Brand Logo in Circle */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group py-1">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full overflow-hidden shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 border border-[#C9A84C]/20 bg-white">
                <img
                  src="/logo-circle.png"
                  alt="KALAVIES Jewellery"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-base sm:text-xl md:text-2xl font-bold tracking-wider text-[#1A1A1A] block leading-none"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  KALAVIES
                </span>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-[#C9A84C] font-semibold tracking-[0.28em] uppercase block mt-1">
                  Jewellery
                </span>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchContainerRef}>
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  placeholder="Search earrings, necklaces, bangles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (liveResults.length > 0) setShowLiveDropdown(true)
                  }}
                  className="w-full pl-10 pr-9 py-2.5 border border-[#E8E3DC] rounded-full bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                {isSearching ? (
                  <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A84C] animate-spin" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setShowLiveDropdown(false)
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </form>

              {/* Live search autocomplete dropdown */}
              {showLiveDropdown && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E8E3DC] overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3 border-b border-[#E8E3DC]/60 bg-[#FAF8F5]/80 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#6B6B6B]">
                      Matching Jewellery ({liveResults.length})
                    </span>
                    <span className="text-[11px] text-[#C9A84C] font-medium">Press Enter to view all</span>
                  </div>

                  {liveResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E3DC]/50">
                      {liveResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/products/${item.slug}`}
                          onClick={() => setShowLiveDropdown(false)}
                          className="flex items-center gap-3 p-3 hover:bg-[#FAF8F5] transition group"
                        >
                          <div className="h-11 w-11 rounded-lg border border-[#E8E3DC] overflow-hidden shrink-0 bg-[#FAF8F5]">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-[#1A1A1A] group-hover:text-[#C9A84C] truncate transition">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.categoryName && (
                                <span className="text-[10px] text-[#C9A84C] font-semibold uppercase tracking-wider">
                                  {item.categoryName}
                                </span>
                              )}
                              {item.totalStock === 0 && (
                                <span className="text-[9px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                                  Sold Out
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#1A1A1A]">
                              {formatPrice(item.sellingPrice)}
                            </span>
                            {item.mrp > item.sellingPrice && (
                              <span className="block text-[10px] text-gray-400 line-through">
                                {formatPrice(item.mrp)}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : !isSearching ? (
                    <div className="p-6 text-center text-xs text-[#6B6B6B]">
                      No exact matches found for &ldquo;{searchQuery}&rdquo;.
                      <p className="mt-1 text-[11px] text-[#C9A84C]">Press Enter to search all keywords and descriptions.</p>
                    </div>
                  ) : null}

                  <Link
                    href={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => setShowLiveDropdown(false)}
                    className="block p-3 text-center text-xs font-bold text-[#C9A84C] bg-[#FAF8F5] hover:bg-[#F3EFEA] border-t border-[#E8E3DC] transition"
                  >
                    View All Results for &ldquo;{searchQuery}&rdquo; →
                  </Link>
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
                className="md:hidden p-2 hover:bg-[#FAF8F5] rounded-lg transition-colors active:scale-95 text-[#2D2D2D]"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative p-2 hover:bg-[#FAF8F5] rounded-lg transition-colors active:scale-95 text-[#2D2D2D]"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C9A84C] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href={user ? '/account' : '/auth/login'}
                aria-label="Account"
                className="p-2 hover:bg-[#FAF8F5] rounded-lg transition-colors flex items-center active:scale-95 text-[#2D2D2D]"
              >
                <User className="w-5 h-5" />
              </Link>

              <button
                onClick={openCart}
                aria-label="Shopping Bag"
                className="relative p-2 hover:bg-[#FAF8F5] rounded-lg transition-colors active:scale-95 text-[#2D2D2D]"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#C9A84C] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden md:flex items-center gap-1 pb-2 -mx-2">
            <Link
              href="/"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                pathname === '/'
                  ? 'text-[#C9A84C] font-bold border-b-2 border-[#C9A84C]'
                  : 'text-[#2D2D2D] hover:text-[#C9A84C] hover:bg-amber-50/60'
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                pathname === '/products'
                  ? 'text-[#C9A84C] font-bold border-b-2 border-[#C9A84C]'
                  : 'text-[#2D2D2D] hover:text-[#C9A84C] hover:bg-amber-50/60'
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
                    pathname.includes(category.slug) ? 'text-[#C9A84C] font-semibold' : 'text-[#2D2D2D] hover:text-[#C9A84C] hover:bg-amber-50/60'
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
                        className="block px-4 py-2 text-sm text-[#2D2D2D] hover:bg-amber-50/60 hover:text-[#C9A84C] transition-colors"
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
          <div className="md:hidden border-t border-[#E8E3DC] p-3 relative" ref={mobileSearchRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search jewellery (e.g. necklace, jhumka, earrings)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (liveResults.length > 0) setShowLiveDropdown(true)
                }}
                autoFocus
                className="w-full pl-10 pr-9 py-2.5 border border-[#E8E3DC] rounded-full bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
              {isSearching ? (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A84C] animate-spin" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setShowLiveDropdown(false)
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              ) : null}
            </form>

            {/* Mobile Live Search Dropdown */}
            {showLiveDropdown && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-3 right-3 mt-1.5 bg-white rounded-2xl shadow-xl border border-[#E8E3DC] overflow-hidden z-50 animate-fadeIn">
                <div className="p-2.5 border-b border-[#E8E3DC]/60 bg-[#FAF8F5]/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#6B6B6B]">
                    Results ({liveResults.length})
                  </span>
                  <span className="text-[11px] text-[#C9A84C] font-medium">Tap result to view</span>
                </div>

                {liveResults.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E8E3DC]/50">
                    {liveResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        onClick={() => {
                          setShowLiveDropdown(false)
                          setSearchOpen(false)
                        }}
                        className="flex items-center gap-2.5 p-2.5 hover:bg-[#FAF8F5] transition"
                      >
                        <div className="h-10 w-10 rounded-lg border border-[#E8E3DC] overflow-hidden shrink-0 bg-[#FAF8F5]">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-[#1A1A1A] truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-[#C9A84C] font-semibold uppercase">
                            {item.categoryName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#1A1A1A]">
                            {formatPrice(item.sellingPrice)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : !isSearching ? (
                  <div className="p-4 text-center text-xs text-[#6B6B6B]">
                    No direct matches. Tap below to search all jewellery.
                  </div>
                ) : null}

                <Link
                  href={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                  onClick={() => {
                    setShowLiveDropdown(false)
                    setSearchOpen(false)
                  }}
                  className="block p-2.5 text-center text-xs font-bold text-[#C9A84C] bg-[#FAF8F5] border-t border-[#E8E3DC]"
                >
                  See all for &ldquo;{searchQuery}&rdquo; →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8E3DC] bg-white max-h-[70vh] overflow-y-auto">
            <div className="p-4 space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  pathname === '/'
                    ? 'text-[#C9A84C] font-bold bg-amber-50/80 border-l-4 border-[#C9A84C]'
                    : 'text-[#2D2D2D] hover:text-[#C9A84C] hover:bg-amber-50/50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  pathname === '/products'
                    ? 'text-[#C9A84C] font-bold bg-amber-50/80 border-l-4 border-[#C9A84C]'
                    : 'text-[#2D2D2D] hover:text-[#C9A84C] hover:bg-amber-50/50'
                }`}
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
              <div className="pt-2">
                <a
                  href="https://www.instagram.com/kalavies?utm_source=ig_web_button_share_sheet&exln=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-xl shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Follow @kalavies on Instagram</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
