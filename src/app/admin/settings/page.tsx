import { prisma } from '@/lib/prisma'
import BusinessSettingsForm from '@/components/admin/BusinessSettingsForm'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const [business, shipping] = await Promise.all([
    prisma.businessSetting.findFirst(),
    prisma.shippingSetting.findFirst(),
  ])

  return (
    <BusinessSettingsForm
      initialBusiness={
        business || {
          id: '',
          businessName: 'KALAVIES Jewellery',
          tagline: 'Elegance in Every Detail',
          email: 'hello@kalavies.com',
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
    />
  )
}
