'use client'

import { Suspense, useState, useEffect, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function UpdatePasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sessionReady, setSessionReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      setSessionReady(true)
      return
    }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) {
        setError('This reset link has expired or has already been used. Please request a new one.')
      } else {
        router.replace('/update-password')
        setSessionReady(true)
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const mismatch = confirm.length > 0 && password !== confirm

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.updateUser({ password })

      if (authError) {
        if (authError.message.includes('expired') || authError.message.includes('invalid')) {
          setError('This reset link has expired. Please request a new one.')
        } else {
          setError('Something went wrong updating your password. Please try again.')
        }
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

  if (!sessionReady && !error) {
    return (
      <div className="text-center py-4">
        <div className="w-6 h-6 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#6B7280]">Verifying reset link…</p>
      </div>
    )
  }

  if (error && !sessionReady) {
    return (
      <div className="text-center">
        <p className="text-sm text-[#DC2626] bg-red-50 border border-red-200 rounded-lg px-3 py-3 mb-4">
          {error}
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-[#2563EB] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-[#111827] mb-2">Set a new password</h2>

      <p className="text-sm text-[#6B7280] mb-6">
        Choose a strong password — at least 8 characters.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />

        <Input
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          error={mismatch ? 'Passwords do not match.' : undefined}
          required
        />

        {error && (
          <p className="text-sm text-[#DC2626] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={password.length < 8 || mismatch}
          className="w-full mt-1"
        >
          {isLoading ? 'Updating password…' : 'Update password'}
        </Button>
      </form>
    </>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={null}>
      <UpdatePasswordForm />
    </Suspense>
  )
}
