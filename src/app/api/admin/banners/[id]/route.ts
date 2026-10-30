import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const { title, subtitle, description, imageUrl, linkUrl, buttonText, sortOrder, isActive } =
      await req.json()

    const banner = await prisma.homepageBanner.update({
      where: { id },
      data: {
        title,
        subtitle,
        description,
        imageUrl,
        linkUrl,
        buttonText,
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    })

    return NextResponse.json({ success: true, banner })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    await prisma.homepageBanner.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
