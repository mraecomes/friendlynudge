import { addDays } from '@/lib/utils/dates'
import { getDownstreamIds, topologicalSort } from './graph'
import type { Dependency, Task, TaskUpdate } from '@/types'

// ─── Cascade Recalculation ────────────────────────────────────────────────────
// Given a task whose start_date or duration_days just changed, returns the
// full set of TaskUpdates needed to keep all downstream successors in sync.
//
// Rule (Finish-to-Start): successor.start_date = predecessor.end_date + 1 day.
// Duration is preserved; only start_date and end_date shift.

export function computeCascade(
  changedTask: Task,
  allTasks: Task[],
  deps: Dependency[]
): (TaskUpdate & { id: string })[] {
  const downstreamIds = getDownstreamIds(changedTask.id, deps)
  if (downstreamIds.length === 0) return []

  const taskMap = new Map(allTasks.map((t) => [t.id, { ...t }]))

  // Apply the changed task's new values into the working map
  taskMap.set(changedTask.id, changedTask)

  // Build the predecessor map: successorId → predecessorId
  const predecessorOf = new Map<string, string>()
  for (const dep of deps) {
    predecessorOf.set(dep.successor_id, dep.predecessor_id)
  }

  // Sort downstream tasks so predecessors are processed first
  const allIds = allTasks.map((t) => t.id)
  const sortedAll = topologicalSort(allIds, deps)
  const sortedDownstream = sortedAll.filter((id) => downstreamIds.includes(id))

  const updates: (TaskUpdate & { id: string })[] = []

  for (const id of sortedDownstream) {
    const predId = predecessorOf.get(id)
    if (!predId) continue

    const predecessor = taskMap.get(predId)
    const successor = taskMap.get(id)
    if (!predecessor || !successor) continue

    const newStart = addDays(predecessor.end_date, 1)
    const newEnd = addDays(newStart, successor.duration_days - 1)

    const updated: Task = { ...successor, start_date: newStart, end_date: newEnd }
    taskMap.set(id, updated)

    updates.push({ id, start_date: newStart, end_date: newEnd, duration_days: successor.duration_days })
  }

  return updates
}
