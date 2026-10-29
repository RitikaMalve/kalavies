'use client'

import { useState } from 'react'
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
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
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
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)

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
    setIsActive(cat.isActive)
    setSortOrder(cat.sortOrder)
    setError('')
    setModalOpen(true)
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
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      alert(err.message || 'Delete failed')
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
            Create and organize unlimited nested jewellery categories for your storefront navigation.
          </p>
        </div>
        <button
          onClick={() => openCreateModal('')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#B8963B] transition"
        >
          <Plus size={18} /> Add Root Category
        </button>
      </div>

      {/* Category Tree Card */}
      <div className="rounded-xl border border-[#E8E3DC] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E8E3DC] bg-[#FAF8F5] px-6 py-3.5 text-xs font-semibold uppercase text-[#6B6B6B] flex items-center justify-between">
          <span>Hierarchy Name</span>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-[#E8E3DC]">
          {parentCategories.map((parent) => {
            const isExp = expanded[parent.id] ?? true
            const hasKids = parent.children && parent.children.length > 0

            return (
              <div key={parent.id} className="bg-white">
                <div className="flex items-center justify-between px-6 py-4 hover:bg-[#FAF8F5]/80 transition">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(parent.id)}
                      className="p-1 text-[#6B6B6B] hover:text-[#2D2D2D]"
                    >
                      {hasKids ? (
                        isExp ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )
                      ) : (
                        <div className="w-4" />
                      )}
                    </button>
                    <FolderTree size={20} className="text-[#C9A84C]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2D2D2D]">{parent.name}</span>
                        {!parent.isActive && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-700">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#6B6B6B]">
                        slug: /{parent.slug} • {parent._count?.products || 0} direct products •{' '}
                        {parent.children?.length || 0} subcategories
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCreateModal(parent.id)}
                      className="inline-flex items-center gap-1 rounded border border-[#E8E3DC] bg-white px-2.5 py-1 text-xs font-medium text-[#2D2D2D] hover:bg-gray-50"
                      title="Add subcategory under this"
                    >
                      <Plus size={14} /> Subcategory
                    </button>
                    <button
                      onClick={() => openEditModal(parent)}
                      className="rounded p-1.5 text-[#6B6B6B] hover:bg-[#FAF8F5] hover:text-[#C9A84C]"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(parent)}
                      className="rounded p-1.5 text-[#6B6B6B] hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Subcategories list */}
                {isExp && hasKids && (
                  <div className="divide-y divide-[#E8E3DC]/60 bg-[#FAF8F5]/40 pl-14">
                    {parent.children!.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between py-3 pr-6 hover:bg-white transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers size={16} className="text-[#B76E79]" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#2D2D2D]">
                                {sub.name}
                              </span>
                              {!sub.isActive && (
                                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] text-red-700">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#6B6B6B]">
                              /{sub.slug} • {sub._count?.products || 0} products
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(sub)}
                            className="rounded p-1 text-[#6B6B6B] hover:text-[#C9A84C]"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(sub)}
                            className="rounded p-1 text-[#6B6B6B] hover:text-red-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#E8E3DC]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DC]">
              <h3 className="text-lg font-bold text-[#2D2D2D]">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-[#6B6B6B] hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="my-3 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Bangles & Bracelets"
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

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <label htmlFor="cat-active" className="text-sm font-medium text-[#2D2D2D]">
                  Active in Storefront
                </label>
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
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
