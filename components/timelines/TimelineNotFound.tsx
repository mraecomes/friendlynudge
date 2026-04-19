import Link from 'next/link'

export function TimelineNotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-[#111827] mb-2">Timeline not found</h2>
      <p className="text-[#6B7280] text-sm mb-6 max-w-xs">
        This timeline doesn&apos;t exist or you don&apos;t have permission to view it.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#162d4a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>
    </div>
  )
}
