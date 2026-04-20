import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ReorderBody {
  timelineId: string
  orderedIds: string[]
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to reorder tasks.' }, { status: 401 })
    }

    const body: ReorderBody = await request.json()

    if (!body.timelineId || !Array.isArray(body.orderedIds)) {
      return NextResponse.json({ error: 'timelineId and orderedIds are required.' }, { status: 400 })
    }

    // Update each task's position to match its index in the ordered array.
    // RLS ensures the user can only update tasks that belong to their own timelines.
    const updates = body.orderedIds.map((taskId, index) =>
      supabase
        .from('tasks')
        .update({ position: index })
        .eq('id', taskId)
        .eq('timeline_id', body.timelineId)
    )

    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)

    if (failed?.error) {
      console.error('Failed to reorder tasks:', failed.error)
      return NextResponse.json({ error: 'Failed to save the new task order. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error reordering tasks:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
