import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST() {
  const user = await getSession()
  if (user) {
    await prisma.cartItem.deleteMany({ where: { userId: user.id } })
  }
  return NextResponse.json({ success: true })
}
