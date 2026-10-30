'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ArrowRight, ShieldCheck, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Authentication failed')

      if (data.user.role === 'ADMIN') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/account'
      }
    } catch (err: any) {
      setError(err.message || 'Login error')
    } finally {
      setLoading(false)
    }
  }

  const fillAdmin = () => {
    setEmail('admin@kalavies.com')
    setPassword('Admin@123')
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <Link href="/" className="inline-flex flex-col items-center group">
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-md mb-2 group-hover:scale-105 transition flex items-center justify-center">
            <img
              src="/logo-circle.png"
              alt="KALAVIES Jewellery"
              className="w-full h-full object-contain"
            />
          </div>
          <span
            className="text-2xl font-bold tracking-widest text-[#1A1A1A]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            KALAVIES
          </span>
          <span className="text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase font-semibold">
            Jewellery
          </span>
        </Link>
        <h2 className="mt-6 text-xl font-bold text-[#2D2D2D]">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-[#6B6B6B]">
          Or{' '}
          <Link href="/auth/register" className="font-semibold text-[#C9A84C] hover:underline">
            create a new customer profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-[#E8E3DC] sm:px-10">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kalavies.com"
                  className="w-full rounded-lg border border-[#E8E3DC] py-2.5 pl-10 pr-4 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-[#6B6B6B]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B6B6B] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#E8E3DC] py-2.5 pl-10 pr-4 text-sm focus:border-[#C9A84C] focus:outline-none"
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-[#6B6B6B]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A84C] py-3 text-sm font-bold text-white shadow hover:bg-[#B8963B] transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-[#E8E3DC]">
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase mb-2">
              Quick Admin Access:
            </p>
            <button
              type="button"
              onClick={fillAdmin}
              className="w-full rounded-lg border border-[#C9A84C] bg-amber-50/50 py-2 text-xs font-semibold text-[#C9A84C] hover:bg-amber-100/50 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} /> Fill Admin Credentials (admin@kalavies.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
