import { getCachedStoreCategories } from '@/lib/categories'
import { getSession } from '@/lib/auth'
import StoreHeader from '@/components/store/StoreHeader'
import StoreFooter from '@/components/store/StoreFooter'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  let categories: any[] = []
  let user: any = null

  try {
    const results = await Promise.all([
      getCachedStoreCategories(),
      getSession(),
    ])

    categories = results[0] || []
    user = results[1]
  } catch (error) {
    console.error('Error fetching layout data:', error)
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StoreHeader categories={categories} user={user} />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  )
}
