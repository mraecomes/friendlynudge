import type { Dependency, DependencyInsert } from '@/types'

// ─── Cycle Detection ──────────────────────────────────────────────────────────
// Returns the cycle path as task IDs (e.g. ["A","B","C","A"]) if adding the
// proposed dependency would create a cycle, or null if the graph stays acyclic.

export function detectCycle(
  existingDeps: Dependency[],
  proposed: DependencyInsert
): string[] | null {
  // Build adjacency list: predecessor → successors
  const adj = new Map<string, string[]>()
  for (const dep of existingDeps) {
    if (!adj.has(dep.predecessor_id)) adj.set(dep.predecessor_id, [])
    adj.get(dep.predecessor_id)!.push(dep.successor_id)
  }

  // Adding proposed dep means: proposed.predecessor_id → proposed.successor_id
  // A cycle exists if proposed.successor_id can already reach proposed.predecessor_id.
  // We DFS from proposed.successor_id looking for proposed.predecessor_id.
  const target = proposed.predecessor_id
  const start = proposed.successor_id

  const visited = new Set<string>()
  const path: string[] = []

  function dfs(nodeId: string): boolean {
    if (nodeId === target) {
      path.push(nodeId)
      return true
    }
    if (visited.has(nodeId)) return false
    visited.add(nodeId)
    path.push(nodeId)
    for (const neighbor of adj.get(nodeId) ?? []) {
      if (dfs(neighbor)) return true
    }
    path.pop()
    return false
  }

  if (dfs(start)) {
    // Prepend the proposed predecessor so the cycle reads: predecessor → ... → predecessor
    return [proposed.predecessor_id, ...path]
  }
  return null
}

// ─── Downstream IDs ───────────────────────────────────────────────────────────
// Returns all task IDs that transitively depend on the given task (BFS).

export function getDownstreamIds(taskId: string, deps: Dependency[]): string[] {
  const adj = new Map<string, string[]>()
  for (const dep of deps) {
    if (!adj.has(dep.predecessor_id)) adj.set(dep.predecessor_id, [])
    adj.get(dep.predecessor_id)!.push(dep.successor_id)
  }

  const result: string[] = []
  const queue = [...(adj.get(taskId) ?? [])]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const id = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    result.push(id)
    for (const next of adj.get(id) ?? []) {
      if (!visited.has(next)) queue.push(next)
    }
  }

  return result
}

// ─── Topological Sort ─────────────────────────────────────────────────────────
// Returns task IDs ordered so that every predecessor appears before its successors.
// Assumes the graph is acyclic (call detectCycle first before mutating the graph).

export function topologicalSort(taskIds: string[], deps: Dependency[]): string[] {
  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()

  for (const id of taskIds) {
    inDegree.set(id, 0)
    adj.set(id, [])
  }

  for (const dep of deps) {
    if (!inDegree.has(dep.successor_id) || !inDegree.has(dep.predecessor_id)) continue
    adj.get(dep.predecessor_id)!.push(dep.successor_id)
    inDegree.set(dep.successor_id, (inDegree.get(dep.successor_id) ?? 0) + 1)
  }

  const queue = taskIds.filter((id) => inDegree.get(id) === 0)
  const sorted: string[] = []

  while (queue.length > 0) {
    const id = queue.shift()!
    sorted.push(id)
    for (const neighbor of adj.get(id) ?? []) {
      const deg = (inDegree.get(neighbor) ?? 1) - 1
      inDegree.set(neighbor, deg)
      if (deg === 0) queue.push(neighbor)
    }
  }

  return sorted
}
