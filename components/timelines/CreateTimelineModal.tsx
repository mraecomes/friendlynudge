'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateTimeline } from '@/lib/hooks/useTimelines'

interface CreateTimelineModalProps {
  onClose: () => void
}

export function CreateTimelineModal({ onClose }: CreateTimelineModalProps) {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateTimeline()
  const nameRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')

  const dateError =
    startDate && endDate && endDate < startDate
      ? 'End date must be after start date.'
      : ''

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter a timeline name.')
      return
    }

    if (dateError) return

    try {
      const timeline = await mutateAsync({
        name: name.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
      })
      router.push(`/timeline/${timeline.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#111827]">New Timeline</h2>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#111827] transition-colors p-1 rounded"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={nameRef}
            label="Timeline name"
            placeholder="e.g. Q3 Product Launch"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {dateError && (
            <p className="text-xs text-[#DC2626] -mt-1">{dateError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isPending} disabled={!!dateError} className="flex-1">
              Create Timeline
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
