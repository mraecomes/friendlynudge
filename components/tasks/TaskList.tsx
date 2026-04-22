'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTasksByTimeline, useCreateTask, useReorderTasks } from '@/lib/hooks/useTasks'
import { useDependenciesByTimeline } from '@/lib/hooks/useDependencies'
import { TaskRow } from './TaskRow'
import { Button } from '@/components/ui/button'
import { todayISO, addDays, formatDate } from '@/lib/utils/dates'

interface TaskListProps {
  timelineId: string
}

export function TaskList({ timelineId }: TaskListProps) {
  const { data: tasks, isLoading, isError, error } = useTasksByTimeline(timelineId)
  const { data: dependencies = [] } = useDependenciesByTimeline(timelineId)
  const { mutateAsync: reorderTasks } = useReorderTasks(timelineId)

  const [showPendingRow, setShowPendingRow] = useState(false)
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set())
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleCascade = useCallback((ids: string[]) => {
    if (ids.length === 0) return
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    setHighlightedIds(new Set(ids))
    highlightTimerRef.current = setTimeout(() => setHighlightedIds(new Set()), 1500)
  }, [])

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    }
  }, [])

  function handleAddTask() {
    setShowPendingRow(true)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !tasks) return

    const oldIndex = tasks.findIndex((t) => t.id === active.id)
    const newIndex = tasks.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...tasks]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    try {
      await reorderTasks({ timelineId, orderedIds: reordered.map((t) => t.id) })
    } catch {
      // useReorderTasks onError reverts the cache automatically
    }
  }

  if (isLoading) return <TaskListSkeleton />

  if (isError) {
    return (
      <div className="px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-[#DC2626]">
          {error instanceof Error ? error.message : 'Failed to load tasks. Please refresh the page.'}
        </div>
      </div>
    )
  }

  const hasTasks = tasks && tasks.length > 0
  const showHeaders = hasTasks || showPendingRow

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto w-full">
      {/* Column headers */}
      {showHeaders && (
        <div className="flex items-center gap-2 px-3 mb-2 text-xs font-medium text-[#6B7280] uppercase tracking-wide">
          <div className="w-4 flex-shrink-0" />
          <div className="flex-1">Task Name</div>
          <div className="w-28 flex-shrink-0">Start</div>
          <div className="w-16 flex-shrink-0">Days</div>
          <div className="w-28 flex-shrink-0">End</div>
          <div className="w-32 flex-shrink-0">Status</div>
          <div className="w-36 flex-shrink-0">Depends On</div>
          <div className="w-4 flex-shrink-0" />
        </div>
      )}

      {/* Task rows */}
      {hasTasks ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  timelineId={timelineId}
                  allTasks={tasks}
                  dependencies={dependencies}
                  isHighlighted={highlightedIds.has(task.id)}
                  onCascade={handleCascade}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : !showPendingRow ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#111827] mb-1">No tasks yet</h3>
          <p className="text-sm text-[#6B7280] mb-6">Add your first task to get started building your timeline.</p>
        </div>
      ) : null}

      {/* Pending new task row — local only, no DB record until name is committed */}
      {showPendingRow && (
        <div className={hasTasks ? 'mt-1.5' : ''}>
          <PendingTaskRow
            timelineId={timelineId}
            position={tasks ? tasks.length : 0}
            onDone={() => setShowPendingRow(false)}
          />
        </div>
      )}

      {/* Add task button */}
      <div className="mt-4">
        <Button
          variant="ghost"
          onClick={handleAddTask}
          disabled={showPendingRow}
          className="text-[#6B7280] hover:text-[#111827]"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add task
        </Button>
      </div>
    </div>
  )
}

// ─── PendingTaskRow ───────────────────────────────────────────────────────────

interface PendingTaskRowProps {
  timelineId: string
  position: number
  onDone: () => void
}

function PendingTaskRow({ timelineId, position, onDone }: PendingTaskRowProps) {
  const { mutateAsync: createTask, isPending } = useCreateTask(timelineId)

  const [name, setName] = useState('')
  const [rowError, setRowError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const today = todayISO()
  const defaultEnd = addDays(today, 0)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function commit() {
    const trimmed = name.trim()
    if (!trimmed) {
      onDone()
      return
    }

    setRowError('')
    try {
      await createTask({
        timeline_id: timelineId,
        name: trimmed,
        start_date: today,
        end_date: defaultEnd,
        duration_days: 1,
        status: 'not_started',
        position,
      })
      onDone()
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Failed to create task. Please try again.')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') onDone()
  }

  const inputClass =
    'w-full px-2 py-1 text-sm border border-[#2563EB] rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white text-[#111827] disabled:opacity-50'

  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-[#2563EB] rounded-lg shadow-sm">
        <div className="w-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            placeholder="Task name — press Enter to save, Escape to cancel"
            disabled={isPending}
          />
        </div>
        <div className="w-28 flex-shrink-0 text-sm text-[#9CA3AF] px-1">{formatDate(today)}</div>
        <div className="w-16 flex-shrink-0 text-sm text-[#9CA3AF] px-1">1d</div>
        <div className="w-28 flex-shrink-0 text-sm text-[#9CA3AF] px-1">{formatDate(defaultEnd)}</div>
        <div className="w-32 flex-shrink-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
            Not Started
          </span>
        </div>
        <div className="w-36 flex-shrink-0 text-sm text-[#9CA3AF] px-1">—</div>
        <div className="w-4 flex-shrink-0" />
      </div>

      {rowError && (
        <p className="text-xs text-[#DC2626] px-3 mt-1">{rowError}</p>
      )}
    </div>
  )
}

// ─── TaskListSkeleton ─────────────────────────────────────────────────────────

function TaskListSkeleton() {
  return (
    <div className="px-6 py-6 max-w-5xl mx-auto w-full animate-pulse">
      <div className="flex items-center gap-2 px-3 mb-2">
        <div className="w-4 flex-shrink-0" />
        <div className="h-3 bg-gray-200 rounded w-24 flex-1" />
        <div className="h-3 bg-gray-100 rounded w-28 flex-shrink-0" />
        <div className="h-3 bg-gray-100 rounded w-16 flex-shrink-0" />
        <div className="h-3 bg-gray-100 rounded w-28 flex-shrink-0" />
        <div className="h-3 bg-gray-100 rounded w-32 flex-shrink-0" />
        <div className="h-3 bg-gray-100 rounded w-36 flex-shrink-0" />
        <div className="w-4 flex-shrink-0" />
      </div>
      <div className="space-y-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-lg">
            <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0" />
            <div className="flex-1 h-4 bg-gray-200 rounded" />
            <div className="w-28 h-4 bg-gray-100 rounded flex-shrink-0" />
            <div className="w-16 h-4 bg-gray-100 rounded flex-shrink-0" />
            <div className="w-28 h-4 bg-gray-100 rounded flex-shrink-0" />
            <div className="w-32 h-4 bg-gray-100 rounded flex-shrink-0" />
            <div className="w-36 h-4 bg-gray-100 rounded flex-shrink-0" />
            <div className="w-4 h-4 bg-gray-100 rounded flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
