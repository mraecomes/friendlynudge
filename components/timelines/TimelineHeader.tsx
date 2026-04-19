'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTimeline, useUpdateTimeline, useDeleteTimeline } from '@/lib/hooks/useTimelines'

interface TimelineHeaderProps {
  timelineId: string
}

export function TimelineHeader({ timelineId }: TimelineHeaderProps) {
  const router = useRouter()
  const { data: timeline, isLoading, isError } = useTimeline(timelineId)
  const { mutateAsync: updateTimeline } = useUpdateTimeline()
  const { mutateAsync: deleteTimeline, isPending: isDeleting } = useDeleteTimeline()

  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [saveError, setSaveError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  function startEditing() {
    if (!timeline) return
    setEditedName(timeline.name)
    setSaveError('')
    setIsEditing(true)
  }

  async function commitEdit() {
    if (!timeline || editedName.trim() === timeline.name) {
      setIsEditing(false)
      return
    }
    if (!editedName.trim()) {
      setSaveError('Timeline name cannot be empty.')
      return
    }
    try {
      await updateTimeline({ id: timelineId, name: editedName.trim() })
      setIsEditing(false)
      setSaveError('')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    }
  }

  function cancelEdit() {
    setIsEditing(false)
    setSaveError('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  async function handleDelete() {
    if (!timeline) return
    const confirmed = window.confirm(
      `Are you sure you want to delete "${timeline.name}"?\n\nThis will permanently remove this timeline and all its tasks. This cannot be undone.`
    )
    if (!confirmed) return
    try {
      await deleteTimeline(timelineId)
      router.push('/dashboard')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete timeline. Please try again.')
    }
  }

  return (
    <header className="bg-[#1E3A5F] text-white px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: back link + timeline name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="text-blue-300 hover:text-white transition-colors flex-shrink-0"
            aria-label="Back to dashboard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {isLoading && (
            <div className="h-7 w-48 bg-white/10 rounded animate-pulse" />
          )}

          {isError && (
            <span className="text-red-300 text-sm">Timeline not found</span>
          )}

          {timeline && !isEditing && (
            <button
              onClick={startEditing}
              className="text-xl font-semibold truncate hover:text-blue-200 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1"
              title="Click to rename"
            >
              {timeline.name}
            </button>
          )}

          {timeline && isEditing && (
            <div className="flex flex-col gap-1">
              <input
                ref={inputRef}
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                className="text-xl font-semibold bg-white/10 text-white border border-blue-400 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[200px]"
              />
              {saveError && (
                <p className="text-xs text-red-300">{saveError}</p>
              )}
            </div>
          )}
        </div>

        {/* Right: delete button */}
        {timeline && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-shrink-0 flex items-center gap-1.5 text-sm text-blue-300 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded px-2 py-1"
            title="Delete timeline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </header>
  )
}
