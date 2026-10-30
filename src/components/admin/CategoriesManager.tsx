'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Layers,
  Save,
  X,
  Upload,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Crop,
  ImageIcon,
} from 'lucide-react'
import { uploadProductImage } from '@/lib/storageHelper'
import ImageCropModal from './ImageCropModal'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  parentId?: string | null
  sortOrder: number
  isActive: boolean
  children?: Category[]
  _count?: { products: number }
}

export default function CategoriesManager({
  initialCategories,
}: {
  initialCategories: Category[]
}) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [parentId, setParentId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)

  // Direct image upload & crop state
  const [uploadingImage, setUploadingImage] = useState(false)
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

  const parentCategories = categories.filter((c) => !c.parentId)

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const openCreateModal = (presetParentId: string = '') => {
    setEditingCategory(null)
    setName('')
    setSlug('')
    setParentId(presetParentId)
    setDescription('')
    setImage('')
    setIsActive(true)
    setSortOrder(0)
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setParentId(cat.parentId || '')
    setDescription(cat.description || '')
    setImage(cat.image || '')
    setIsActive(cat.isActive)
    setSortOrder(cat.sortOrder)
    setError('')
    setModalOpen(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
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

  const handleCropApply = async (croppedBlob: Blob) => {
    setCropModal((prev) => ({ ...prev, isOpen: false }))
    setUploadingImage(true)
    setError('')

    try {
      const file = new File([croppedBlob], `category-${Date.now()}.webp`, {
        type: 'image/webp',
      })
      const result = await uploadProductImage(file, 'categories')
      setImage(result.url)
    } catch (err: any) {
      setError(err.message || 'Category image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleNameChange = (val: string) => {
    setName(val)
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_]+/g, '-')
          .replace(/^-+|-+$/g, '')
      )
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        name,
        slug,
        parentId: parentId || null,
        description,
        image: image || null,
        isActive,
        sortOrder: Number(sortOrder),
      }

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save category')

      setModalOpen(false)
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (cat: Category) => {
    if (
      !confirm(
        `Are you sure you want to delete "${cat.name}"? Products attached should be reassigned.`
      )
    )
      return

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            Categories & Subcategories
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Manage catalogue hierarchy, showcase images for "Curated Jewellery Universes", and URLs.
          </p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition cursor-pointer"
        >
          <Plus size={18} /> Add Root Category
        </button>
      </div>

      {/* Categories Tree View */}
      <div className="rounded-xl border border-[#E8E3DC] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E8E3DC] bg-[#FAF8F5] px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
            Category Structure ({categories.length} Total)
          </span>
          <span className="text-xs text-[#6B6B6B]">
            Click Edit to upload or update category images shown on the website
          </span>
        </div>

        <div className="divide-y divide-[#E8E3DC]">
          {parentCategories.map((parent) => {
            const hasChildren = parent.children && parent.children.length > 0
            const isExpanded = expanded[parent.id]

            return (
              <div key={parent.id} className="transition">
                {/* Parent Row */}
                <div className="flex items-center justify-between px-6 py-4 hover:bg-[#FAF8F5]/80">
                  <div className="flex items-center gap-3">
                    {hasChildren ? (
                      <button
                        onClick={() => toggleExpand(parent.id)}
                        className="rounded p-1 text-[#6B6B6B] hover:bg-[#E8E3DC] transition"
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    ) : (
                      <span className="w-6" />
                    )}

                    {/* Category Thumbnail Image or Icon */}
                    <div className="h-10 w-10 rounded-lg border border-[#E8E3DC] bg-white overflow-hidden flex items-center justify-center shrink-0">
                      {parent.image ? (
                        <img
                          src={parent.image}
                          alt={parent.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FolderTree size={18} className="text-[#C9A84C]" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2D2D2D]">{parent.name}</span>
                        {!parent.isActive && (
                          <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                            Hidden
                          </span>
                        )}
                        {!parent.image && (
                          <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[10px] text-amber-800">
                            No Image
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-[#6B6B6B]">/{parent.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#6B6B6B] hidden sm:inline">
                      {hasChildren ? `${parent.children?.length} subcategories` : 'No subcategories'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openCreateModal(parent.id)}
                        className="rounded p-1.5 text-[#6B6B6B] hover:text-[#C9A84C] hover:bg-amber-50 transition cursor-pointer"
                        title="Add Subcategory"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(parent)}
                        className="rounded p-1.5 text-[#6B6B6B] hover:text-[#C9A84C] hover:bg-amber-50 transition cursor-pointer"
                        title="Edit Category & Image"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(parent)}
                        className="rounded p-1.5 text-[#6B6B6B] hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                {hasChildren && isExpanded && (
                  <div className="bg-[#FAF8F5]/40 pl-16 pr-6 divide-y divide-[#E8E3DC]/60 border-t border-[#E8E3DC]/40">
                    {parent.children?.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between py-3 hover:bg-[#FAF8F5] transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md border border-[#E8E3DC] bg-white overflow-hidden flex items-center justify-center shrink-0">
                            {child.image ? (
                              <img
                                src={child.image}
                                alt={child.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Layers size={14} className="text-[#C9A84C]" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-[#2D2D2D]">{child.name}</span>
                            <span className="ml-2 font-mono text-[11px] text-[#6B6B6B]">
                              /{child.slug}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(child)}
                            className="rounded p-1 text-[#6B6B6B] hover:text-[#C9A84C]"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(child)}
                            className="rounded p-1 text-[#6B6B6B] hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E8E3DC] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DC]">
              <div className="flex items-center gap-2">
                <FolderTree size={20} className="text-[#C9A84C]" />
                <h3 className="text-lg font-bold text-[#2D2D2D]">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#6B6B6B] hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="my-3 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* DIRECT CATEGORY IMAGE UPLOAD SECTION */}
              <div className="space-y-2 rounded-xl border-2 border-dashed border-[#E8E3DC] p-4 bg-[#FAF8F5]/60">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                    Category Showcase Image (Displayed on Homepage)
                  </label>
                  {uploadingImage && (
                    <span className="text-xs text-[#C9A84C] font-semibold flex items-center gap-1.5">
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </span>
                  )}
                </div>

                {image ? (
                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-[#C9A84C]/40 shadow-sm">
                    <div className="h-20 w-20 rounded-xl overflow-hidden border border-[#E8E3DC] bg-[#FAF8F5] shrink-0">
                      <img src={image} alt="Category Preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs font-semibold text-green-700 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Image ready
                      </p>
                      <p className="text-[11px] text-[#8C827A] truncate max-w-[220px] font-mono">{image}</p>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[#E8E3DC] hover:bg-gray-50 cursor-pointer"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#C9A84C]/50 rounded-xl bg-white hover:bg-amber-50/40 transition cursor-pointer text-center group"
                  >
                    <div className="h-10 w-10 rounded-full bg-amber-50 text-[#C9A84C] flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
                      <Upload size={20} />
                    </div>
                    <p className="text-xs font-bold text-[#2D2D2D]">
                      Click to upload category photo directly
                    </p>
                    <p className="text-[11px] text-[#8C827A] mt-0.5">
                      Square / 1:1 image • Shows on "Curated Jewellery Universes"
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Oxidised Jewellery"
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Parent Category
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
                >
                  <option value="">None (Top-Level Category)</option>
                  {parentCategories
                    .filter((c) => c.id !== editingCategory?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <label htmlFor="cat-active" className="text-sm font-medium text-[#2D2D2D] cursor-pointer">
                  Active in Storefront
                </label>
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
                    'Save Category'
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
