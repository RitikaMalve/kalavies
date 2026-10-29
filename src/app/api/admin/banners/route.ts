import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const banners = await prisma.homepageBanner.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ banners })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, subtitle, description, imageUrl, linkUrl, buttonText, sortOrder, isActive } = await req.json()
    const banner = await prisma.homepageBanner.create({
      data: {
        title,
        subtitle,
        description,
        imageUrl: imageUrl || '/images/banners/banner-1.jpg',
        linkUrl,
        buttonText,
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })
    return NextResponse.json({ success: true, banner })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
