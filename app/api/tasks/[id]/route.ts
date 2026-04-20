import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TaskUpdate } from '@/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to update a task.' }, { status: 401 })
    }

    const body: TaskUpdate = await request.json()

    if (body.name !== undefined && body.name.trim() === '') {
      return NextResponse.json({ error: 'Task name cannot be empty.' }, { status: 400 })
    }
    if (body.duration_days !== undefined && (!Number.isInteger(body.duration_days) || body.duration_days < 1)) {
      return NextResponse.json({ error: 'Duration must be a positive whole number.' }, { status: 400 })
    }

    const updates: TaskUpdate = {}
    if (body.name !== undefined) updates.name = body.name.trim()
    if (body.start_date !== undefined) updates.start_date = body.start_date
    if (body.end_date !== undefined) updates.end_date = body.end_date
    if (body.duration_days !== undefined) updates.duration_days = body.duration_days
    if (body.status !== undefined) updates.status = body.status
    if (body.position !== undefined) updates.position = body.position

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('Failed to update task:', error)
      return NextResponse.json({ error: 'Failed to update the task. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error updating task:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to delete a task.' }, { status: 401 })
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete task:', error)
      return NextResponse.json({ error: 'Failed to delete the task. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error deleting task:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
