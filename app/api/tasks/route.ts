import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TaskInsert } from '@/types'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to view tasks.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timelineId = searchParams.get('timeline_id')

    if (!timelineId) {
      return NextResponse.json({ error: 'timeline_id is required.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('timeline_id', timelineId)
      .order('position', { ascending: true })

    if (error) {
      console.error('Failed to fetch tasks:', error)
      return NextResponse.json({ error: 'Failed to load tasks. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error fetching tasks:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to create a task.' }, { status: 401 })
    }

    const body: TaskInsert = await request.json()

    if (!body.timeline_id) {
      return NextResponse.json({ error: 'timeline_id is required.' }, { status: 400 })
    }
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Task name is required.' }, { status: 400 })
    }
    if (!body.start_date || !body.end_date) {
      return NextResponse.json({ error: 'Start date and end date are required.' }, { status: 400 })
    }
    if (!Number.isInteger(body.duration_days) || body.duration_days < 1) {
      return NextResponse.json({ error: 'Duration must be a positive whole number.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        timeline_id: body.timeline_id,
        name: body.name.trim(),
        start_date: body.start_date,
        end_date: body.end_date,
        duration_days: body.duration_days,
        status: body.status ?? 'not_started',
        position: body.position ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create task:', error)
      return NextResponse.json({ error: 'Failed to create the task. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Unexpected error creating task:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
