'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Flame, Star, Sparkles, Save, Plus, Trash2, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface TrendingSettings {
  id: string
  mode: string
  autoWindowDays: number
  maxDisplayCount: number
  excludeOutOfStock: boolean
}

export default function TrendingManager({
  initialSettings,
  initialTrending,
  allProducts,
}: {
  initialSettings: TrendingSettings
  initialTrending: any[]
  allProducts: any[]
}) {
  const router = useRouter()
  const [mode, setMode] = useState(initialSettings.mode)
  const [autoWindowDays, setAutoWindowDays] = useState(initialSettings.autoWindowDays)
  const [maxDisplayCount, setMaxDisplayCount] = useState(initialSettings.maxDisplayCount)
  const [excludeOutOfStock, setExcludeOutOfStock] = useState(initialSettings.excludeOutOfStock)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // Section quick filter
  const [selectedSection, setSelectedSection] = useState<'TRENDING' | 'BESTSELLER' | 'FEATURED' | 'NEW_ARRIVAL'>('TRENDING')
  const [selectedProductId, setSelectedProductId] = useState(allProducts[0]?.id || '')

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const res = await fetch('/api/admin/trending/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          autoWindowDays: Number(autoWindowDays),
          maxDisplayCount: Number(maxDisplayCount),
          excludeOutOfStock,
        }),
      })

      if (!res.ok) throw new Error('Failed to update')
      setMsg('Algorithm and merchandising rules saved!')
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProductBadge = async (productId: string, badge: 'isTrending' | 'isBestseller' | 'isFeatured' | 'isNewArrival', currentVal: boolean) => {
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [badge]: !currentVal }),
      })
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      alert('Failed to update badge')
    }
  }

  const filteredItems = initialTrending.filter((t) => t.section === selectedSection)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
          Trending, Bestsellers & Merchandising
        </h1>
        <p className="text-sm text-[#6B6B6B]">
          Configure automated analytics-driven ranking, manual product pinning, or hybrid merchandising.
        </p>
      </div>

      {msg && (
        <div className="rounded-lg bg-green-50 p-3 text-xs font-medium text-green-700">
          {msg}
        </div>
      )}

      {/* Algorithm Mode Settings Card */}
      <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-lg text-[#2D2D2D] mb-4">
          Merchandising Ranking Mode
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label
              className={`flex flex-col p-4 rounded-xl border cursor-pointer transition ${
                mode === 'HYBRID'
                  ? 'border-[#C9A84C] bg-amber-50/30 ring-1 ring-[#C9A84C]'
                  : 'border-[#E8E3DC] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2D2D2D]">Hybrid Mode (Recommended)</span>
                <input
                  type="radio"
                  name="mode"
                  value="HYBRID"
                  checked={mode === 'HYBRID'}
                  onChange={(e) => setMode(e.target.value)}
                  className="text-[#C9A84C]"
                />
              </div>
              <p className="mt-2 text-xs text-[#6B6B6B]">
                Shows manually pinned products first, followed by automatically ranked items based on real sales.
              </p>
            </label>

            <label
              className={`flex flex-col p-4 rounded-xl border cursor-pointer transition ${
                mode === 'AUTOMATIC'
                  ? 'border-[#C9A84C] bg-amber-50/30 ring-1 ring-[#C9A84C]'
                  : 'border-[#E8E3DC] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2D2D2D]">Pure Automatic</span>
                <input
                  type="radio"
                  name="mode"
                  value="AUTOMATIC"
                  checked={mode === 'AUTOMATIC'}
                  onChange={(e) => setMode(e.target.value)}
                  className="text-[#C9A84C]"
                />
              </div>
              <p className="mt-2 text-xs text-[#6B6B6B]">
                Ranks strictly by customer purchase volumes and view count within the selected time window.
              </p>
            </label>

            <label
              className={`flex flex-col p-4 rounded-xl border cursor-pointer transition ${
                mode === 'MANUAL'
                  ? 'border-[#C9A84C] bg-amber-50/30 ring-1 ring-[#C9A84C]'
                  : 'border-[#E8E3DC] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2D2D2D]">Pure Manual</span>
                <input
                  type="radio"
                  name="mode"
                  value="MANUAL"
                  checked={mode === 'MANUAL'}
                  onChange={(e) => setMode(e.target.value)}
                  className="text-[#C9A84C]"
                />
              </div>
              <p className="mt-2 text-xs text-[#6B6B6B]">
                Only showcases products explicitly tagged with the merchandising badge by the admin.
              </p>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Auto Ranking Sales Window (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={autoWindowDays}
                onChange={(e) => setAutoWindowDays(Number(e.target.value))}
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Max Display Count per Section
              </label>
              <input
                type="number"
                min="4"
                max="24"
                value={maxDisplayCount}
                onChange={(e) => setMaxDisplayCount(Number(e.target.value))}
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-sm text-[#2D2D2D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeOutOfStock}
                  onChange={(e) => setExcludeOutOfStock(e.target.checked)}
                  className="rounded text-[#C9A84C]"
                />
                Exclude Out-of-Stock items
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
            >
              <Save size={16} /> Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Merchandising Quick-Toggles Table */}
      <div className="rounded-xl border border-[#E8E3DC] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E8E3DC] bg-[#FAF8F5] px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-semibold text-[#2D2D2D]">
            Catalogue Merchandising Badges ({allProducts.length} Live Products)
          </h3>
          <span className="text-xs text-[#6B6B6B]">
            Click any badge to toggle its visibility across the storefront.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-[#E8E3DC] bg-[#FAF8F5] text-xs font-semibold uppercase text-[#6B6B6B]">
              <tr>
                <th className="px-6 py-3.5">Jewellery Name & SKU</th>
                <th className="px-4 py-3.5 text-center">Trending</th>
                <th className="px-4 py-3.5 text-center">Bestseller</th>
                <th className="px-4 py-3.5 text-center">Featured</th>
                <th className="px-4 py-3.5 text-center">New Arrival</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3DC]">
              {allProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition">
                  <td className="px-6 py-3.5">
                    <div className="font-medium text-[#2D2D2D]">{p.name}</div>
                    <div className="text-xs text-[#6B6B6B]">SKU: {p.sku}</div>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleToggleProductBadge(p.id, 'isTrending', p.isTrending)}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                        p.isTrending
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {p.isTrending ? '🔥 Trending' : '+ Add'}
                    </button>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleToggleProductBadge(p.id, 'isBestseller', p.isBestseller)}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                        p.isBestseller
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {p.isBestseller ? '⭐ Bestseller' : '+ Add'}
                    </button>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleToggleProductBadge(p.id, 'isFeatured', p.isFeatured)}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                        p.isFeatured
                          ? 'bg-amber-100 text-[#C9A84C] hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {p.isFeatured ? '✨ Featured' : '+ Add'}
                    </button>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleToggleProductBadge(p.id, 'isNewArrival', p.isNewArrival)}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                        p.isNewArrival
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {p.isNewArrival ? '🌿 New Arrival' : '+ Add'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
