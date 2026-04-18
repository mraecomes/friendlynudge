'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
