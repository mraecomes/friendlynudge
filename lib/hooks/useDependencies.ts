'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskKeys } from './useTasks'
import type { Dependency, DependencyInsert } from '@/types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const dependencyKeys = {
  byTimeline: (timelineId: string) => ['dependencies', timelineId] as const,
}

// ─── Fetch Dependencies for a Timeline ───────────────────────────────────────

async function fetchDependenciesByTimeline(timelineId: string): Promise<Dependency[]> {
  const res = await fetch(`/api/dependencies?timeline_id=${timelineId}`)
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to load dependencies.')
  }
  return res.json()
}

export function useDependenciesByTimeline(timelineId: string) {
  return useQuery({
    queryKey: dependencyKeys.byTimeline(timelineId),
    queryFn: () => fetchDependenciesByTimeline(timelineId),
  })
}

// ─── Create Dependency ────────────────────────────────────────────────────────

async function createDependency(payload: DependencyInsert): Promise<Dependency> {
  const res = await fetch('/api/dependencies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to create dependency.')
  }
  return res.json()
}

export function useCreateDependency(timelineId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDependency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dependencyKeys.byTimeline(timelineId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.byTimeline(timelineId) })
    },
  })
}

// ─── Delete Dependency ────────────────────────────────────────────────────────

async function deleteDependency(depId: string): Promise<void> {
  const res = await fetch(`/api/dependencies/${depId}`, { method: 'DELETE' })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to remove dependency.')
  }
}

export function useDeleteDependency(timelineId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDependency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dependencyKeys.byTimeline(timelineId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.byTimeline(timelineId) })
    },
  })
}
