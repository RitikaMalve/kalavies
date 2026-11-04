import Link from 'next/link'
import { Mail, MapPin, ShieldCheck, RefreshCw, Sparkles, Truck } from 'lucide-react'

export default function StoreFooter() {
  return (
    <footer className="border-t border-[#E8E3DC] bg-[#1A1A1A] text-white">
      {/* Guarantees bar */}
      <div className="border-b border-white/10 bg-[#222222] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-2xl bg-white/[0.04] border border-white/10 p-3 sm:p-4 hover:border-[#C9A84C]/50 transition shadow-xs">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#C9A84C]" />
            <h4 className="text-xs sm:text-sm font-bold tracking-wide" style={{ color: '#FFFFFF' }}>100% Authentic Jewellery</h4>
            <p className="text-[10px] sm:text-xs text-stone-300">Gold &amp; silver tone lightweight designs</p>
          </div>
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-2xl bg-white/[0.04] border border-white/10 p-3 sm:p-4 hover:border-[#C9A84C]/50 transition shadow-xs">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#C9A84C]" />
            <h4 className="text-xs sm:text-sm font-bold tracking-wide" style={{ color: '#FFFFFF' }}>Free Express Shipping</h4>
            <p className="text-[10px] sm:text-xs text-stone-300">On all prepaid orders above ₹699</p>
          </div>
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-2xl bg-white/[0.04] border border-white/10 p-3 sm:p-4 hover:border-[#C9A84C]/50 transition shadow-xs">
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-[#C9A84C]" />
            <h4 className="text-xs sm:text-sm font-bold tracking-wide" style={{ color: '#FFFFFF' }}>7-Day Easy Returns</h4>
            <p className="text-[10px] sm:text-xs text-stone-300">Hassle-free replacement guarantee</p>
          </div>
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-2xl bg-white/[0.04] border border-white/10 p-3 sm:p-4 hover:border-[#C9A84C]/50 transition shadow-xs">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#C9A84C]" />
            <h4 className="text-xs sm:text-sm font-bold tracking-wide" style={{ color: '#FFFFFF' }}>Secure UPI Checkout</h4>
            <p className="text-[10px] sm:text-xs text-stone-300">100% Safe, bank-verified prepaid orders</p>
          </div>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src="/logo-circle.png"
                alt="KALAVIES Jewellery"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span
                className="text-xl font-bold tracking-wider text-white block leading-none"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                KALAVIES
              </span>
              <span className="text-[9px] text-[#C9A84C] font-semibold tracking-[0.25em] uppercase block mt-1">
                Jewellery
              </span>
            </div>
          </Link>
          <p className="text-xs text-white/70 leading-relaxed mb-4">
            Kalavies offers affordable, stylish imitation jewellery for everyday use, casual outfits, and special occasions. Lightweight, minimal, and trendy designs crafted to shine effortlessly.
          </p>
          <div className="text-xs text-white/70 space-y-1.5 mb-4">
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#C9A84C]" /> support@kalavies.com
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" /> Nagpur, Maharashtra - 440034
            </p>
          </div>
          <div className="pt-1">
            <a
              href="https://www.instagram.com/kalavies?utm_source=ig_web_button_share_sheet&exln=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white text-xs font-bold transition shadow-sm hover:scale-105 active:scale-95 group"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Follow @kalavies</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wider mb-4">
            Shop Collections
          </h4>
          <ul className="text-xs text-white/70 space-y-2.5">
            <li>
              <Link href="/products" className="hover:text-[#C9A84C] transition font-semibold text-white/90">
                All Jewellery
              </Link>
            </li>
            <li>
              <Link href="/products?category=earrings" className="hover:text-[#C9A84C] transition">
                Earrings & Jhumkas
              </Link>
            </li>
            <li>
              <Link href="/products?category=nose-pins" className="hover:text-[#C9A84C] transition">
                Nose Pins & Nath
              </Link>
            </li>
            <li>
              <Link href="/products?category=necklaces" className="hover:text-[#C9A84C] transition">
                Necklaces & Chokers
              </Link>
            </li>
            <li>
              <Link href="/products?category=bangles" className="hover:text-[#C9A84C] transition">
                Bangles & Kadas
              </Link>
            </li>
            <li>
              <Link href="/products?category=rings" className="hover:text-[#C9A84C] transition">
                Finger Rings
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wider mb-4">
            Customer Care
          </h4>
          <ul className="text-xs text-white/70 space-y-2.5">
            <li>
              <Link href="/account" className="hover:text-[#C9A84C] transition">
                My Orders & Tracking
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-[#C9A84C] transition">
                Saved Wishlist
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-[#C9A84C] transition">
                Shopping Bag
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:text-[#C9A84C] transition">
                Customer Sign In
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-[#C9A84C]/80 hover:text-[#C9A84C] transition font-medium">
                Admin Control Panel
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wider mb-4">
            Newsletter & Privilege Club
          </h4>
          <p className="text-xs text-white/70 mb-3">
            Subscribe to receive festival sale early access, private VIP discounts, and new arrivals previews.
          </p>
          <form className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-[#C9A84C] focus:outline-none"
            />
            <button
              type="button"
              className="w-full rounded-lg bg-[#C9A84C] py-2 text-xs font-semibold text-white hover:bg-[#B8963B] transition"
            >
              Subscribe Now
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} KALAVIES Jewellery. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-white/70">
            <span>Designed &amp; Developed by</span>
            <a
              href="https://deveraa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#C9A84C] hover:text-[#E0CB82] transition underline underline-offset-4 decoration-[#C9A84C]/60"
            >
              Deveraa
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
