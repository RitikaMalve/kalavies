'use client'

import { useState } from 'react'
import { Building2, QrCode, Truck } from 'lucide-react'
import BusinessSettingsForm from '@/components/admin/BusinessSettingsForm'
import PaymentSettingsForm from '@/components/admin/PaymentSettingsForm'

interface SettingsTabsClientProps {
  initialBusiness: any
  initialPaymentSetting: any
  defaultTab?: string
}

export default function SettingsTabsClient({
  initialBusiness,
  initialPaymentSetting,
  defaultTab = 'business',
}: SettingsTabsClientProps) {
  const [activeTab, setActiveTab] = useState<'business' | 'payment'>(
    defaultTab === 'payment' ? 'payment' : 'business'
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
          Store Settings & Configuration
        </h1>
        <p className="text-sm text-[#6B6B6B]">
          Manage company profile, UPI payment QR codes, policies, and store parameters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8E3DC] gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'business'
              ? 'border-[#C9A84C] text-[#C9A84C]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#2D2D2D]'
          }`}
        >
          <Building2 size={16} /> Business Profile & Policies
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'payment'
              ? 'border-[#C9A84C] text-[#C9A84C]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#2D2D2D]'
          }`}
        >
          <QrCode size={16} /> UPI QR Payment Settings
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'business' && (
        <BusinessSettingsForm initialBusiness={initialBusiness} />
      )}

      {activeTab === 'payment' && (
        <PaymentSettingsForm initialSetting={initialPaymentSetting} />
      )}
    </div>
  )
}
