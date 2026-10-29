'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Plus, Trash2, Edit2, X, Save, Eye, EyeOff, Layout } from 'lucide-react'

interface Banner {
  id: string
  title?: string | null
  subtitle?: string | null
  description?: string | null
  imageUrl: string
  linkUrl?: string | null
  buttonText?: string | null
  sortOrder: number
  isActive: boolean
}

interface Section {
  id: string
  title: string
  type: string
  subtitle?: string | null
  sortOrder: number
  isActive: boolean
}

export default function BannersManager({
  initialBanners,
  initialSections,
}: {
  initialBanners: Banner[]
  initialSections: Section[]
}) {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(false)

  // Form State for Banner
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)

  const openCreateBanner = () => {
    setEditingBanner(null)
    setTitle('')
    setSubtitle('')
    setDescription('')
    setImageUrl('/images/banners/banner-1.jpg')
    setLinkUrl('/products')
    setButtonText('Shop Collection')
    setSortOrder(banners.length + 1)
    setIsActive(true)
    setModalOpen(true)
  }

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        title,
        subtitle,
        description,
        imageUrl,
        linkUrl,
        buttonText,
        sortOrder: Number(sortOrder),
        isActive,
      }

      const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners'
      const method = editingBanner ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save banner')

      setModalOpen(false)
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return
    try {
      await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      alert('Failed to delete')
    }
  }

  const handleToggleSection = async (sectionId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      alert('Failed to toggle section')
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Management */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
              Homepage Banners & Layout
            </h1>
            <p className="text-sm text-[#6B6B6B]">
              Update promotional slider slides, festival offers, headings, and CTA button links.
            </p>
          </div>
          <button
            onClick={openCreateBanner}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition"
          >
            <Plus size={18} /> Add New Banner Slide
          </button>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-[#E8E3DC] bg-white overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] bg-[#FAF8F5] overflow-hidden">
                <img
                  src={b.imageUrl}
                  alt={b.title || 'Banner'}
                  className="w-full h-full object-cover"
                />
                {!b.isActive && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="rounded bg-red-600 px-3 py-1 text-xs font-bold text-white uppercase">
                      Disabled
                    </span>
                  </div>
                )}
                <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Order: #{b.sortOrder}
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-[#2D2D2D] line-clamp-1">{b.title || 'Untitled Banner'}</h4>
                  {b.subtitle && (
                    <p className="text-xs text-[#C9A84C] font-semibold">{b.subtitle}</p>
                  )}
                  {b.description && (
                    <p className="text-xs text-[#6B6B6B] line-clamp-2 mt-1">{b.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E8E3DC]">
                  <span className="text-xs font-medium text-[#6B6B6B]">
                    CTA: {b.buttonText || 'Shop Now'} →
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      className="rounded p-1 text-[#6B6B6B] hover:text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Homepage Sections Ordering and Visibility */}
      <div className="rounded-xl border border-[#E8E3DC] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E8E3DC] bg-[#FAF8F5] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="text-[#C9A84C]" size={20} />
            <h3 className="font-semibold text-[#2D2D2D]">Homepage Dynamic Sections Controls</h3>
          </div>
          <span className="text-xs text-[#6B6B6B]">
            Enable or disable sections without changing any code.
          </span>
        </div>

        <div className="divide-y divide-[#E8E3DC]">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#FAF8F5]/80 transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#2D2D2D]">{s.title}</span>
                  <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-mono font-bold text-[#C9A84C]">
                    {s.type}
                  </span>
                </div>
                {s.subtitle && <p className="text-xs text-[#6B6B6B] mt-0.5">{s.subtitle}</p>}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggleSection(s.id, s.isActive)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    s.isActive
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.isActive ? (
                    <>
                      <Eye size={13} /> Active on Storefront
                    </>
                  ) : (
                    <>
                      <EyeOff size={13} /> Hidden from Storefront
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#E8E3DC]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DC]">
              <h3 className="text-lg font-bold text-[#2D2D2D]">Add Promotional Banner</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-[#6B6B6B] hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Main Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Oxidised Collection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Subtitle / Promo Tag
                </label>
                <input
                  type="text"
                  placeholder="Festive Season Exclusive — Flat 20% Off"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Image URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="/images/banners/banner-1.jpg or external url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="Shop Now"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Target Link
                  </label>
                  <input
                    type="text"
                    placeholder="/products?category=oxidised-jewellery"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-sm text-[#2D2D2D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-[#C9A84C]"
                    />
                    Active Immediately
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E3DC]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[#6B6B6B] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#C9A84C] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
