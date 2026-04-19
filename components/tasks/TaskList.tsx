'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTasksByTimeline, useCreateTask, useDeleteTask, useReorderTasks } from '@/lib/hooks/useTasks'
import { TaskRow } from './TaskRow'
import { Button } from '@/components/ui/button'
import { todayISO, addDays } from '@/lib/utils/dates'

interface TaskListProps {
  timelineId: string
}

export function TaskList({ timelineId }: TaskListProps) {
  const { data: tasks, isLoading, isError, error } = useTasksByTimeline(timelineId)
  const { mutateAsync: createTask, isPending: isCreating } = useCreateTask(timelineId)
  const { mutateAsync: deleteTask } = useDeleteTask(timelineId)
  const { mutateAsync: reorderTasks } = useReorderTasks(timelineId)

  const [newTaskId, setNewTaskId] = useState<string | null>(null)
  const [addError, setAddError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  async function handleAddTask() {
    setAddError('')
    const today = todayISO()
    const position = tasks ? tasks.length : 0

    try {
      const newTask = await createTask({
        timeline_id: timelineId,
        name: '',
        start_date: today,
        end_date: addDays(today, 0),
        duration_days: 1,
        status: 'not_started',
        position,
      })
      setNewTaskId(newTask.id)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add task. Please try again.')
    }
  }

  async function handleNewTaskNameBlur(id: string, name: string) {
    setNewTaskId(null)
    if (!name.trim()) {
      // User left name blank — delete the placeholder task
      try {
        await deleteTask(id)
      } catch {
        // Silently ignore — the task will just persist with an empty name until the user edits it
      }
    }
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

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto w-full">
      {/* Column headers */}
      {hasTasks && (
        <div className="flex items-center gap-2 px-3 mb-2 text-xs font-medium text-[#6B7280] uppercase tracking-wide">
          <div className="w-4 flex-shrink-0" />
          <div className="flex-1">Task Name</div>
          <div className="w-28 flex-shrink-0">Start</div>
          <div className="w-16 flex-shrink-0">Days</div>
          <div className="w-28 flex-shrink-0">End</div>
          <div className="w-32 flex-shrink-0">Status</div>
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
                  isNew={task.id === newTaskId}
                  onNewTaskNameBlur={handleNewTaskNameBlur}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
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
      )}

      {/* Add task button + error */}
      <div className="mt-4">
        {addError && (
          <p className="text-xs text-[#DC2626] mb-2">{addError}</p>
        )}
        <Button
          variant="ghost"
          onClick={handleAddTask}
          isLoading={isCreating}
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
            <div className="w-4 h-4 bg-gray-100 rounded flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
