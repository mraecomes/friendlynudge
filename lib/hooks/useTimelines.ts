'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Timeline, TimelineInsert, TimelineUpdate } from '@/types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const timelineKeys = {
  all: ['timelines'] as const,
  detail: (id: string) => ['timelines', id] as const,
}

// ─── Fetch All Timelines ──────────────────────────────────────────────────────

async function fetchTimelines(): Promise<Timeline[]> {
  const res = await fetch('/api/timelines')
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to load timelines.')
  }
  return res.json()
}

export function useTimelines() {
  return useQuery({
    queryKey: timelineKeys.all,
    queryFn: fetchTimelines,
  })
}

// ─── Fetch Single Timeline ────────────────────────────────────────────────────

async function fetchTimeline(id: string): Promise<Timeline> {
  const res = await fetch(`/api/timelines/${id}`)
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Timeline not found.')
  }
  return res.json()
}

export function useTimeline(id: string) {
  return useQuery({
    queryKey: timelineKeys.detail(id),
    queryFn: () => fetchTimeline(id),
    retry: false,
  })
}

// ─── Create Timeline ──────────────────────────────────────────────────────────

async function createTimeline(payload: TimelineInsert): Promise<Timeline> {
  const res = await fetch('/api/timelines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to create timeline.')
  }
  return res.json()
}

export function useCreateTimeline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTimeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.all })
    },
  })
}

// ─── Update Timeline ──────────────────────────────────────────────────────────

async function updateTimeline({ id, ...payload }: TimelineUpdate & { id: string }): Promise<Timeline> {
  const res = await fetch(`/api/timelines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to update timeline.')
  }
  return res.json()
}

export function useUpdateTimeline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateTimeline,
    onSuccess: (updated) => {
      queryClient.setQueryData(timelineKeys.detail(updated.id), updated)
      queryClient.invalidateQueries({ queryKey: timelineKeys.all })
    },
  })
}

// ─── Delete Timeline ──────────────────────────────────────────────────────────

async function deleteTimeline(id: string): Promise<void> {
  const res = await fetch(`/api/timelines/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to delete timeline.')
  }
}

export function useDeleteTimeline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTimeline,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: timelineKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: timelineKeys.all })
    },
  })
}
