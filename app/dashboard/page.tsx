import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout-button'
import { DeleteAccountButton } from './delete-account-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-[#1E3A5F] text-white px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold">PM Tool</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200">{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#111827] mb-3">Welcome to PM Tool</h2>
        <p className="text-[#6B7280] text-base mb-8 max-w-sm">
          Create your first timeline to get started. Build a Gantt chart with tasks, dependencies, and automatic deadline tracking.
        </p>

        <button
          disabled
          className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-6 py-3 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
          title="Coming in Issue #4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create your first timeline
        </button>

        <p className="text-xs text-[#9CA3AF] mt-3">Timeline creation coming soon</p>
      </main>

      {/* Footer with danger zone */}
      <div className="fixed bottom-6 right-6">
        <DeleteAccountButton userEmail={user.email ?? ''} />
      </div>
    </div>
  )
}
