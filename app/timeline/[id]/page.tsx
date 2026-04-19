import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TimelineHeader } from '@/components/timelines/TimelineHeader'
import { TimelineEmptyState } from '@/components/timelines/TimelineEmptyState'
import { TimelineNotFound } from '@/components/timelines/TimelineNotFound'

type PageProps = { params: Promise<{ id: string }> }

export default async function TimelinePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if the timeline exists and belongs to this user before rendering the page.
  // RLS ensures the query returns nothing if the ID is wrong or belongs to another user.
  const { data: timeline } = await supabase
    .from('timelines')
    .select('id')
    .eq('id', id)
    .single()

  if (!timeline) {
    return <TimelineNotFound />
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <TimelineHeader timelineId={id} />
      <main className="flex-1 flex flex-col">
        <TimelineEmptyState />
      </main>
    </div>
  )
}
