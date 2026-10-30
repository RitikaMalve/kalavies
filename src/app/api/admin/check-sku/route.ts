import { NextRequest } from 'next/server'
import { checkSkuAvailability } from '@/lib/skuHelper'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return checkSkuAvailability(req)
}
