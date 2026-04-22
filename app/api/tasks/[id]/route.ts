import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeCascade } from '@/lib/dependencies/cascade'
import type { Dependency, Task, TaskUpdate, TaskUpdateResponse } from '@/types'

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

    // Only attempt cascade when dates or duration changed
    const triggersCascade =
      updates.start_date !== undefined || updates.duration_days !== undefined

    if (!triggersCascade) {
      // No cascade needed — use the simple single-table update
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

      const response: TaskUpdateResponse = { task: data as Task, cascaded: [] }
      return NextResponse.json(response)
    }

    // Fetch the current task to build the post-update version for cascade computation
    const { data: currentTask, error: fetchErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !currentTask) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
    }

    // Build the task as it will look after this update (for cascade input)
    const updatedTask: Task = { ...(currentTask as Task), ...updates }

    // Fetch all tasks and dependencies for this timeline
    const [{ data: allTasksRaw }, { data: allDepsRaw }] = await Promise.all([
      supabase.from('tasks').select('*').eq('timeline_id', currentTask.timeline_id),
      supabase
        .from('dependencies')
        .select('*, predecessor:tasks!predecessor_id(timeline_id)')
        .eq('predecessor.timeline_id', currentTask.timeline_id),
    ])

    const allTasks = (allTasksRaw ?? []) as Task[]
    const allDeps: Dependency[] = (allDepsRaw ?? []).map(
      ({ id: depId, predecessor_id, successor_id, type }: { id: string; predecessor_id: string; successor_id: string; type: 'finish_to_start' }) => ({
        id: depId, predecessor_id, successor_id, type,
      })
    )

    const cascadeUpdates = computeCascade(updatedTask, allTasks, allDeps)

    // Execute atomically via the RPC function
    const { data: rpcResult, error: rpcErr } = await supabase.rpc('update_task_with_cascade', {
      p_task_id: id,
      p_task_update: updates,
      p_cascade: cascadeUpdates,
    })

    if (rpcErr || !rpcResult) {
      console.error('Atomic task update failed:', rpcErr)
      return NextResponse.json(
        { error: 'Failed to save — your changes and all recalculated dates were rolled back. Please try again.' },
        { status: 500 }
      )
    }

    const response: TaskUpdateResponse = {
      task: rpcResult.task as Task,
      cascaded: (rpcResult.cascaded ?? []) as Task[],
    }

    return NextResponse.json(response)
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
