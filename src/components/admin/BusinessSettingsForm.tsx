'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Save, Check } from 'lucide-react'

export default function BusinessSettingsForm({ initialBusiness }: { initialBusiness: any }) {
  const router = useRouter()
  const [formData, setFormData] = useState(initialBusiness)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const res = await fetch('/api/admin/settings/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to update')
      setMsg('Business profile and policies updated!')
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            Business Profile & Policies
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Configure store identity, customer service contact numbers, GST credentials, and store policies.
          </p>
        </div>
      </div>

      {msg && (
        <div className="rounded-lg bg-green-50 p-3 text-xs font-semibold text-green-700 flex items-center gap-2">
          <Check size={16} /> {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-[#2D2D2D]">Company Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Store / Brand Name
              </label>
              <input
                type="text"
                value={formData.businessName || ''}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Customer Phone
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                WhatsApp Order Line
              </label>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                GSTIN Number (Tax Invoices)
              </label>
              <input
                type="text"
                value={formData.gstin || ''}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 font-mono text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8E3DC] bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-[#2D2D2D]">Legal Policies & Information</h3>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
              Return & Replacement Policy
            </label>
            <textarea
              rows={3}
              value={formData.returnPolicy || ''}
              onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
              className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
              Cancellation Policy
            </label>
            <textarea
              rows={3}
              value={formData.cancellationPolicy || ''}
              onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
              className="w-full rounded-lg border border-[#E8E3DC] px-3.5 py-2 text-sm focus:border-[#C9A84C] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
          >
            <Save size={16} /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
