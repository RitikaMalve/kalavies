import Link from 'next/link'
import { Phone, Mail, MapPin, ShieldCheck, RefreshCw, Award, Truck } from 'lucide-react'

export default function StoreFooter() {
  return (
    <footer className="border-t border-[#E8E3DC] bg-[#1A1A1A] text-white">
      {/* Guarantees bar */}
      <div className="border-b border-white/10 bg-[#242424] py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Award className="w-6 h-6 text-[#C9A84C]" />
            <h4 className="text-sm font-semibold tracking-wide">100% Certified Purity</h4>
            <p className="text-xs text-white/60">Authentic oxidised silver & premium craftsmanship</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Truck className="w-6 h-6 text-[#C9A84C]" />
            <h4 className="text-sm font-semibold tracking-wide">Free Express Shipping</h4>
            <p className="text-xs text-white/60">On all prepaid & COD orders above ₹499</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 text-[#C9A84C]" />
            <h4 className="text-sm font-semibold tracking-wide">7-Day Easy Returns</h4>
            <p className="text-xs text-white/60">Hassle-free replacement guarantee</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#C9A84C]" />
            <h4 className="text-sm font-semibold tracking-wide">Secure Checkout</h4>
            <p className="text-xs text-white/60">UPI, Cards, Netbanking & Cash on Delivery</p>
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
            Curating exquisite antique oxidised silver, handcrafted temple jewellery, and modern party statements celebrating Indian heritage with contemporary finesse.
          </p>
          <div className="text-xs text-white/70 space-y-1.5">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#C9A84C]" /> +91 98765 43210
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#C9A84C]" /> hello@kalavies.com
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" /> Bangalore, Karnataka, India
            </p>
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
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} KALAVIES Jewellery. All rights reserved.</p>
          <p className="text-white/40">Handcrafted with elegance in India</p>
        </div>
      </div>
    </footer>
  )
}
