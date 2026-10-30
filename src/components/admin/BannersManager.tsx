'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Eye,
  EyeOff,
  Layout,
  Upload,
  Camera,
  Crop,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react'
import { uploadProductImage } from '@/lib/storageHelper'
import ImageCropModal from './ImageCropModal'

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

  // Image Upload & Crop State
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [cropModal, setCropModal] = useState<{
    isOpen: boolean
    imageSrc: string
    fileName: string
  }>({
    isOpen: false,
    imageSrc: '',
    fileName: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openCreateBanner = () => {
    setEditingBanner(null)
    setTitle('')
    setSubtitle('')
    setDescription('')
    setImageUrl('')
    setLinkUrl('/products')
    setButtonText('Shop Collection')
    setSortOrder(banners.length + 1)
    setIsActive(true)
    setUploadError('')
    setModalOpen(true)
  }

  const openEditBanner = (b: Banner) => {
    setEditingBanner(b)
    setTitle(b.title || '')
    setSubtitle(b.subtitle || '')
    setDescription(b.description || '')
    setImageUrl(b.imageUrl || '')
    setLinkUrl(b.linkUrl || '/products')
    setButtonText(b.buttonText || 'Shop Collection')
    setSortOrder(b.sortOrder || 1)
    setIsActive(b.isActive)
    setUploadError('')
    setModalOpen(true)
  }

  // Handle direct file selection from computer
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    const reader = new FileReader()
    reader.onload = () => {
      setCropModal({
        isOpen: true,
        imageSrc: reader.result as string,
        fileName: file.name,
      })
    }
    reader.readAsDataURL(file)
    if (e.target) e.target.value = ''
  }

  // Handle Crop Apply -> Upload to Server / Firebase
  const handleCropApply = async (croppedBlob: Blob) => {
    setCropModal((prev) => ({ ...prev, isOpen: false }))
    setUploadingImage(true)
    setUploadError('')

    try {
      const file = new File([croppedBlob], `banner-${Date.now()}.webp`, {
        type: 'image/webp',
      })
      const result = await uploadProductImage(file, 'banners')
      setImageUrl(result.url)
    } catch (err: any) {
      setUploadError(err.message || 'Banner upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  // Direct fast upload without cropping
  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setUploadError('')
    try {
      const result = await uploadProductImage(file, 'banners')
      setImageUrl(result.url)
    } catch (err: any) {
      setUploadError(err.message || 'Direct upload failed')
    } finally {
      setUploadingImage(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl) {
      setUploadError('Please upload a banner image or provide an image URL')
      return
    }

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
              Upload promotional banners directly from your device, configure headline offers, and button links.
            </p>
          </div>
          <button
            onClick={openCreateBanner}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition cursor-pointer"
          >
            <Plus size={18} /> Add New Banner Slide
          </button>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-[#E8E3DC] bg-white overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition"
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
                  <span className="text-xs font-medium text-[#6B6B6B] truncate max-w-[150px]">
                    CTA: {b.buttonText || 'Shop Now'} →
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditBanner(b)}
                      className="rounded p-1.5 text-[#6B6B6B] hover:text-[#C9A84C] hover:bg-amber-50 transition cursor-pointer"
                      title="Edit Banner & Change Image"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      className="rounded p-1.5 text-[#6B6B6B] hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Delete Banner"
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
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
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

      {/* Create / Edit Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#E8E3DC] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DC]">
              <div className="flex items-center gap-2">
                <Camera size={20} className="text-[#C9A84C]" />
                <h3 className="text-lg font-bold text-[#2D2D2D]">
                  {editingBanner ? 'Edit Promotional Banner' : 'Add New Promotional Banner'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#6B6B6B] hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {uploadError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleBannerSubmit} className="mt-4 space-y-5">
              {/* DIRECT BANNER IMAGE UPLOAD SECTION (SAME AS PRODUCT ADD) */}
              <div className="space-y-2 rounded-xl border-2 border-dashed border-[#E8E3DC] p-4 bg-[#FAF8F5]/60">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                    Banner Image *
                  </label>
                  {uploadingImage && (
                    <span className="text-xs text-[#C9A84C] font-semibold flex items-center gap-1.5">
                      <Loader2 size={14} className="animate-spin" /> Uploading & compressing...
                    </span>
                  )}
                </div>

                {/* Image Preview & Upload Controls */}
                {imageUrl ? (
                  <div className="space-y-3">
                    <div className="relative aspect-[16/9] w-full rounded-xl border border-[#C9A84C] overflow-hidden bg-white shadow-sm">
                      <img
                        src={imageUrl}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Upload size={12} /> Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:text-red-300 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-green-700 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} /> Banner photo uploaded successfully
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#C9A84C]/50 rounded-xl bg-white hover:bg-amber-50/40 transition cursor-pointer text-center group"
                  >
                    <div className="h-12 w-12 rounded-full bg-amber-50 text-[#C9A84C] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                      <Upload size={22} />
                    </div>
                    <p className="text-xs font-bold text-[#2D2D2D]">
                      Click to upload banner directly from computer
                    </p>
                    <p className="text-[11px] text-[#8C827A] mt-1">
                      PNG, JPG, WEBP • Auto-compressed • Crop or fit to 16:9 banner
                    </p>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Optional manual URL toggle */}
                <details className="text-xs pt-1">
                  <summary className="cursor-pointer text-[#8C827A] hover:text-[#2D2D2D] font-medium">
                    Or paste an image URL manually
                  </summary>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="https://example.com/banner.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-xs focus:border-[#C9A84C] focus:outline-none bg-white font-mono"
                    />
                  </div>
                </details>
              </div>

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
                  placeholder="Festive Season Exclusive — Free Delivery Above ₹699"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="Handcrafted silver tones with antique dark finish."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                    placeholder="/products"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
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
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[#6B6B6B] hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="rounded-lg bg-[#C9A84C] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Banner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Crop & Fit Modal */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        imageSrc={cropModal.imageSrc}
        fileName={cropModal.fileName}
        onClose={() => setCropModal((prev) => ({ ...prev, isOpen: false }))}
        onApply={handleCropApply}
      />
    </div>
  )
}
