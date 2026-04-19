import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TimelineUpdate } from '@/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to view this timeline.' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('timelines')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Timeline not found.' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error fetching timeline:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to update this timeline.' }, { status: 401 })
    }

    const body: TimelineUpdate = await request.json()

    if (body.name !== undefined && body.name.trim() === '') {
      return NextResponse.json({ error: 'Timeline name cannot be empty.' }, { status: 400 })
    }

    const updates: TimelineUpdate = {}
    if (body.name !== undefined) updates.name = body.name.trim()
    if (body.start_date !== undefined) updates.start_date = body.start_date
    if (body.end_date !== undefined) updates.end_date = body.end_date

    const { data, error } = await supabase
      .from('timelines')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('Failed to update timeline:', error)
      return NextResponse.json({ error: 'Failed to update the timeline. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error updating timeline:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to delete this timeline.' }, { status: 401 })
    }

    const { error } = await supabase
      .from('timelines')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete timeline:', error)
      return NextResponse.json({ error: 'Failed to delete the timeline. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error deleting timeline:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
