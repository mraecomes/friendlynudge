'use client'

import Link from 'next/link'
import type { Timeline } from '@/types'
import { formatDate } from '@/lib/utils/dates'

interface TimelineCardProps {
  timeline: Timeline
}

export function TimelineCard({ timeline }: TimelineCardProps) {
  const createdAt = formatDate(timeline.created_at.split('T')[0])

  return (
    <Link
      href={`/timeline/${timeline.id}`}
      className="block bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#2563EB] transition-all duration-150 group"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
          <svg className="w-5 h-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#111827] truncate group-hover:text-[#2563EB] transition-colors">
            {timeline.name}
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">Created {createdAt}</p>
          {(timeline.start_date || timeline.end_date) && (
            <p className="text-xs text-[#6B7280] mt-0.5">
              {timeline.start_date ? formatDate(timeline.start_date) : '—'} → {timeline.end_date ? formatDate(timeline.end_date) : '—'}
            </p>
          )}
        </div>
        <svg className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2563EB] transition-colors flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
