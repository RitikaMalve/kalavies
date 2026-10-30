import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length < 10) {
      return NextResponse.json({
        exists: false,
        valid: false,
        message: 'Please enter a valid 10-digit mobile number',
      })
    }

    // Check if current user is already logged in
    const sessionUser = await getSession()
    if (sessionUser) {
      const userPhoneClean = sessionUser.phone ? sessionUser.phone.replace(/\D/g, '').slice(-10) : ''
      return NextResponse.json({
        exists: true,
        isLoggedIn: true,
        phoneMatchesSession: userPhoneClean === cleanPhone,
        user: {
          id: sessionUser.id,
          firstName: sessionUser.firstName,
          email: sessionUser.email,
          phone: sessionUser.phone,
        },
      })
    }

    // Query database for user with matching phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: `+91${cleanPhone}` },
          { phone: `91${cleanPhone}` },
          { phone: `0${cleanPhone}` },
          { phone: { endsWith: cleanPhone } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        email: true,
        phone: true,
      },
    })

    if (existingUser) {
      return NextResponse.json({
        exists: true,
        isLoggedIn: false,
        user: {
          firstName: existingUser.firstName,
          emailMasked: existingUser.email
            ? existingUser.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
            : undefined,
        },
      })
    }

    return NextResponse.json({
      exists: false,
      isLoggedIn: false,
    })
  } catch (error: any) {
    console.error('Error in check-phone:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check phone number' },
      { status: 500 }
    )
  }
}
