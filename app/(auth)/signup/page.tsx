'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function getPasswordStrength(password: string): { label: string; color: string } | null {
  if (password.length === 0) return null
  if (password.length < 8) return { label: `${password.length}/8 characters minimum`, color: 'text-[#DC2626]' }
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)
  const score = [hasUpper, hasNumber, hasSymbol].filter(Boolean).length
  if (score >= 2) return { label: 'Strong password', color: 'text-[#16A34A]' }
  return { label: 'Good — add numbers or symbols to strengthen', color: 'text-[#EA580C]' }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function mapSignUpError(message: string): string {
  if (message.includes('User already registered') || message.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.'
  }
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 8 characters long.'
  }
  if (message.includes('Unable to validate email address')) {
    return 'Please enter a valid email address.'
  }
  return 'Something went wrong creating your account. Please try again.'
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const emailError = emailTouched && email.length > 0 && !isValidEmail(email)
    ? 'Please enter a valid email address.'
    : undefined

  const passwordStrength = getPasswordStrength(password)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!isValidEmail(email)) {
      setEmailTouched(true)
      return
    }
    if (password.length < 8) return

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({ email, password })

      if (authError) {
        setError(mapSignUpError(authError.message))
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
      <h2 className="text-xl font-semibold text-[#111827] mb-6">Create your account</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          placeholder="you@example.com"
          autoComplete="email"
          error={emailError}
          required
        />

        <div className="flex flex-col gap-1">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
          {passwordStrength && (
            <p className={`text-xs ${passwordStrength.color}`}>{passwordStrength.label}</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-[#DC2626] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={password.length < 8 || !isValidEmail(email)}
          className="w-full mt-1"
        >
          {isLoading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="text-sm text-[#6B7280] text-center mt-6">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-[#2563EB] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
