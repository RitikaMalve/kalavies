import { NextResponse } from 'next/server'
import { getCachedStoreCategories } from '@/lib/categories'

export async function GET() {
  const categories = await getCachedStoreCategories()
  return NextResponse.json({ categories })
}
