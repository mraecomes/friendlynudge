'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Task, TaskInsert, TaskUpdate, TaskUpdateResponse } from '@/types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const taskKeys = {
  byTimeline: (timelineId: string) => ['tasks', timelineId] as const,
}

// ─── Fetch Tasks for a Timeline ───────────────────────────────────────────────

async function fetchTasksByTimeline(timelineId: string): Promise<Task[]> {
  const res = await fetch(`/api/tasks?timeline_id=${timelineId}`)
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to load tasks.')
  }
  return res.json()
}

export function useTasksByTimeline(timelineId: string) {
  return useQuery({
    queryKey: taskKeys.byTimeline(timelineId),
    queryFn: () => fetchTasksByTimeline(timelineId),
  })
}

// ─── Create Task ──────────────────────────────────────────────────────────────

async function createTask(payload: TaskInsert): Promise<Task> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to create task.')
  }
  return res.json()
}

export function useCreateTask(timelineId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byTimeline(timelineId) })
    },
  })
}

// ─── Update Task ──────────────────────────────────────────────────────────────

async function updateTask({ id, ...payload }: TaskUpdate & { id: string }): Promise<TaskUpdateResponse> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to update task.')
  }
  return res.json()
}

export function useUpdateTask(timelineId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateTask,
    onSuccess: ({ task, cascaded }) => {
      queryClient.setQueryData<Task[]>(taskKeys.byTimeline(timelineId), (old) => {
        if (!old) return old
        const updatedMap = new Map([task, ...cascaded].map((t) => [t.id, t]))
        return old.map((t) => updatedMap.get(t.id) ?? t)
      })
    },
  })
}

// ─── Delete Task ──────────────────────────────────────────────────────────────

async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to delete task.')
  }
}

export function useDeleteTask(timelineId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<Task[]>(taskKeys.byTimeline(timelineId), (old) =>
        old ? old.filter((t) => t.id !== deletedId) : old
      )
      // Cascade delete in DB removes dependency rows; invalidate the client cache too
      queryClient.invalidateQueries({ queryKey: ['dependencies', timelineId] })
    },
  })
}

// ─── Reorder Tasks ────────────────────────────────────────────────────────────

interface ReorderPayload {
  timelineId: string
  orderedIds: string[]
}

async function reorderTasks(payload: ReorderPayload): Promise<void> {
  const res = await fetch('/api/tasks/reorder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'Failed to save new task order.')
  }
}

export function useReorderTasks(timelineId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderTasks,
    onMutate: async ({ orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.byTimeline(timelineId) })
      const previous = queryClient.getQueryData<Task[]>(taskKeys.byTimeline(timelineId))
      queryClient.setQueryData<Task[]>(taskKeys.byTimeline(timelineId), (old) => {
        if (!old) return old
        const map = new Map(old.map((t) => [t.id, t]))
        return orderedIds
          .map((id, index) => {
            const task = map.get(id)
            return task ? { ...task, position: index } : null
          })
          .filter((t): t is Task => t !== null)
      })
      return { previous }
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(taskKeys.byTimeline(timelineId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byTimeline(timelineId) })
    },
  })
}
