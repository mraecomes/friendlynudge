import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TimelineInsert } from '@/types'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to view timelines.' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('timelines')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch timelines:', error)
      return NextResponse.json({ error: 'Failed to load your timelines. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error fetching timelines:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to create a timeline.' }, { status: 401 })
    }

    const body: TimelineInsert = await request.json()

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Timeline name is required.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('timelines')
      .insert({
        name: body.name.trim(),
        start_date: body.start_date ?? null,
        end_date: body.end_date ?? null,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create timeline:', error)
      return NextResponse.json({ error: 'Failed to create your timeline. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Unexpected error creating timeline:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
