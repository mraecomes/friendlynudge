'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Incorrect email or password. Please check your credentials and try again.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Please confirm your email address before signing in.'
  }
  if (message.includes('Too many requests')) {
    return 'Too many sign-in attempts. Please wait a moment and try again.'
  }
  return 'Something went wrong connecting to the server. Please try again.'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError(mapAuthError(authError.message))
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong connecting to the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-[#111827] mb-6">Sign in to your account</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="text-sm text-[#DC2626] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-[#2563EB] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full mt-1">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="text-sm text-[#6B7280] text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-[#2563EB] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
        >
          Sign up
        </Link>
      </p>
    </>
  )
}
