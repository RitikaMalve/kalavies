'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, Eye, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    sku: string
    mrp: number
    sellingPrice: number
    totalStock: number
    material?: string | null
    isFeatured?: boolean
    isTrending?: boolean
    isBestseller?: boolean
    isNewArrival?: boolean
    images?: { url: string; isPrimary?: boolean }[]
    category?: { name: string }
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCart()
  const { isInWishlist, toggleItem } = useWishlist()

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    '/images/products/placeholder-1.jpg'

  const secondaryImage =
    product.images?.[1]?.url || primaryImage

  const isFavorited = isInWishlist(product.id)

  const discountPercent =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0

  const isOutOfStock = product.totalStock === 0

  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock || isAdding) return

    setIsAdding(true)
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      price: product.sellingPrice,
      mrp: product.mrp,
      quantity: 1,
      maxStock: product.totalStock,
      sku: product.sku,
      image: primaryImage,
    })
    setTimeout(() => {
      setIsAdding(false)
      openCart()
    }, 250)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.sellingPrice,
      mrp: product.mrp,
      slug: product.slug,
      image: primaryImage,
    })
  }

  return (
    <div className="group relative rounded-xl sm:rounded-2xl border border-[#E8E3DC] bg-white overflow-hidden shadow-xs hover:shadow-lg hover:border-[#C9A84C]/60 transition-all duration-300 flex flex-col justify-between">
      {/* Image Container with Badges */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-[#FAF8F5] overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges on Top-Left */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="rounded-full bg-[#C9A84C] px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white uppercase shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.isBestseller && (
            <span className="rounded-full bg-purple-700 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white uppercase shadow-xs">
              Bestseller
            </span>
          )}
          {product.isTrending && (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white uppercase shadow-xs">
              Trending
            </span>
          )}
        </div>

        {/* Wishlist Button on Top-Right */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-all shadow-xs active:scale-90 z-10 ${
            isFavorited
              ? 'bg-red-50 text-red-600'
              : 'bg-white/90 text-[#2D2D2D] hover:bg-white hover:text-red-600'
          }`}
          title="Wishlist"
          aria-label="Wishlist"
        >
          <Heart size={15} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="rounded-full bg-[#1A1A1A] px-3 py-1 text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            {product.category && (
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] truncate">
                {product.category.name}
              </span>
            )}
            {product.totalStock > 0 && product.totalStock <= 3 && (
              <span className="shrink-0 text-[9px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Only {product.totalStock} left
              </span>
            )}
          </div>
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-semibold text-xs sm:text-sm text-[#1A1A1A] line-clamp-2 hover:text-[#C9A84C] transition leading-snug">
              {product.name}
            </h3>
          </Link>

          {product.material && (
            <p className="text-[11px] text-[#6B6B6B] mt-1 line-clamp-1">{product.material}</p>
          )}
        </div>

        <div className="pt-2.5 sm:pt-3 border-t border-[#E8E3DC]/70 mt-2.5 sm:mt-3">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-bold text-sm sm:text-base text-[#1A1A1A]">
              {formatPrice(product.sellingPrice)}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-[11px] sm:text-xs text-[#6B6B6B] line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C9A84C] py-2 text-xs font-bold text-white shadow-xs hover:bg-[#B8963B] transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            {isAdding ? <Loader2 size={13} className="animate-spin text-white" /> : <ShoppingBag size={13} />}
            <span>{isAdding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
