'use client'

import Link from 'next/link'
import { Heart, ShoppingBag, Trash2, ArrowRight, ChevronRight } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import StoreLayoutClient from '@/components/store/StoreLayoutClient'

export default function WishlistPage() {
  const { items, removeItem } = useWishlist()
  const { addItem, openCart } = useCart()

  const handleMoveToBag = (item: any) => {
    addItem({
      id: `${item.productId}-default`,
      productId: item.productId,
      name: item.name,
      price: item.price,
      mrp: item.mrp,
      quantity: 1,
      maxStock: 50,
      sku: 'KLV-WISH',
      image: item.image,
    })
    removeItem(item.productId)
    openCart()
  }

  return (
    <StoreLayoutClient>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-6">
          <Link href="/" className="hover:text-[#C9A84C]">Home</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-[#2D2D2D]">Saved Wishlist</span>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] mb-8"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          My Jewellery Wishlist ({items.length})
        </h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#E8E3DC] bg-white p-16 text-center shadow-sm">
            <div className="h-20 w-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Heart size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#2D2D2D]">Your wishlist is currently empty</h2>
            <p className="text-xs text-[#6B6B6B] mt-1 mb-6 max-w-sm mx-auto">
              Save your favourite jewellery designs here so you can easily review and order them later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-6 py-3 text-xs font-bold text-white shadow hover:bg-[#B8963B] transition"
            >
              Explore Catalogue <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-[#E8E3DC] bg-white overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-[#FAF8F5] overflow-hidden">
                  <img
                    src={item.image || '/images/products/placeholder-1.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/90 text-[#6B6B6B] hover:text-red-600 flex items-center justify-center shadow transition"
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-[#2D2D2D] line-clamp-1">{item.name}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-bold text-base text-[#2D2D2D]">
                        {formatPrice(item.price)}
                      </span>
                      {item.mrp > item.price && (
                        <span className="text-xs text-[#6B6B6B] line-through">
                          {formatPrice(item.mrp)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMoveToBag(item)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2D2D2D] py-2 text-xs font-semibold text-white shadow hover:bg-[#C9A84C] transition"
                  >
                    <ShoppingBag size={14} /> Move to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreLayoutClient>
  )
}
