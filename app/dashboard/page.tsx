import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout-button'
import { DeleteAccountButton } from './delete-account-button'
import { TimelinesList } from '@/components/timelines/TimelinesList'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#1E3A5F] text-white px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold">PM Tool</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200">{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main>
        <TimelinesList />
      </main>

      <div className="fixed bottom-6 right-6">
        <DeleteAccountButton userEmail={user.email ?? ''} />
      </div>
    </div>
  )
}
