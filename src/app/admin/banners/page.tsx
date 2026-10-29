import { prisma } from '@/lib/prisma'
import BannersManager from '@/components/admin/BannersManager'

export const dynamic = 'force-dynamic'

export default async function AdminBannersPage() {
  const [banners, sections] = await Promise.all([
    prisma.homepageBanner.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  return <BannersManager initialBanners={banners} initialSections={sections} />
}
