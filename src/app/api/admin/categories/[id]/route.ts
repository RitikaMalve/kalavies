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
  const body = await req.json()

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        parentId: body.parentId || null,
        description: body.description,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    })
    return NextResponse.json({ success: true, category: updated })
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
    // Check if category has children or products
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { children: true, products: true },
    })

    if (!cat) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (cat.products.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${cat.products.length} linked products. Please reassign products first.` },
        { status: 400 }
      )
    }

    if (cat.children.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${cat.children.length} subcategories. Please remove subcategories first.` },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Category deleted' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
