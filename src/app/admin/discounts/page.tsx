import { prisma } from '@/lib/prisma'
import DiscountsManager from '@/components/admin/DiscountsManager'

export const dynamic = 'force-dynamic'

export default async function AdminDiscountsPage() {
  const [coupons, shippingSetting] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.shippingSetting.findFirst(),
  ])

  return (
    <DiscountsManager
      initialCoupons={coupons}
      shippingSetting={
        shippingSetting || {
          id: '',
          freeShippingAbove: 499,
          flatShippingRate: 49,
          codEnabled: true,
          codExtraCharge: 0,
        }
      }
    />
  )
}
