'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=/update-password`
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

      if (authError) {
        setError('Something went wrong sending the reset email. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong connecting to the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#111827] mb-2">Check your email</h2>
        <p className="text-sm text-[#6B7280] mb-6">
          A password reset link is on its way to <span className="font-medium text-[#111827]">{email}</span>.
          It expires in 1 hour.
        </p>
        <Link
          href="/login"
          className="text-sm text-[#2563EB] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-[#111827] mb-2">Reset your password</h2>
      <p className="text-sm text-[#6B7280] mb-6">
        Enter your email and we&apos;ll send you a link to set a new password.
      </p>

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

        {error && (
          <p className="text-sm text-[#DC2626] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full mt-1">
          {isLoading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="text-sm text-[#6B7280] text-center mt-6">
        <Link
          href="/login"
          className="text-[#2563EB] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
        >
          Back to sign in
        </Link>
      </p>
    </>
  )
}
