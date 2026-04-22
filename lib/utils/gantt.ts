import type { Task, Dependency, GanttTask, TaskStatus } from '@/types'

const STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: '#9CA3AF',
  in_progress: '#2563EB',
  complete:    '#16A34A',
  blocked:     '#EA580C',
}

export function toGanttTasks(tasks: Task[], deps: Dependency[]): GanttTask[] {
  const predecessorMap = new Map<string, string[]>()
  for (const dep of deps) {
    const existing = predecessorMap.get(dep.successor_id) ?? []
    predecessorMap.set(dep.successor_id, [...existing, dep.predecessor_id])
  }

  return [...tasks]
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
}
