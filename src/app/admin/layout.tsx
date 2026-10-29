import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()

  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  return (
    <AdminShell
      user={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      }}
    >
      {children}
    </AdminShell>
  )
}
