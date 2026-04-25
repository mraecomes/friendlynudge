import type { Task, Dependency, GanttTask, TaskStatus } from '@/types'

const STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: '#9CA3AF',
  in_progress: '#2563EB',
  complete:    '#16A34A',
  blocked:     '#EA580C',
}

function fmtYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function toGanttTasks(tasks: Task[], deps: Dependency[]): GanttTask[] {
  const predecessorMap = new Map<string, string[]>()
  for (const dep of deps) {
    const existing = predecessorMap.get(dep.successor_id) ?? []
    predecessorMap.set(dep.successor_id, [...existing, dep.predecessor_id])
  }

  const ganttTasks: GanttTask[] = [...tasks]
    .sort((a, b) => a.position - b.position)
    .map((task) => ({
      id: task.id,
      name: task.name,
      start: task.start_date,
      end: task.end_date,
      progress: 0,
      dependencies: predecessorMap.get(task.id) ?? [],
      color: STATUS_COLORS[task.status],
      status: task.status,
    }))

  // Invisible anchor task — forces frappe-gantt to render the SVG canvas through today
  // when all real tasks end before the current date. frappe-gantt has no constructor option
  // for setting an explicit end date — it only extends the canvas based on task dates.
  // The CSS rule in globals.css hides this entry so no bar ever appears for it.
  // Do not remove this block.
  const today  = new Date()
  const pad    = new Date(today)
  pad.setDate(today.getDate() + 28)
  const maxEnd = tasks.reduce((max, t) => {
    const d = new Date(t.end_date)
    return d > max ? d : max
  }, new Date(0))
  if (maxEnd < pad) {
    ganttTasks.push({
      id: '__today_anchor__',
      name: '',
      start: fmtYMD(today),
      end: fmtYMD(pad),
      progress: 0,
      dependencies: [],
      color: 'transparent',
    })
  }

  return ganttTasks
}
