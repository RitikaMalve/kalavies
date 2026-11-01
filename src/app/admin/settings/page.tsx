import { prisma } from '@/lib/prisma'
import SettingsTabsClient from './SettingsTabsClient'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminSettingsPage({ searchParams }: Props) {
  const params = await searchParams
  const [business, paymentSetting] = await Promise.all([
    prisma.businessSetting.findFirst(),
    prisma.paymentSetting.findFirst(),
  ])

  return (
    <SettingsTabsClient
      defaultTab={params.tab}
      initialBusiness={
        business || {
          id: '',
          businessName: 'KALAVIES Jewellery',
          tagline: 'Elegance in Every Detail',
          email: 'support@kalavies.com',
          phone: '+91 98765 43210',
          whatsapp: '+91 98765 43210',
          addressLine1: '108, Jewellery Palace, MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          gstin: '29ABCDE1234F1Z5',
          aboutUs: 'KALAVIES represents the pinnacle of curated Indian oxidised, anti-tarnish and fine traditional jewellery.',
          returnPolicy: 'Easy 7-day hassle-free return and exchange for unworn jewellery items in original packaging.',
          cancellationPolicy: 'Orders can be cancelled free of charge within 24 hours of placement before dispatch.',
        }
      }
      initialPaymentSetting={
        paymentSetting || {
          qrImageUrl: '',
          upiId: 'kalavies@upi',
          payeeName: 'KALAVIES Jewellery',
          paymentInstructions:
            'Scan the QR code with any UPI app (Google Pay, PhonePe, Paytm, BHIM, Cred). Complete the payment of exact order amount, then copy the 12-digit UTR reference number and upload your screenshot below.',
          isActive: true,
        }
      }
    />
  )
}
