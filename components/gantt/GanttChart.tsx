'use client'

import { useEffect, useRef } from 'react'
import type { Task, Dependency } from '@/types'
import { toGanttTasks } from '@/lib/utils/gantt'

interface GanttChartProps {
  tasks: Task[]
  dependencies: Dependency[]
}

export function GanttChart({ tasks, dependencies }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ganttRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || tasks.length === 0) return

    const ganttTasks = toGanttTasks(tasks, dependencies) as unknown as Record<string, unknown>[]

    if (ganttRef.current) {
      ganttRef.current.refresh(ganttTasks)
      return
    }

    import('frappe-gantt').then(({ default: Gantt }) => {
      if (!containerRef.current) return

      ganttRef.current = new Gantt(containerRef.current, ganttTasks, {
        view_mode: 'Week',
        scroll_to: 'today',
        today_button: true,
        view_mode_select: true,
        readonly: true,
        popup_on: 'hover',
        popup: (ctx) => {
          const t = ctx.task as typeof ctx.task & { status?: string }
          const statusLabels: Record<string, string> = {
            not_started: 'Not Started',
            in_progress: 'In Progress',
            complete: 'Complete',
            blocked: 'Blocked',
          }
          const statusLabel = t.status ? (statusLabels[t.status] ?? t.status) : ''
          ctx.set_title(t.name)
          ctx.set_subtitle(`${t.start} → ${t.end}`)
          ctx.set_details(
            `Duration: ${t.actual_duration} day${t.actual_duration === 1 ? '' : 's'}${statusLabel ? `<br/>Status: ${statusLabel}` : ''}`,
          )
        },
        bar_height: 32,
        padding: 12,
      })
    })
  }, [tasks, dependencies])

  // Destroy gantt instance when tasks become empty
  useEffect(() => {
    if (tasks.length === 0 && ganttRef.current) {
      ganttRef.current = null
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [tasks.length])

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-[#6B7280] text-sm">
        Add tasks to see the Gantt chart.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto w-full">
      <div ref={containerRef} />
    </div>
  )
}
