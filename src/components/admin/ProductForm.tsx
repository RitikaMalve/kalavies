'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react'

interface Category {
  id: string
  name: string
  children?: { id: string; name: string }[]
}

interface ProductFormProps {
  initialData?: any
  categories: Category[]
  isEditing?: boolean
}

export default function ProductForm({ initialData, categories, isEditing }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    sku: initialData?.sku || '',
    categoryId: initialData?.categoryId || (categories[0]?.children?.[0]?.id || categories[0]?.id || ''),
    collectionName: initialData?.collectionName || '',
    brandName: initialData?.brandName || 'KALAVIES',
    description: initialData?.description || '',
    detailedContent: initialData?.detailedContent || '',
    material: initialData?.material || 'Oxidised Silver',
    colour: initialData?.colour || 'Silver',
    style: initialData?.style || 'Traditional',
    weight: initialData?.weight || '25g',
    mrp: initialData?.mrp || 1299,
    sellingPrice: initialData?.sellingPrice || 899,
    costPrice: initialData?.costPrice || 450,
    totalStock: initialData?.totalStock || 25,
    lowStockThreshold: initialData?.lowStockThreshold || 5,
    status: initialData?.status || 'PUBLISHED',
    isFeatured: initialData?.isFeatured || false,
    isTrending: initialData?.isTrending || false,
    isBestseller: initialData?.isBestseller || false,
    isNewArrival: initialData?.isNewArrival || true,
    searchTags: initialData?.searchTags || '',
    seoTitle: initialData?.seoTitle || '',
    metaDescription: initialData?.metaDescription || '',
  })

  // Images state
  const [images, setImages] = useState<string[]>(
    initialData?.images?.map((img: any) => img.url) || ['/images/products/placeholder-1.jpg']
  )
  const [newImageUrl, setNewImageUrl] = useState('')

  // Variants state
  const [variants, setVariants] = useState<any[]>(
    initialData?.variants || []
  )

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : slug,
    }))
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const data = new FormData()
      data.append('file', file)
      data.append('folder', 'products')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Upload failed')

      setImages((prev) => [...prev, result.url])
    } catch (err: any) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        name: 'Standard',
        sku: `${formData.sku || 'KLV'}-V${variants.length + 1}`,
        size: 'Free Size',
        color: formData.colour,
        price: formData.sellingPrice,
        mrp: formData.mrp,
        stock: 10,
      },
    ])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const discountPercent =
    formData.mrp > 0
      ? Math.max(0, Math.round(((formData.mrp - formData.sellingPrice) / formData.mrp) * 100))
      : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        mrp: Number(formData.mrp),
        sellingPrice: Number(formData.sellingPrice),
        costPrice: Number(formData.costPrice),
        totalStock: Number(formData.totalStock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        discountPercent,
        images,
        variants,
      }

      const url = isEditing
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save product')

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-lg border border-[#E8E3DC] bg-white p-2 text-[#6B6B6B] hover:bg-[#FAF8F5] transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            {isEditing ? `Edit: ${initialData.name}` : 'Create New Product'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
        >
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - 2 Cols Wide */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-[#2D2D2D]">Product Details</h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Antique Silver Oxidised Jhumka Earrings"
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  SKU Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="KLV-OXD-001"
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Short Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Handcrafted ethnic oxidised jewellery with intricate detailing..."
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Detailed Product Information & Care
              </label>
              <textarea
                rows={5}
                value={formData.detailedContent}
                onChange={(e) => setFormData({ ...formData, detailedContent: e.target.value })}
                placeholder="Product Specifications, Styling Tips, Care instructions (Keep away from water and perfume)..."
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing & Cost */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#2D2D2D]">Pricing & Margins</h3>
              {discountPercent > 0 && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  MRP (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none font-semibold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Cost Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none text-[#6B6B6B]"
                />
              </div>
            </div>
          </div>

          {/* Product Attributes */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-[#2D2D2D]">Jewellery Attributes</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Material
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="Oxidised Silver"
                  className="w-full rounded-lg border border-[#E8E3DC] px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Colour
                </label>
                <input
                  type="text"
                  value={formData.colour}
                  onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                  placeholder="Antique Silver"
                  className="w-full rounded-lg border border-[#E8E3DC] px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Style
                </label>
                <input
                  type="text"
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  placeholder="Bohemian / Ethnic"
                  className="w-full rounded-lg border border-[#E8E3DC] px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Weight
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="25 grams"
                  className="w-full rounded-lg border border-[#E8E3DC] px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Product Images Gallery */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-[#2D2D2D]">Product Imagery</h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter image URL (e.g. /images/products/placeholder-1.jpg or web url)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
              <button
                type="button"
                onClick={addImage}
                className="rounded-lg bg-[#2D2D2D] px-4 py-2 text-sm font-semibold text-white hover:bg-black transition shrink-0"
              >
                Add URL
              </button>
              <label className="rounded-lg border border-[#C9A84C] bg-amber-50 px-4 py-2 text-sm font-semibold text-[#C9A84C] hover:bg-amber-100 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                <Upload size={14} />
                <span>{uploading ? 'Uploading to Firebase...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg border border-[#E8E3DC] overflow-hidden bg-[#FAF8F5] aspect-square flex items-center justify-center"
                >
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 rounded bg-[#C9A84C] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Organization & Status */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-[#2D2D2D]">Publishing Status</h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3.5 py-2 text-sm font-medium focus:border-[#C9A84C] focus:outline-none"
              >
                <option value="PUBLISHED">Published (Live in Store)</option>
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E8E3DC]">
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-2">
                Merchandising Badges
              </label>

              <label className="flex items-center gap-2 text-sm text-[#2D2D2D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                Featured Collection
              </label>

              <label className="flex items-center gap-2 text-sm text-[#2D2D2D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="rounded text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                Trending Item
              </label>

              <label className="flex items-center gap-2 text-sm text-[#2D2D2D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="rounded text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                Bestseller
              </label>

              <label className="flex items-center gap-2 text-sm text-[#2D2D2D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="rounded text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                New Arrival
              </label>
            </div>
          </div>

          {/* Category Assignment */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-[#2D2D2D]">Category Selection</h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              >
                {categories.map((c) => (
                  <optgroup key={c.id} label={c.name}>
                    <option value={c.id}>{c.name} (Main)</option>
                    {c.children?.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        └ {sub.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Collection
              </label>
              <input
                type="text"
                value={formData.collectionName}
                onChange={(e) => setFormData({ ...formData, collectionName: e.target.value })}
                placeholder="e.g. Royal Rajputana, Festive Glow"
                className="w-full rounded-lg border border-[#E8E3DC] px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>
          </div>

          {/* Stock & Inventory */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-[#2D2D2D]">Inventory & Stock</h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Total Available Units *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.totalStock}
                onChange={(e) => setFormData({ ...formData, totalStock: Number(e.target.value) })}
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-[#6B6B6B]">
                Triggers dashboard alert when quantity drops to this number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
