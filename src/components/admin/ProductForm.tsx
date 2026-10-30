'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Percent,
} from 'lucide-react'
import { uploadProductImage } from '@/lib/storageHelper'

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

// Helper to generate SKU based on title keywords
function generateSkuFromTitle(title: string): string {
  if (!title.trim()) return ''
  const t = title.toLowerCase()
  const parts: string[] = ['KLV']

  // Category & style detection (anti-oxi, oxidised, kundan, temple, etc.)
  if (
    t.includes('anti-oxi') ||
    t.includes('anti oxi') ||
    t.includes('antioxi') ||
    t.includes('oxid') ||
    t.includes('oxd')
  ) {
    parts.push('AOX')
  } else if (t.includes('kundan')) {
    parts.push('KDN')
  } else if (t.includes('temple')) {
    parts.push('TMP')
  } else if (t.includes('polki')) {
    parts.push('PLK')
  } else if (t.includes('meenakari')) {
    parts.push('MNK')
  } else if (t.includes('pearl') || t.includes('moti')) {
    parts.push('PRL')
  }

  // Item type detection
  if (t.includes('jhumk')) {
    parts.push('JHM')
  } else if (t.includes('chandbali')) {
    parts.push('CHB')
  } else if (t.includes('earring') || t.includes('stud') || t.includes('bali') || t.includes('drop')) {
    parts.push('EAR')
  } else if (t.includes('choker') || t.includes('hasli')) {
    parts.push('CHK')
  } else if (t.includes('necklace') || t.includes('haar') || t.includes('chain')) {
    parts.push('NCK')
  } else if (t.includes('bangle') || t.includes('kada') || t.includes('bracelet')) {
    parts.push('BGL')
  } else if (t.includes('ring') || t.includes('anguthi')) {
    parts.push('RNG')
  } else if (t.includes('nath') || t.includes('nose')) {
    parts.push('NTH')
  } else if (t.includes('payal') || t.includes('anklet')) {
    parts.push('PYL')
  } else if (t.includes('pendant') || t.includes('locket')) {
    parts.push('PND')
  } else if (t.includes('set') || t.includes('combo')) {
    parts.push('SET')
  }

  // If no specific keyword matched, extract initials from title words
  if (parts.length === 1) {
    const cleanWords = t.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean)
    const initials = cleanWords.slice(0, 2).map((w) => w.slice(0, 3).toUpperCase()).join('-')
    if (initials) parts.push(initials)
    else parts.push('PRD')
  }

  // Suffix: random 3-digit number for uniqueness
  const randomNum = Math.floor(100 + Math.random() * 900)
  return `${parts.join('-')}-${randomNum}`
}

export default function ProductForm({ initialData, categories, isEditing }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successCreated, setSuccessCreated] = useState<{
    name: string
    slug: string
    sku: string
    sellingPrice: number
    mrp: number
  } | null>(null)

  const defaultCategoryId =
    initialData?.categoryId || categories[0]?.children?.[0]?.id || categories[0]?.id || ''

  const initialDiscount =
    initialData?.mrp && initialData?.sellingPrice && initialData.mrp > initialData.sellingPrice
      ? Math.round(((initialData.mrp - initialData.sellingPrice) / initialData.mrp) * 100)
      : 20

  const [discountPercent, setDiscountPercent] = useState<number>(initialDiscount)
  const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(Boolean(initialData?.sku))

  // SKU uniqueness check state
  const [skuCheck, setSkuCheck] = useState<{
    status: 'idle' | 'checking' | 'available' | 'taken'
    message: string
    suggested: string
  }>({
    status: 'idle',
    message: '',
    suggested: '',
  })

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    sku: initialData?.sku || '',
    categoryId: defaultCategoryId,
    collectionName: initialData?.collectionName || '',
    brandName: initialData?.brandName || 'KALAVIES',
    description: initialData?.description || '',
    detailedContent: initialData?.detailedContent || '',
    material: initialData?.material || 'Oxidised Silver',
    colour: initialData?.colour || 'Silver',
    style: initialData?.style || 'Traditional',
    weight: initialData?.weight || '25g',
    mrp: initialData?.mrp ?? 0,
    sellingPrice: initialData?.sellingPrice ?? 0,
    costPrice: initialData?.costPrice ?? 0,
    totalStock: initialData?.totalStock ?? 25,
    lowStockThreshold: initialData?.lowStockThreshold ?? 5,
    status: initialData?.status || 'PUBLISHED',
    isFeatured: initialData?.isFeatured || false,
    isTrending: initialData?.isTrending || false,
    isBestseller: initialData?.isBestseller || false,
    isNewArrival: initialData?.isNewArrival ?? true,
    searchTags: initialData?.searchTags || '',
    seoTitle: initialData?.seoTitle || '',
    metaDescription: initialData?.metaDescription || '',
  })

  // Images state
  const [images, setImages] = useState<string[]>(
    initialData?.images?.map((img: any) => img.url) || []
  )
  const [newImageUrl, setNewImageUrl] = useState('')

  // Variants state
  const [variants, setVariants] = useState<any[]>(initialData?.variants || [])
  const [uploading, setUploading] = useState(false)

  // Title change -> auto slug & auto SKU (if not manually edited)
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')

    let newSku = formData.sku
    if (!isEditing && !isSkuManuallyEdited && name.trim().length > 2) {
      newSku = generateSkuFromTitle(name)
    }

    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : slug,
      sku: newSku,
    }))
  }

  // Regenerate SKU button
  const handleRegenerateSku = () => {
    if (!formData.name.trim()) return
    const generated = generateSkuFromTitle(formData.name)
    setIsSkuManuallyEdited(false)
    setFormData((prev) => ({ ...prev, sku: generated }))
  }

  // Debounced check for SKU uniqueness
  useEffect(() => {
    const trimmed = formData.sku.trim().toUpperCase()
    if (!trimmed) {
      setSkuCheck({ status: 'idle', message: '', suggested: '' })
      return
    }

    setSkuCheck((prev) => ({
      ...prev,
      status: 'checking',
      message: 'Checking database...',
    }))

    const timer = setTimeout(async () => {
      try {
        const queryParams = new URLSearchParams({ sku: trimmed })
        if (isEditing && initialData?.id) {
          queryParams.set('excludeId', initialData.id)
        }
        const res = await fetch(`/api/admin/check-sku?${queryParams.toString()}`)
        const data = await res.json()

        if (data.available) {
          setSkuCheck({
            status: 'available',
            message: '✓ SKU is available',
            suggested: '',
          })
        } else {
          setSkuCheck({
            status: 'taken',
            message: data.message || `SKU "${trimmed}" is already in use!`,
            suggested: data.suggestedSku || '',
          })
        }
      } catch {
        setSkuCheck({ status: 'idle', message: '', suggested: '' })
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [formData.sku, isEditing, initialData?.id])

  // ==========================================
  // PRICING CALCULATION LOGIC
  // 1. Cost Price -> Auto double Selling Price (costPrice * 2)
  // 2. Selling Price + Discount Percent -> Auto calculate MRP
  // ==========================================

  // When Cost Price is changed
  const handleCostPriceChange = (val: number) => {
    const cost = Math.max(0, val)
    // Double the rate automatically
    const autoSelling = cost > 0 ? Math.round(cost * 2) : 0
    // Calculate MRP based on selected discount percentage
    const autoMrp =
      discountPercent > 0 && autoSelling > 0
        ? Math.round(autoSelling / (1 - discountPercent / 100))
        : autoSelling

    setFormData((prev) => ({
      ...prev,
      costPrice: cost,
      sellingPrice: autoSelling,
      mrp: autoMrp,
    }))
  }

  // When Selling Price is changed directly (editable)
  const handleSellingPriceChange = (val: number) => {
    const selling = Math.max(0, val)
    const autoMrp =
      discountPercent > 0 && selling > 0
        ? Math.round(selling / (1 - discountPercent / 100))
        : selling

    setFormData((prev) => ({
      ...prev,
      sellingPrice: selling,
      mrp: autoMrp,
    }))
  }

  // When Discount Percentage is changed / clicked
  const handleDiscountPercentChange = (percent: number) => {
    const pct = Math.max(0, Math.min(90, percent))
    setDiscountPercent(pct)

    if (formData.sellingPrice > 0) {
      const computedMrp =
        pct > 0
          ? Math.round(formData.sellingPrice / (1 - pct / 100))
          : formData.sellingPrice

      setFormData((prev) => ({
        ...prev,
        mrp: computedMrp,
      }))
    }
  }

  // When MRP is changed directly (editable)
  const handleMrpChange = (val: number) => {
    const mrp = Math.max(0, val)
    setFormData((prev) => ({ ...prev, mrp }))

    // Update discount percentage indicator if MRP is higher than selling price
    if (mrp > formData.sellingPrice && formData.sellingPrice > 0) {
      const computedPct = Math.round(((mrp - formData.sellingPrice) / mrp) * 100)
      setDiscountPercent(computedPct)
    }
  }

  // Profit Margin calculation
  const profitMarginAmount = Math.max(0, formData.sellingPrice - formData.costPrice)
  const profitMarginPercent =
    formData.costPrice > 0
      ? Math.round(((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100)
      : formData.sellingPrice > 0
      ? 100
      : 0

  // Images handler
  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const uploadResult = await uploadProductImage(file, 'products')
      setImages((prev) => [...prev, uploadResult.url])
    } catch (err: any) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  // Variants handler
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

  // Form Reset Function (cleans all fields after successful add)
  const resetAllFields = () => {
    setFormData({
      name: '',
      slug: '',
      sku: '',
      categoryId: defaultCategoryId,
      collectionName: '',
      brandName: 'KALAVIES',
      description: '',
      detailedContent: '',
      material: 'Oxidised Silver',
      colour: 'Silver',
      style: 'Traditional',
      weight: '25g',
      mrp: 0,
      sellingPrice: 0,
      costPrice: 0,
      totalStock: 25,
      lowStockThreshold: 5,
      status: 'PUBLISHED',
      isFeatured: false,
      isTrending: false,
      isBestseller: false,
      isNewArrival: true,
      searchTags: '',
      seoTitle: '',
      metaDescription: '',
    })
    setImages([])
    setVariants([])
    setNewImageUrl('')
    setIsSkuManuallyEdited(false)
    setSkuCheck({ status: 'idle', message: '', suggested: '' })
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Prevent submission if SKU is already taken
    if (skuCheck.status === 'taken') {
      setError(`Cannot save: SKU "${formData.sku}" is already in use by another product.`)
      setLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        mrp: Number(formData.mrp),
        sellingPrice: Number(formData.sellingPrice),
        costPrice: Number(formData.costPrice),
        totalStock: Number(formData.totalStock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        discountPercent: Number(discountPercent),
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

      const text = await res.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Server response error (${res.status}): ${text.slice(0, 80)}`)
      }

      if (!res.ok) throw new Error(data.error || 'Failed to save product')

      if (isEditing) {
        // Redirect back when editing
        router.push('/admin/products')
        router.refresh()
      } else {
        // CLEAN ALL FIELDS after successfully adding product
        setSuccessCreated({
          name: payload.name,
          slug: payload.slug,
          sku: payload.sku,
          sellingPrice: payload.sellingPrice,
          mrp: payload.mrp,
        })
        resetAllFields()
        // Smoothly scroll to top so admin can see the confirmation and ready form
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-lg border border-[#E8E3DC] bg-white p-2 text-[#6B6B6B] hover:bg-[#FAF8F5] transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
              {isEditing ? `Edit: ${initialData.name}` : 'Add New Product'}
            </h1>
            <p className="text-xs text-[#6B6B6B]">
              {isEditing
                ? 'Update pricing, details, and stock'
                : 'Smart SKU generation, 2x cost pricing, and instant live catalog sync'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              type="button"
              onClick={resetAllFields}
              className="rounded-lg border border-[#E8E3DC] bg-white px-3.5 py-2 text-xs font-semibold text-[#6B6B6B] hover:bg-[#FAF8F5] transition"
            >
              Clear Form
            </button>
          )}
          <button
            type="submit"
            disabled={loading || skuCheck.status === 'taken'}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? 'Saving to Database...' : isEditing ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>

      {/* Success Banner when product is successfully added & form cleaned */}
      {successCreated && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-900 shadow-sm animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base text-emerald-900">
                  Product Added Successfully!
                </h3>
                <p className="text-sm text-emerald-800 mt-0.5">
                  <span className="font-semibold">"{successCreated.name}"</span> (SKU:{' '}
                  <span className="font-mono font-bold">{successCreated.sku}</span>) is now live
                  at ₹{successCreated.sellingPrice.toLocaleString('en-IN')}.
                </p>
                <p className="text-xs text-emerald-700 mt-1 font-medium">
                  ✓ All fields have been automatically cleaned. You can immediately enter the next product below.
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <a
                    href={`/products/${successCreated.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition"
                  >
                    View Live on Website <ExternalLink size={12} />
                  </a>
                  <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    View in Products List
                  </Link>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessCreated(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1 rounded"
            >
              ✕ Dismiss
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
          <div>{error}</div>
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
                placeholder="e.g. Anti-Oxidised Silver Jhumka Earrings"
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-[#8C827A]">
                Auto-generates URL Slug and SKU code (e.g. anti-oxi → KLV-AOX-...)
              </p>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B]">
                    SKU Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateSku}
                    disabled={!formData.name.trim()}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C9A84C] hover:text-[#B8963B] disabled:opacity-40"
                    title="Generate fresh SKU code from title"
                  >
                    <RefreshCw size={11} /> Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => {
                      setIsSkuManuallyEdited(true)
                      setFormData({ ...formData, sku: e.target.value.toUpperCase() })
                    }}
                    placeholder="KLV-AOX-001"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm uppercase font-mono tracking-wider focus:outline-none ${
                      skuCheck.status === 'taken'
                        ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500'
                        : skuCheck.status === 'available'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900 focus:border-emerald-500'
                        : 'border-[#E8E3DC] focus:border-[#C9A84C]'
                    }`}
                  />
                  {skuCheck.status === 'checking' && (
                    <span className="absolute right-3 top-3 text-[11px] text-[#8C827A] flex items-center gap-1">
                      <RefreshCw size={12} className="animate-spin" /> checking...
                    </span>
                  )}
                  {skuCheck.status === 'available' && (
                    <span className="absolute right-3 top-2.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Available
                    </span>
                  )}
                  {skuCheck.status === 'taken' && (
                    <span className="absolute right-3 top-2.5 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 flex items-center gap-1">
                      <AlertCircle size={11} /> Already In Use
                    </span>
                  )}
                </div>

                {/* SKU Status Message & Suggestion */}
                {skuCheck.status === 'taken' && (
                  <div className="mt-1.5 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                    <p>{skuCheck.message}</p>
                    {skuCheck.suggested && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, sku: skuCheck.suggested }))
                          setIsSkuManuallyEdited(true)
                        }}
                        className="mt-1 font-semibold text-red-900 underline hover:text-red-700"
                      >
                        Click to use suggested: {skuCheck.suggested}
                      </button>
                    )}
                  </div>
                )}
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
                rows={4}
                value={formData.detailedContent}
                onChange={(e) => setFormData({ ...formData, detailedContent: e.target.value })}
                placeholder="Product Specifications, Styling Tips, Care instructions (Keep away from water and perfume)..."
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing & Cost Auto-Calculations */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#C9A84C]" />
                <h3 className="text-lg font-semibold text-[#2D2D2D]">Pricing & Margins</h3>
              </div>
              <span className="text-xs text-[#8C827A] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E8E3DC]">
                Auto-Doubles Selling Price • Editable Anytime
              </span>
            </div>

            {/* Inputs Grid: Cost Price -> Selling Price -> MRP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Cost Price */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#E8E3DC]">
                <label className="block text-xs font-bold uppercase text-[#6B6B6B] mb-1">
                  1. Cost Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-[#8C827A]">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice || ''}
                    onChange={(e) => handleCostPriceChange(Number(e.target.value))}
                    placeholder="e.g. 400"
                    className="w-full rounded-lg border border-[#E8E3DC] bg-white pl-7 pr-3 py-2 text-base font-medium focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#8C827A]">
                  Your purchase cost. Automatically doubles selling price to 2x!
                </p>
              </div>

              {/* Selling Price (Auto 2x) */}
              <div className="bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-emerald-800">
                    2. Selling Price (₹) *
                  </label>
                  {formData.costPrice > 0 && formData.sellingPrice === formData.costPrice * 2 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      2x Cost
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-emerald-700">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.sellingPrice || ''}
                    onChange={(e) => handleSellingPriceChange(Number(e.target.value))}
                    placeholder="e.g. 800"
                    className="w-full rounded-lg border border-emerald-300 bg-white pl-7 pr-3 py-2 text-base font-bold text-emerald-700 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-emerald-700">
                  Actual price customer pays (editable anytime).
                </p>
              </div>

              {/* MRP (Calculated via Discount %) */}
              <div className="bg-amber-50/40 p-3.5 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-amber-900">
                    3. MRP (₹) *
                  </label>
                  {discountPercent > 0 && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-amber-800">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.mrp || ''}
                    onChange={(e) => handleMrpChange(Number(e.target.value))}
                    placeholder="e.g. 1000"
                    className="w-full rounded-lg border border-amber-300 bg-white pl-7 pr-3 py-2 text-base font-bold text-amber-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-amber-800">
                  Strikethrough price shown to customer (editable).
                </p>
              </div>
            </div>

            {/* Discount Percentage Selector */}
            <div className="rounded-lg border border-[#E8E3DC] p-3.5 bg-[#FAF8F5] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#6B6B6B]">
                  <Percent size={13} className="text-[#C9A84C]" />
                  <span>Select Discount % for MRP Calculation</span>
                </div>
                <span className="text-xs font-semibold text-[#2D2D2D]">
                  Current Discount: <strong className="text-emerald-700">{discountPercent}% OFF</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[0, 10, 15, 20, 25, 30, 40, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleDiscountPercentChange(pct)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                      discountPercent === pct
                        ? 'bg-[#C9A84C] text-white shadow-sm'
                        : 'bg-white border border-[#E8E3DC] text-[#2D2D2D] hover:bg-amber-50 hover:border-[#C9A84C]'
                    }`}
                  >
                    {pct === 0 ? 'No Discount (MRP = Selling)' : `${pct}% OFF`}
                  </button>
                ))}

                {/* Custom Percentage Input */}
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs text-[#6B6B6B]">Custom %:</span>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={discountPercent}
                    onChange={(e) => handleDiscountPercentChange(Number(e.target.value))}
                    className="w-16 rounded border border-[#E8E3DC] bg-white px-2 py-1 text-xs font-bold text-center focus:border-[#C9A84C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Profit & Margin Summary Card */}
              {formData.sellingPrice > 0 && (
                <div className="mt-2 pt-2 border-t border-[#E8E3DC] flex flex-wrap items-center justify-between text-xs">
                  <div className="text-[#6B6B6B]">
                    Gross Margin:{' '}
                    <span className="font-bold text-emerald-700">
                      ₹{profitMarginAmount.toLocaleString('en-IN')} ({profitMarginPercent}% markup on cost)
                    </span>
                  </div>
                  <div className="text-[#6B6B6B]">
                    Customer Saves:{' '}
                    <span className="font-bold text-amber-800">
                      ₹{Math.max(0, formData.mrp - formData.sellingPrice).toLocaleString('en-IN')} ({discountPercent}% OFF)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Jewellery Attributes */}
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
                placeholder="Enter image URL or upload photo below"
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
                <span>{uploading ? 'Optimizing & Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {images.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-[#E8E3DC] p-8 text-center text-xs text-[#8C827A]">
                No photos added yet. Upload high-res product photos or enter an image URL above.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg border border-[#E8E3DC] overflow-hidden bg-[#FAF8F5] aspect-square flex items-center justify-center"
                  >
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 rounded bg-[#C9A84C] px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition shadow"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
