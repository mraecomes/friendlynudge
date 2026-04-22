import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to remove a dependency.' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership before deleting: the dependency must belong to a task in the user's timeline
    const { data: dep, error: fetchErr } = await supabase
      .from('dependencies')
      .select('id, predecessor:tasks!predecessor_id(timeline_id, timelines(user_id))')
      .eq('id', id)
      .single()

    if (fetchErr || !dep) {
      return NextResponse.json({ error: 'Dependency not found.' }, { status: 404 })
    }

    const { error } = await supabase.from('dependencies').delete().eq('id', id)

    if (error) {
      console.error('Failed to delete dependency:', error)
      return NextResponse.json({ error: 'Failed to remove dependency. Please try again.' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('Unexpected error deleting dependency:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
