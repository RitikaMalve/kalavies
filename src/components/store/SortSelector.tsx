'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function SortSelector({ currentSort }: { currentSort: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', newSort)
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
      className="rounded-lg border border-[#E8E3DC] bg-white px-3 py-1.5 text-xs font-semibold text-[#2D2D2D] focus:border-[#C9A84C] focus:outline-none"
    >
      <option value="newest">Newest Arrivals</option>
      <option value="popularity">Most Popular / Bestselling</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  )
}
