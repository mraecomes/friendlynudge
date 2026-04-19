'use client'

export function TimelineEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-2">No tasks yet</h3>
      <p className="text-[#6B7280] text-sm max-w-xs">
        Add your first task to get started. Tasks will appear here as a list and on the Gantt chart below.
      </p>
    </div>
  )
}
