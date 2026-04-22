import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { detectCycle } from '@/lib/dependencies/graph'
import type { Dependency, DependencyInsert } from '@/types'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to view dependencies.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timelineId = searchParams.get('timeline_id')

    if (!timelineId) {
      return NextResponse.json({ error: 'timeline_id is required.' }, { status: 400 })
    }

    // RLS ensures only the user's own tasks are returned; join through tasks to verify ownership
    const { data, error } = await supabase
      .from('dependencies')
      .select('*, predecessor:tasks!predecessor_id(timeline_id), successor:tasks!successor_id(timeline_id)')
      .eq('predecessor.timeline_id', timelineId)

    if (error) {
      console.error('Failed to fetch dependencies:', error)
      return NextResponse.json({ error: 'Failed to load dependencies. Please try again.' }, { status: 500 })
    }

    // Strip the joined columns — return only Dependency fields
    const deps: Dependency[] = (data ?? []).map(({ id, predecessor_id, successor_id, type }) => ({
      id, predecessor_id, successor_id, type,
    }))

    return NextResponse.json(deps)
  } catch (err) {
    console.error('Unexpected error fetching dependencies:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to create a dependency.' }, { status: 401 })
    }

    const body: DependencyInsert = await request.json()

    if (!body.predecessor_id || !body.successor_id) {
      return NextResponse.json({ error: 'predecessor_id and successor_id are required.' }, { status: 400 })
    }

    if (body.predecessor_id === body.successor_id) {
      return NextResponse.json({ error: 'A task cannot depend on itself.' }, { status: 400 })
    }

    // Fetch the timeline_id for the predecessor task to scope the dependency query
    const { data: predTask, error: predErr } = await supabase
      .from('tasks')
      .select('id, name, timeline_id')
      .eq('id', body.predecessor_id)
      .single()

    if (predErr || !predTask) {
      return NextResponse.json({ error: 'Predecessor task not found.' }, { status: 404 })
    }

    // Fetch all existing dependencies for this timeline
    const { data: existingRaw, error: depsErr } = await supabase
      .from('dependencies')
      .select('*, predecessor:tasks!predecessor_id(timeline_id)')
      .eq('predecessor.timeline_id', predTask.timeline_id)

    if (depsErr) {
      console.error('Failed to fetch existing dependencies:', depsErr)
      return NextResponse.json({ error: 'Failed to validate dependency. Please try again.' }, { status: 500 })
    }

    const existing: Dependency[] = (existingRaw ?? []).map(({ id, predecessor_id, successor_id, type }) => ({
      id, predecessor_id, successor_id, type,
    }))

    // Check for circular dependency
    const cyclePath = detectCycle(existing, body)
    if (cyclePath) {
      // Resolve task names for each ID in the cycle for a clear error message
      const { data: cycleTasks } = await supabase
        .from('tasks')
        .select('id, name')
        .in('id', cyclePath)

      const nameMap = new Map((cycleTasks ?? []).map((t: { id: string; name: string }) => [t.id, t.name]))
      const cycleNames = cyclePath.map((id) => nameMap.get(id) ?? 'Unknown task').join(' → ')

      return NextResponse.json(
        { error: `This would create a circular dependency: ${cycleNames}` },
        { status: 409 }
      )
    }

    // Insert the dependency
    const { data, error } = await supabase
      .from('dependencies')
      .insert({
        predecessor_id: body.predecessor_id,
        successor_id: body.successor_id,
        type: 'finish_to_start',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This dependency already exists.' }, { status: 409 })
      }
      console.error('Failed to create dependency:', error)
      return NextResponse.json({ error: 'Failed to create dependency. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Unexpected error creating dependency:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
