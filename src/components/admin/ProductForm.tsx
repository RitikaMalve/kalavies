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
  Eye,
  Camera,
  FileCheck,
  Crop,
  Plus,
} from 'lucide-react'
import { uploadProductImage } from '@/lib/storageHelper'
import ImageCropModal from './ImageCropModal'
import ProductPreviewModal from './ProductPreviewModal'

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

// Character limits
const LIMITS = {
  TITLE: 100,
  SHORT_DESC: 300,
  DETAILED_DESC: 2000,
  MAX_FILE_SIZE_MB: 10,
}

// Helper to generate SKU based on title keywords
function generateSkuFromTitle(title: string): string {
  if (!title.trim()) return ''
  const t = title.toLowerCase()
  const parts: string[] = ['KLV']

  // Category & style detection
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
  }

  // Item type detection for Kalavies 6 categories
  if (t.includes('nose') || t.includes('nath') || t.includes('pin')) {
    parts.push('NTH')
  } else if (t.includes('jhumk')) {
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
  } else if (t.includes('set') || t.includes('combo')) {
    parts.push('SET')
  }

  if (parts.length === 1) {
    const cleanWords = t.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean)
    const initials = cleanWords.slice(0, 2).map((w) => w.slice(0, 3).toUpperCase()).join('-')
    if (initials) parts.push(initials)
    else parts.push('JWL')
  }

  const randomNum = Math.floor(100 + Math.random() * 900)
  return `${parts.join('-')}-${randomNum}`
}

export default function ProductForm({ initialData, categories, isEditing }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [successCreated, setSuccessCreated] = useState<{
    name: string
    slug: string
    sku: string
    sellingPrice: number
    mrp: number
    status: string
  } | null>(null)

  const defaultCategoryId =
    initialData?.categoryId || categories[0]?.children?.[0]?.id || categories[0]?.id || ''

  const initialDiscount =
    initialData?.mrp && initialData?.sellingPrice && initialData.mrp > initialData.sellingPrice
      ? Math.round(((initialData.mrp - initialData.sellingPrice) / initialData.mrp) * 100)
      : 20

  const [discountPercent, setDiscountPercent] = useState<number>(initialDiscount)
  const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(Boolean(initialData?.sku))

  // SKU check state
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

  // Images state (Slot-based image array)
  const [images, setImages] = useState<string[]>(
    initialData?.images?.map((img: any) => img.url) || []
  )

  // Crop modal state
  const [cropModal, setCropModal] = useState<{
    isOpen: boolean
    imageSrc: string
    fileName: string
    targetSlotIndex: number
  }>({
    isOpen: false,
    imageSrc: '',
    fileName: '',
    targetSlotIndex: 0,
  })

  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)
  const [variants, setVariants] = useState<any[]>(initialData?.variants || [])

  // Title change with limit
  const handleNameChange = (name: string) => {
    if (name.length > LIMITS.TITLE) return

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

  // Pricing calculations
  const handleCostPriceChange = (val: number) => {
    const cost = Math.max(0, val)
    const autoSelling = cost > 0 ? Math.round(cost * 2) : 0
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

  const handleMrpChange = (val: number) => {
    const mrp = Math.max(0, val)
    setFormData((prev) => ({ ...prev, mrp }))

    if (mrp > formData.sellingPrice && formData.sellingPrice > 0) {
      const computedPct = Math.round(((mrp - formData.sellingPrice) / mrp) * 100)
      setDiscountPercent(computedPct)
    }
  }

  // File upload with size limit check & crop modal trigger
  const handleSlotFileSelect = (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Image Size Limit Check (Max 10MB)
    const maxBytes = LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024
    if (file.size > maxBytes) {
      setError(
        `Image "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed photo size is ${LIMITS.MAX_FILE_SIZE_MB}MB.`
      )
      if (e.target) e.target.value = ''
      return
    }

    setError('')

    // 2. Open Crop & Fit modal
    const reader = new FileReader()
    reader.onload = () => {
      setCropModal({
        isOpen: true,
        imageSrc: reader.result as string,
        fileName: file.name,
        targetSlotIndex: slotIndex,
      })
    }
    reader.readAsDataURL(file)
    if (e.target) e.target.value = ''
  }

  // Handle crop apply -> upload to server
  const handleCropApply = async (croppedBlob: Blob, _previewUrl: string) => {
    const targetSlot = cropModal.targetSlotIndex
    setCropModal((prev) => ({ ...prev, isOpen: false }))
    setUploadingSlot(targetSlot)
    setError('')

    try {
      const file = new File([croppedBlob], `kalavies-${Date.now()}.webp`, {
        type: 'image/webp',
      })
      const uploadResult = await uploadProductImage(file, 'products')

      setImages((prev) => {
        const next = [...prev]
        next[targetSlot] = uploadResult.url
        return next
      })
    } catch (err: any) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploadingSlot(null)
    }
  }

  // Remove specific image slot
  const removeSlotImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev]
      next.splice(index, 1)
      return next
    })
  }

  // Reset form
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
    setIsSkuManuallyEdited(false)
    setSkuCheck({ status: 'idle', message: '', suggested: '' })
  }

  // Submit Handler: supports both DRAFT and PUBLISHED
  const handleFormSubmit = async (targetStatus: 'DRAFT' | 'PUBLISHED') => {
    setLoading(true)
    setError('')

    // VALIDATION 1: Product Title
    if (!formData.name.trim()) {
      setError('Product Title is required.')
      setLoading(false)
      return
    }

    // VALIDATION 2: At least 1 image is COMPULSORY
    const validImages = images.filter((img) => Boolean(img && img.trim()))
    if (validImages.length === 0) {
      setError('At least 1 product image is required (Slot 1 is compulsory).')
      setLoading(false)
      return
    }

    // VALIDATION 3: SKU duplicate check
    if (skuCheck.status === 'taken') {
      setError(`Cannot save: SKU "${formData.sku}" is already in use by another product.`)
      setLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        status: targetStatus,
        mrp: Number(formData.mrp),
        sellingPrice: Number(formData.sellingPrice),
        costPrice: Number(formData.costPrice),
        totalStock: Number(formData.totalStock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        discountPercent: Number(discountPercent),
        images: validImages,
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
        router.push('/admin/products')
        router.refresh()
      } else {
        setSuccessCreated({
          name: payload.name,
          slug: payload.slug,
          sku: payload.sku,
          sellingPrice: payload.sellingPrice,
          mrp: payload.mrp,
          status: targetStatus,
        })
        resetAllFields()
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

  // Slot labels
  const slotLabels = [
    { title: 'Image 1: Primary View', subtitle: 'Compulsory * (Front / Main Angle)' },
    { title: 'Image 2: Side / Angle', subtitle: 'Recommended (Profile / Side View)' },
    { title: 'Image 3: Close-Up Detail', subtitle: 'Recommended (Intricate Detailing)' },
    { title: 'Image 4: On-Model / Back', subtitle: 'Recommended (Wearing / Packaging)' },
  ]

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
                Oxidised jewellery catalog • At least 4 photo slots • Auto 2x price
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Preview Button */}
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E3DC] bg-white px-3.5 py-2 text-xs font-semibold text-[#2D2D2D] hover:bg-[#FAF8F5] transition shadow-sm"
            >
              <Eye size={14} className="text-[#C9A84C]" />
              <span>Preview Product</span>
            </button>

            {/* Save as Draft Option */}
            <button
              type="button"
              disabled={loading || skuCheck.status === 'taken'}
              onClick={() => handleFormSubmit('DRAFT')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition disabled:opacity-50 shadow-sm"
            >
              <Save size={14} />
              <span>Save as Draft</span>
            </button>

            {/* Make Live / Publish Option */}
            <button
              type="button"
              disabled={loading || skuCheck.status === 'taken'}
              onClick={() => handleFormSubmit('PUBLISHED')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A84C] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
            >
              <FileCheck size={14} />
              <span>{loading ? 'Saving...' : 'Publish & Make Live'}</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successCreated && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-900 shadow-sm animate-fadeIn">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base text-emerald-900">
                    Product Successfully Saved ({successCreated.status === 'PUBLISHED' ? 'Live on Store' : 'Saved as Draft'})!
                  </h3>
                  <p className="text-sm text-emerald-800 mt-0.5">
                    <span className="font-semibold">"{successCreated.name}"</span> (SKU:{' '}
                    <span className="font-mono font-bold">{successCreated.sku}</span>) at ₹
                    {successCreated.sellingPrice.toLocaleString('en-IN')}.
                  </p>
                  <p className="text-xs text-emerald-700 mt-1 font-medium">
                    ✓ All fields and image slots have been cleared. Ready for your next product entry.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <a
                      href={`/products/${successCreated.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition"
                    >
                      View on Website <ExternalLink size={12} />
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

              {/* Title with live word/char counter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B]">
                    Product Title *
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.name.length >= LIMITS.TITLE
                        ? 'text-red-600 font-bold'
                        : 'text-[#8C827A]'
                    }`}
                  >
                    {formData.name.length}/{LIMITS.TITLE} chars
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={LIMITS.TITLE}
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Anti-Oxidised Silver Jhumka Earrings"
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#8C827A]">
                  Auto-generates URL Slug and SKU (e.g. anti-oxi → KLV-AOX-...)
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
                          Use suggested: {skuCheck.suggested}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Short Description with live counter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B]">
                    Short Description (Max {LIMITS.SHORT_DESC} chars)
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.description.length >= LIMITS.SHORT_DESC
                        ? 'text-red-600 font-bold'
                        : 'text-[#8C827A]'
                    }`}
                  >
                    {formData.description.length}/{LIMITS.SHORT_DESC} chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={LIMITS.SHORT_DESC}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Handcrafted ethnic oxidised jewellery with intricate detailing..."
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              {/* Detailed Content with live counter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-[#6B6B6B]">
                    Detailed Product Information & Care (Max {LIMITS.DETAILED_DESC} chars)
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.detailedContent.length >= LIMITS.DETAILED_DESC
                        ? 'text-red-600 font-bold'
                        : 'text-[#8C827A]'
                    }`}
                  >
                    {formData.detailedContent.length}/{LIMITS.DETAILED_DESC} chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={LIMITS.DETAILED_DESC}
                  value={formData.detailedContent}
                  onChange={(e) => setFormData({ ...formData, detailedContent: e.target.value })}
                  placeholder="Specifications, Styling Tips, Care instructions (Keep away from water & perfume)..."
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2.5 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
            </div>

            {/* PRODUCT IMAGERY - 4 DEDICATED SLOTS (SLOT 1 COMPULSORY) + CROP/FIT */}
            <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E3DC] pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#2D2D2D] flex items-center gap-2">
                    <Camera size={18} className="text-[#C9A84C]" />
                    <span>Product Imagery</span>
                    <span className="text-xs font-normal text-[#8C827A]">
                      (Slot 1 Required • Up to 4+ Photos)
                    </span>
                  </h3>
                  <p className="text-xs text-[#8C827A] mt-0.5">
                    Crop (1:1 Square) or Fit in Size available • Max photo size {LIMITS.MAX_FILE_SIZE_MB}MB
                  </p>
                </div>
                <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-md font-medium">
                  {images.filter(Boolean).length} / 4 Slots Filled
                </span>
              </div>

              {/* 4 Dedicated Slots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const imgUrl = images[slotIdx]
                  const slotInfo = slotLabels[slotIdx]
                  const isCompulsory = slotIdx === 0
                  const isUploading = uploadingSlot === slotIdx

                  return (
                    <div
                      key={slotIdx}
                      className={`relative rounded-xl border-2 overflow-hidden flex flex-col transition ${
                        imgUrl
                          ? 'border-[#C9A84C] bg-[#FAF8F5]'
                          : isCompulsory
                          ? 'border-dashed border-red-300 bg-red-50/20'
                          : 'border-dashed border-[#E8E3DC] bg-[#FAF8F5]/50'
                      }`}
                    >
                      {/* Slot Header Banner */}
                      <div className="p-2 border-b border-[#E8E3DC]/60 flex items-center justify-between text-[11px] bg-white">
                        <span className="font-bold text-[#2D2D2D] truncate">
                          {isCompulsory ? (
                            <span className="text-red-700 font-extrabold">Slot 1 (Required *)</span>
                          ) : (
                            `Slot ${slotIdx + 1}`
                          )}
                        </span>
                        {imgUrl && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.2 rounded">
                            Added
                          </span>
                        )}
                      </div>

                      {/* Photo Preview / Upload Trigger Area */}
                      <div className="relative aspect-square w-full flex items-center justify-center p-2">
                        {imgUrl ? (
                          <div className="relative w-full h-full group rounded-lg overflow-hidden bg-white shadow-inner flex items-center justify-center">
                            <img
                              src={imgUrl}
                              alt={`Slot ${slotIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay remove / change buttons */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                              <label className="cursor-pointer bg-white text-[#2D2D2D] px-2.5 py-1 rounded text-xs font-semibold hover:bg-gray-100 transition flex items-center gap-1">
                                <Crop size={12} /> Replace / Crop
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={isUploading}
                                  onChange={(e) => handleSlotFileSelect(slotIdx, e)}
                                  className="hidden"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => removeSlotImage(slotIdx)}
                                className="bg-red-600 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-red-700 transition flex items-center gap-1"
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="w-full h-full rounded-lg border border-dashed border-[#C9A84C]/40 hover:border-[#C9A84C] bg-white hover:bg-amber-50/40 transition cursor-pointer flex flex-col items-center justify-center p-3 text-center">
                            {isUploading ? (
                              <div className="flex flex-col items-center gap-1.5 text-xs text-[#C9A84C] font-semibold">
                                <RefreshCw size={20} className="animate-spin" />
                                <span>Optimizing...</span>
                              </div>
                            ) : (
                              <>
                                <div className="rounded-full bg-amber-50 p-2.5 text-[#C9A84C] mb-2 shadow-sm">
                                  <Upload size={18} />
                                </div>
                                <span className="text-xs font-bold text-[#2D2D2D]">
                                  {isCompulsory ? 'Upload Main Photo *' : 'Add Photo'}
                                </span>
                                <span className="text-[10px] text-[#8C827A] mt-1 leading-tight">
                                  {slotInfo.subtitle}
                                </span>
                                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#C9A84C] underline">
                                  <Crop size={10} /> Crop or Fit
                                </span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploading}
                              onChange={(e) => handleSlotFileSelect(slotIdx, e)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Extra Images Beyond 4 Slots */}
              {images.length > 4 && (
                <div className="border-t border-[#E8E3DC] pt-3">
                  <p className="text-xs font-bold uppercase text-[#6B6B6B] mb-2">Additional Photos (Slots 5+)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.slice(4).map((url, extraIdx) => {
                      const actualIdx = extraIdx + 4
                      return (
                        <div
                          key={actualIdx}
                          className="relative group rounded-lg border border-[#E8E3DC] overflow-hidden aspect-square bg-[#FAF8F5]"
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeSlotImage(actualIdx)}
                            className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white shadow"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Add 5th+ photo button */}
              <div className="flex justify-end pt-1">
                <label className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3 py-1.5 text-xs font-semibold text-[#2D2D2D] hover:bg-gray-100 transition cursor-pointer">
                  <Plus size={13} />
                  <span>Add Another Photo (Slot {images.length + 1})</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSlotFileSelect(images.length, e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Pricing & Margins */}
            <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#C9A84C]" />
                  <h3 className="text-lg font-semibold text-[#2D2D2D]">Pricing & Margins</h3>
                </div>
                <span className="text-xs text-[#8C827A] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E8E3DC]">
                  Auto 2x Selling Price • Live Profit Calculation
                </span>
              </div>

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
                    Auto-doubles selling price to 2x!
                  </p>
                </div>

                {/* Selling Price */}
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
                    Actual price customer pays (editable).
                  </p>
                </div>

                {/* MRP */}
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
                    Strikethrough price shown to customer.
                  </p>
                </div>
              </div>

              {/* Discount Percentage Preset Buttons */}
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
                      {pct === 0 ? 'No Discount' : `${pct}% OFF`}
                    </button>
                  ))}

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

                {formData.sellingPrice > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#E8E3DC] flex flex-wrap items-center justify-between text-xs">
                    <div className="text-[#6B6B6B]">
                      Gross Margin:{' '}
                      <span className="font-bold text-emerald-700">
                        ₹{(formData.sellingPrice - formData.costPrice).toLocaleString('en-IN')} (
                        {formData.costPrice > 0
                          ? Math.round(((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100)
                          : 100}
                        % markup on cost)
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
          </div>

          {/* Right Column - Organization & Category */}
          <div className="space-y-6">
            {/* Save Options Action Box */}
            <div className="rounded-xl border border-amber-300 bg-amber-50/40 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                Publishing Actions
              </h3>
              <p className="text-xs text-amber-800">
                Choose to publish directly to live shoppers or save as a private draft.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={loading || skuCheck.status === 'taken'}
                  onClick={() => handleFormSubmit('PUBLISHED')}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
                >
                  <FileCheck size={16} />
                  <span>{loading ? 'Publishing...' : 'Publish & Make Live'}</span>
                </button>

                <button
                  type="button"
                  disabled={loading || skuCheck.status === 'taken'}
                  onClick={() => handleFormSubmit('DRAFT')}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-amber-900 hover:bg-amber-100/60 transition disabled:opacity-50 shadow-sm"
                >
                  <Save size={16} />
                  <span>Save as Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-4 py-2 text-xs font-semibold text-[#2D2D2D] hover:bg-gray-100 transition"
                >
                  <Eye size={14} className="text-[#C9A84C]" />
                  <span>Preview Customer View</span>
                </button>
              </div>
            </div>

            {/* Category Assignment - Clean 6 categories */}
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
                <p className="mt-1 text-[11px] text-[#8C827A]">
                  Choose: Oxidised Jewellery, Earrings, Nose Pins, Necklaces, Bangles, or Rings.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Collection (Optional)
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
              </div>
            </div>

            {/* Badges */}
            <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-3">
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B]">
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
        </div>
      </form>

      {/* Image Crop & Fit Modal */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        imageSrc={cropModal.imageSrc}
        fileName={cropModal.fileName}
        onClose={() => setCropModal((prev) => ({ ...prev, isOpen: false }))}
        onApply={handleCropApply}
      />

      {/* Live Customer Preview Modal */}
      <ProductPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        product={{
          name: formData.name,
          sku: formData.sku,
          mrp: formData.mrp,
          sellingPrice: formData.sellingPrice,
          discountPercent: discountPercent,
          description: formData.description,
          detailedContent: formData.detailedContent,
          material: formData.material,
          colour: formData.colour,
          weight: formData.weight,
          totalStock: formData.totalStock,
          images: images.filter(Boolean),
          collectionName: formData.collectionName,
          status: formData.status,
        }}
      />
    </>
  )
}
