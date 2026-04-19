'use client'

import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useUpdateTask, useDeleteTask } from '@/lib/hooks/useTasks'
import { TaskStatusBadge } from './TaskStatusBadge'
import { addDays, daysBetween } from '@/lib/utils/dates'
import type { Task, TaskStatus, TaskUpdate } from '@/types'

type ActiveField = 'name' | 'start_date' | 'duration_days' | 'end_date' | 'status' | null

interface TaskRowProps {
  task: Task
  timelineId: string
  isNew?: boolean
  onNewTaskNameBlur?: (id: string, name: string) => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete',    label: 'Complete' },
  { value: 'blocked',     label: 'Blocked' },
]

export function TaskRow({ task, timelineId, isNew = false, onNewTaskNameBlur }: TaskRowProps) {
  const { mutateAsync: updateTask, isPending: isSaving } = useUpdateTask(timelineId)
  const { mutateAsync: deleteTask } = useDeleteTask(timelineId)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [activeField, setActiveField] = useState<ActiveField>(isNew ? 'name' : null)
  const [localValues, setLocalValues] = useState({
    name: task.name,
    start_date: task.start_date,
    duration_days: String(task.duration_days),
    end_date: task.end_date,
    status: task.status,
  })
  const [rowError, setRowError] = useState('')

  const nameInputRef = useRef<HTMLInputElement>(null)

  // Sync local values when task data changes from the server (e.g. after reorder)
  useEffect(() => {
    if (activeField === null) {
      setLocalValues({
        name: task.name,
        start_date: task.start_date,
        duration_days: String(task.duration_days),
        end_date: task.end_date,
        status: task.status,
      })
    }
  }, [task, activeField])

  useEffect(() => {
    if (activeField === 'name') nameInputRef.current?.focus()
  }, [activeField])

  async function commit(updates: TaskUpdate) {
    setRowError('')
    try {
      await updateTask({ id: task.id, ...updates })
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
      // Revert local display to last known saved values
      setLocalValues({
        name: task.name,
        start_date: task.start_date,
        duration_days: String(task.duration_days),
        end_date: task.end_date,
        status: task.status,
      })
    }
  }

  function cancelField(field: ActiveField) {
    setActiveField(null)
    setLocalValues({
      name: task.name,
      start_date: task.start_date,
      duration_days: String(task.duration_days),
      end_date: task.end_date,
      status: task.status,
    })
    setRowError('')
  }

  // ─── Name ─────────────────────────────────────────────────────────────────

  function handleNameBlur() {
    const trimmed = localValues.name.trim()
    setActiveField(null)

    if (isNew && onNewTaskNameBlur) {
      onNewTaskNameBlur(task.id, trimmed)
      return
    }

    if (!trimmed) {
      setLocalValues((v) => ({ ...v, name: task.name }))
      setRowError('Task name cannot be empty.')
      return
    }

    if (trimmed === task.name) return
    commit({ name: trimmed })
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') nameInputRef.current?.blur()
    if (e.key === 'Escape') cancelField('name')
  }

  // ─── Start Date ───────────────────────────────────────────────────────────

  function handleStartDateBlur() {
    setActiveField(null)
    const newStart = localValues.start_date
    if (!newStart || newStart === task.start_date) return

    const dur = parseInt(localValues.duration_days, 10)
    const newEnd = addDays(newStart, dur - 1)
    setLocalValues((v) => ({ ...v, end_date: newEnd }))
    commit({ start_date: newStart, end_date: newEnd, duration_days: dur })
  }

  // ─── Duration ─────────────────────────────────────────────────────────────

  function handleDurationBlur() {
    setActiveField(null)
    const dur = parseInt(localValues.duration_days, 10)

    if (isNaN(dur) || dur < 1) {
      setLocalValues((v) => ({ ...v, duration_days: String(task.duration_days) }))
      setRowError('Duration must be a positive whole number.')
      return
    }

    const newEnd = addDays(localValues.start_date, dur - 1)
    setLocalValues((v) => ({ ...v, end_date: newEnd }))

    if (dur === task.duration_days) return
    commit({ duration_days: dur, end_date: newEnd })
  }

  function handleDurationKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') e.currentTarget.blur()
    if (e.key === 'Escape') cancelField('duration_days')
  }

  // ─── End Date ─────────────────────────────────────────────────────────────

  function handleEndDateBlur() {
    setActiveField(null)
    const newEnd = localValues.end_date
    if (!newEnd || newEnd === task.end_date) return

    const start = localValues.start_date
    const newDur = daysBetween(start, newEnd) + 1

    if (newDur < 1) {
      setLocalValues((v) => ({ ...v, end_date: task.end_date }))
      setRowError('End date must be on or after start date.')
      return
    }

    setLocalValues((v) => ({ ...v, duration_days: String(newDur) }))
    commit({ end_date: newEnd, duration_days: newDur })
  }

  // ─── Status ───────────────────────────────────────────────────────────────

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as TaskStatus
    setLocalValues((v) => ({ ...v, status: newStatus }))
    setActiveField(null)
    if (newStatus === task.status) return
    commit({ status: newStatus })
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete() {
    const name = task.name.trim() || 'this task'
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`)
    if (!confirmed) return
    try {
      await deleteTask(task.id)
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Failed to delete task. Please try again.')
    }
  }

  // ─── Shared input class ───────────────────────────────────────────────────

  const inputClass =
    'w-full px-2 py-1 text-sm border border-[#2563EB] rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white text-[#111827]'

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`group flex items-center gap-2 px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F8FAFC] transition-colors ${isSaving ? 'opacity-60' : ''}`}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 text-[#9CA3AF] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity focus-visible:opacity-100 focus-visible:outline-none"
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a1 1 0 100-2 1 1 0 000 2zM13 4a1 1 0 100-2 1 1 0 000 2zM7 9a1 1 0 100-2 1 1 0 000 2zM13 9a1 1 0 100-2 1 1 0 000 2zM7 14a1 1 0 100-2 1 1 0 000 2zM13 14a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </button>

        {/* Name */}
        <div className="flex-1 min-w-0">
          {activeField === 'name' ? (
            <input
              ref={nameInputRef}
              className={inputClass}
              value={localValues.name}
              onChange={(e) => setLocalValues((v) => ({ ...v, name: e.target.value }))}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              placeholder="Task name"
            />
          ) : (
            <button
              onClick={() => setActiveField('name')}
              className="w-full text-left text-sm text-[#111827] truncate hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1"
            >
              {localValues.name || <span className="text-[#9CA3AF]">Untitled task</span>}
            </button>
          )}
        </div>

        {/* Start date */}
        <div className="w-28 flex-shrink-0">
          {activeField === 'start_date' ? (
            <input
              type="date"
              className={inputClass}
              value={localValues.start_date}
              onChange={(e) => setLocalValues((v) => ({ ...v, start_date: e.target.value }))}
              onBlur={handleStartDateBlur}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setActiveField('start_date')}
              className="w-full text-left text-sm text-[#374151] hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1"
            >
              {localValues.start_date}
            </button>
          )}
        </div>

        {/* Duration */}
        <div className="w-16 flex-shrink-0">
          {activeField === 'duration_days' ? (
            <input
              type="number"
              min={1}
              className={inputClass}
              value={localValues.duration_days}
              onChange={(e) => setLocalValues((v) => ({ ...v, duration_days: e.target.value }))}
              onBlur={handleDurationBlur}
              onKeyDown={handleDurationKeyDown}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setActiveField('duration_days')}
              className="w-full text-left text-sm text-[#374151] hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1"
            >
              {localValues.duration_days}d
            </button>
          )}
        </div>

        {/* End date */}
        <div className="w-28 flex-shrink-0">
          {activeField === 'end_date' ? (
            <input
              type="date"
              className={inputClass}
              value={localValues.end_date}
              onChange={(e) => setLocalValues((v) => ({ ...v, end_date: e.target.value }))}
              onBlur={handleEndDateBlur}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setActiveField('end_date')}
              className="w-full text-left text-sm text-[#374151] hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1"
            >
              {localValues.end_date}
            </button>
          )}
        </div>

        {/* Status */}
        <div className="w-32 flex-shrink-0">
          {activeField === 'status' ? (
            <select
              className={`${inputClass} cursor-pointer`}
              value={localValues.status}
              onChange={handleStatusChange}
              onBlur={() => setActiveField(null)}
              autoFocus
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setActiveField('status')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
            >
              <TaskStatusBadge status={localValues.status} />
            </button>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="flex-shrink-0 text-[#9CA3AF] opacity-0 group-hover:opacity-100 hover:text-[#DC2626] transition-all focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded p-0.5"
          aria-label="Delete task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {rowError && (
        <p className="text-xs text-[#DC2626] px-3 mt-1">{rowError}</p>
      )}
    </div>
  )
}
