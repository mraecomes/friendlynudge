'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteAccountButtonProps {
  userEmail: string
}

export function DeleteAccountButton({ userEmail }: DeleteAccountButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/delete-account', { method: 'DELETE' })
      const data: unknown = await response.json()

      if (!response.ok) {
        const message = (data as { error?: string }).error ?? 'Failed to delete account.'
        setError(message)
        return
      }

      router.push('/login')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs text-[#9CA3AF] hover:text-[#DC2626] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] rounded"
      >
        Delete account
      </button>
    )
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-lg p-4 w-72 text-left">
      <h3 className="text-sm font-semibold text-[#111827] mb-1">Delete account?</h3>
      <p className="text-xs text-[#6B7280] mb-1">
        This will permanently delete <span className="font-medium">{userEmail}</span> and all your timelines and tasks.
      </p>
      <p className="text-xs font-semibold text-[#DC2626] mb-4">This cannot be undone.</p>

      {error && (
        <p className="text-xs text-[#DC2626] mb-3">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => { setShowConfirm(false); setError(null) }}
          disabled={isLoading}
          className="flex-1 text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg text-[#374151] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="flex-1 text-xs px-3 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
        >
          {isLoading ? 'Deleting…' : 'Yes, delete everything'}
        </button>
      </div>
    </div>
  )
}
