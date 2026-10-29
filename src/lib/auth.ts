import { prisma } from './prisma'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { v4 as uuid } from 'uuid'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'kalavies-default-secret'
)

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string | null
  avatar?: string | null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(payload: { userId: string; role: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string; role: string }
  } catch {
    return null
  }
}

export async function createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<string> {
  const token = await createToken({ userId, role: '' })
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  const tokenWithRole = await createToken({ userId, role: user.role })

  await prisma.session.create({
    data: {
      userId,
      token: tokenWithRole,
      expiresAt: new Date(Date.now() + SESSION_DURATION),
      userAgent,
      ipAddress,
    },
  })

  return tokenWithRole
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session-token')?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const session = await prisma.session.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          avatar: true,
          isActive: true,
        },
      },
    },
  })

  if (!session || !session.user.isActive) return null

  return session.user
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return user
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } })
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } })
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('session-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session-token')
}

export async function registerUser(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}): Promise<AuthUser> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    throw new Error('Email already registered')
  }

  const passwordHash = await hashPassword(data.password)
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      avatar: true,
    },
  })

  return user
}

export async function loginUser(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive) {
    throw new Error('Invalid email or password')
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    throw new Error('Invalid email or password')
  }

  const token = await createSession(user.id)

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    },
    token,
  }
}
