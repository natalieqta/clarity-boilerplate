'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const allowedEmails = (process.env.NEXT_PUBLIC_ALLOWED_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)

    const isLumenalta = email.endsWith('@lumenalta.com')
    const isWhitelisted = allowedEmails.includes(email.toLowerCase())

    if (!isLumenalta && !isWhitelisted) {
      setError('Clarity is for Lumenalta teammates and invited guests only.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-clarity-bg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold text-clarity-ink">Sign in to Clarity</h1>
        <input
          type="email"
          placeholder="your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-clarity-periwinkle rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clarity-purple"
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-clarity-periwinkle rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clarity-purple"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-clarity-purple text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 hover:brightness-95 transition"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
