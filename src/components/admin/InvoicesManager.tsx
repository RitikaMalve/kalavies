'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Printer,
  Download,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Filter,
  History,
  ShieldCheck,
  Package,
} from 'lucide-react'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'

interface OrderRecord {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  totalAmount: number
  subtotal: number
  shippingName?: string | null
  shippingPhone?: string | null
  shippingCity?: string | null
  shippingAddress?: string | null
  createdAt: string
  user?: {
    firstName: string
    lastName: string
    email: string
    phone?: string | null
  } | null
  invoices: {
    id: string
    invoiceNumber: string
    type: string
    status: string
    total: number
    issuedAt: string
    orderAddress?: {
      recipientName: string
      city: string
      label?: string | null
    } | null
  }[]
  shipments: {
    id: string
    shipmentNumber: string
    status: string
  }[]
  items: {
    id: string
    productName: string
    quantity: number
  }[]
}

interface InvoicesManagerProps {
  initialOrders: OrderRecord[]
  initialAuditLogs?: any[]
}

export default function InvoicesManager({
  initialOrders,
  initialAuditLogs = [],
}: InvoicesManagerProps) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL')
  const [invoiceFilter, setInvoiceFilter] = useState<'ALL' | 'ISSUED' | 'PENDING'>('ALL')

  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showAuditModal, setShowAuditModal] = useState(false)

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchOrder = o.orderNumber.toLowerCase().includes(q)
      const matchName = (o.shippingName || `${o.user?.firstName} ${o.user?.lastName}`).toLowerCase().includes(q)
      const matchPhone = (o.shippingPhone || o.user?.phone || '').includes(q)
      const matchCity = (o.shippingCity || '').toLowerCase().includes(q)
      const matchInvoice = o.invoices.some((inv) => inv.invoiceNumber.toLowerCase().includes(q))
      if (!matchOrder && !matchName && !matchPhone && !matchCity && !matchInvoice) return false
    }

    // Payment Filter
    if (paymentFilter !== 'ALL' && o.paymentStatus !== paymentFilter) return false

    // Invoice Filter
    if (invoiceFilter === 'ISSUED' && o.invoices.length === 0) return false
    if (invoiceFilter === 'PENDING' && o.invoices.length > 0) return false

    return true
  })

  // Selection helpers
  const allSelected =
    filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.includes(o.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  // Action: Generate Bulk Invoices
  const handleBulkGenerate = async () => {
    if (selectedIds.length === 0) return
    setLoading(true)
    setAlert(null)

    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedIds }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate bulk invoices')

      setAlert({
        type: 'success',
        message: `Successfully processed ${data.totalCount} orders! (${data.successCount} newly generated, ${data.existingCount} already existed).`,
      })

      // Refresh list
      const refreshRes = await fetch('/api/admin/invoices')
      const refreshData = await refreshRes.json()
      if (refreshData.orders) {
        setOrders(refreshData.orders)
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  // Action: Bulk Download ZIP
  const handleBulkDownloadZip = async () => {
    if (selectedIds.length === 0) return
    setLoading(true)
    setAlert(null)

    try {
      const res = await fetch('/api/admin/invoices/bulk-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedIds, format: 'pdf' }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to build ZIP archive')
      }

      // Trigger browser download of ZIP
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `KALAVIES_Invoices_Batch_${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setAlert({
        type: 'success',
        message: `Downloaded ZIP file containing ${selectedIds.length} official PDF invoices!`,
      })
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  // Action: Combined Print
  const handleCombinedPrint = () => {
    if (selectedIds.length === 0) return
    const url = `/api/admin/invoices/combined-print?orderIds=${selectedIds.join(',')}`
    window.open(url, '_blank')
  }

  // Top Stats
  const totalInvoicesCount = orders.reduce((s, o) => s + o.invoices.length, 0)
  const totalInvoicedRevenue = orders
    .filter((o) => o.invoices.length > 0)
    .reduce((s, o) => s + o.totalAmount, 0)
  const multiAddressOrdersCount = orders.filter((o) => o.shipments.length > 1).length
  const pendingInvoicesCount = orders.filter((o) => o.invoices.length === 0).length

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6B6B] text-xs font-semibold uppercase">
            <span>Invoices Generated</span>
            <FileText size={16} className="text-[#C9A84C]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#2D2D2D]">{totalInvoicesCount}</div>
          <p className="text-[11px] text-[#6B6B6B] mt-0.5">Official GST billing documents</p>
        </div>

        <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6B6B] text-xs font-semibold uppercase">
            <span>Invoiced Value</span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#2D2D2D]">
            {formatPrice(totalInvoicedRevenue)}
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5">Taxable & fully documented</p>
        </div>

        <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6B6B] text-xs font-semibold uppercase">
            <span>Multi-Address Shipments</span>
            <MapPin size={16} className="text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#2D2D2D]">{multiAddressOrdersCount}</div>
          <p className="text-[11px] text-blue-700 mt-0.5">Mode B split destinations</p>
        </div>

        <div className="rounded-xl border border-[#E8E3DC] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#6B6B6B] text-xs font-semibold uppercase">
            <span>Pending Generation</span>
            <Package size={16} className="text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#2D2D2D]">{pendingInvoicesCount}</div>
          <p className="text-[11px] text-amber-700 mt-0.5">Awaiting billing creation</p>
        </div>
      </div>

      {/* Notifications */}
      {alert && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-xs hover:underline font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-[#E8E3DC] bg-white p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            placeholder="Search by customer, order #, phone, or invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#E8E3DC] bg-[#FAF8F5] pl-10 pr-4 py-2 text-xs text-[#2D2D2D] focus:border-[#C9A84C] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center rounded-lg border border-[#E8E3DC] p-0.5 bg-[#FAF8F5] text-xs">
            <span className="px-2 text-[10px] font-bold text-[#6B6B6B] uppercase">Payment:</span>
            <button
              onClick={() => setPaymentFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                paymentFilter === 'ALL' ? 'bg-white shadow-xs text-[#2D2D2D]' : 'text-[#6B6B6B]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPaymentFilter('PAID')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                paymentFilter === 'PAID' ? 'bg-white shadow-xs text-emerald-700' : 'text-[#6B6B6B]'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setPaymentFilter('PENDING')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                paymentFilter === 'PENDING' ? 'bg-white shadow-xs text-amber-700' : 'text-[#6B6B6B]'
              }`}
            >
              Pending
            </button>
          </div>

          <div className="flex items-center rounded-lg border border-[#E8E3DC] p-0.5 bg-[#FAF8F5] text-xs">
            <span className="px-2 text-[10px] font-bold text-[#6B6B6B] uppercase">Invoice:</span>
            <button
              onClick={() => setInvoiceFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                invoiceFilter === 'ALL' ? 'bg-white shadow-xs text-[#2D2D2D]' : 'text-[#6B6B6B]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setInvoiceFilter('ISSUED')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                invoiceFilter === 'ISSUED' ? 'bg-white shadow-xs text-[#C9A84C]' : 'text-[#6B6B6B]'
              }`}
            >
              Issued
            </button>
            <button
              onClick={() => setInvoiceFilter('PENDING')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                invoiceFilter === 'PENDING' ? 'bg-white shadow-xs text-rose-700' : 'text-[#6B6B6B]'
              }`}
            >
              Unbilled
            </button>
          </div>
        </div>
      </div>

      {/* Floating Multi-Selection Action Bar (Mode A: Bulk Generation & Download) */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-40 rounded-xl border border-[#C9A84C] bg-[#1A1A1A] text-white p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="h-7 w-7 rounded-full bg-[#C9A84C] text-black font-bold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold">
              {selectedIds.length === 1 ? '1 order selected' : `${selectedIds.length} orders selected`} for bulk invoice operations
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBulkGenerate}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A84C] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#B8963B] transition disabled:opacity-50"
            >
              <Sparkles size={14} /> Generate Bulk Invoices
            </button>

            <button
              onClick={handleBulkDownloadZip}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-50"
            >
              <Download size={14} /> Download ZIP (PDFs)
            </button>

            <button
              onClick={handleCombinedPrint}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-50"
            >
              <Printer size={14} /> Combined Print View
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-2 text-xs text-white/60 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-[#E8E3DC] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#E8E3DC] bg-[#FAF8F5] text-xs font-semibold uppercase text-[#6B6B6B]">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center text-[#6B6B6B] hover:text-black"
                  >
                    {allSelected ? (
                      <CheckSquare size={16} className="text-[#C9A84C]" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Customer & Destination</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Items & Type</th>
                <th className="px-4 py-3.5">Total</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8E3DC]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-[#6B6B6B]">
                    No matching order or invoice records found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedIds.includes(order.id)
                  const primaryInvoice = order.invoices[0]
                  const hasMultiAddress = order.shipments.length > 1

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#FAF8F5]/80 transition ${
                        isSelected ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleSelectRow(order.id)}
                          className="flex items-center text-[#6B6B6B] hover:text-black"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-[#C9A84C]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* Invoice # */}
                      <td className="px-4 py-4">
                        {primaryInvoice ? (
                          <div>
                            <span className="font-mono font-bold text-xs text-[#C9A84C]">
                              {primaryInvoice.invoiceNumber}
                            </span>
                            {order.invoices.length > 1 && (
                              <span className="block text-[10px] text-[#6B6B6B]">
                                +{order.invoices.length - 1} split invoices
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            Pending Generation
                          </span>
                        )}
                      </td>

                      {/* Order ID */}
                      <td className="px-4 py-4 font-medium text-[#2D2D2D]">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:text-[#C9A84C] hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>

                      {/* Customer & Destination */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-xs text-[#2D2D2D]">
                          {order.shippingName ||
                            (order.user
                              ? `${order.user.firstName} ${order.user.lastName}`
                              : 'Valued Customer')}
                        </div>
                        <div className="text-[11px] text-[#6B6B6B]">
                          {order.shippingCity || 'Standard Delivery'} • {order.shippingPhone || order.user?.phone || 'N/A'}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-xs text-[#6B6B6B]">
                        {formatDate(order.createdAt)}
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentMethod} • {order.paymentStatus}
                        </span>
                      </td>

                      {/* Items & Multi-Address Badge */}
                      <td className="px-4 py-4">
                        <div className="text-xs text-[#2D2D2D] font-medium">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </div>
                        {hasMultiAddress && (
                          <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 mt-0.5">
                            <MapPin size={10} /> Mode B ({order.shipments.length} Addresses)
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-4 font-bold text-xs text-[#2D2D2D]">
                        {formatPrice(order.totalAmount)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View HTML */}
                          <Link
                            href={`/api/orders/${order.id}/invoice`}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E8E3DC] bg-white px-2.5 py-1 text-xs font-semibold text-[#2D2D2D] hover:bg-[#FAF8F5] hover:text-[#C9A84C] transition"
                            title="View / Print Tax Invoice"
                          >
                            <FileText size={13} /> View
                          </Link>

                          {/* Download PDF */}
                          <Link
                            href={`/api/orders/${order.id}/invoice?format=pdf`}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#2D2D2D] px-2.5 py-1 text-xs font-semibold text-white hover:bg-black transition"
                            title="Download Official PDF Invoice"
                          >
                            <Download size={13} /> PDF
                          </Link>

                          {/* Multi-Address manage */}
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                            title="Manage Multi-Address Shipments & Split Invoices"
                          >
                            <MapPin size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
