'use client'

import { useState } from 'react'
import { useTimelines } from '@/lib/hooks/useTimelines'
import { TimelineCard } from './TimelineCard'
import { CreateTimelineModal } from './CreateTimelineModal'
import { Button } from '@/components/ui/button'

export function TimelinesList() {
  const { data: timelines, isLoading, isError, error } = useTimelines()
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#111827]">Your Timelines</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Timeline
        </Button>
      </div>

      {isLoading && <TimelinesSkeleton />}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-[#DC2626]">
          {error instanceof Error ? error.message : 'Failed to load timelines. Please refresh the page.'}
        </div>
      )}

      {!isLoading && !isError && timelines && timelines.length === 0 && (
        <EmptyState onCreateClick={() => setShowModal(true)} />
      )}

      {!isLoading && !isError && timelines && timelines.length > 0 && (
        <div className="space-y-3">
          {timelines.map((timeline) => (
            <TimelineCard key={timeline.id} timeline={timeline} />
          ))}
        </div>
      )}

      {showModal && <CreateTimelineModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

function TimelinesSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-2">No timelines yet</h3>
      <p className="text-[#6B7280] text-sm mb-6 max-w-xs mx-auto">
        Create your first timeline to start building a Gantt chart with tasks and dependencies.
      </p>
      <Button variant="primary" onClick={onCreateClick}>
        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create your first timeline
      </Button>
    </div>
  )
}
