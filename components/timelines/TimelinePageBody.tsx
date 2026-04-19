'use client'

import { useTimeline } from '@/lib/hooks/useTimelines'
import { TimelineEmptyState } from './TimelineEmptyState'

interface TimelinePageBodyProps {
  timelineId: string
}

export function TimelinePageBody({ timelineId }: TimelinePageBodyProps) {
  const { isLoading } = useTimeline(timelineId)

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-5" />
        <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
        <div className="h-4 bg-gray-100 rounded w-64" />
      </div>
    )
  }

  return <TimelineEmptyState />
}
