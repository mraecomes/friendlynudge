// ─── Task Status ─────────────────────────────────────────────────────────────

export type TaskStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked'

// ─── Database Row Types ───────────────────────────────────────────────────────
// These match the Supabase table schemas exactly (see CLAUDE.md for DDL).

export interface Timeline {
  id: string
  user_id: string
  name: string
  start_date: string | null  // ISO date string: YYYY-MM-DD
  end_date: string | null    // ISO date string: YYYY-MM-DD
  created_at: string         // ISO timestamp
  updated_at: string         // ISO timestamp
}

export interface Task {
  id: string
  timeline_id: string
  name: string
  start_date: string         // ISO date string: YYYY-MM-DD
  end_date: string           // ISO date string: YYYY-MM-DD
  duration_days: number
  status: TaskStatus
  position: number
  created_at: string         // ISO timestamp
  updated_at: string         // ISO timestamp
}

export interface Dependency {
  id: string
  predecessor_id: string     // Task that must finish first
  successor_id: string       // Task that is blocked until predecessor finishes
  type: 'finish_to_start'    // Only FS supported in MVP
}

// ─── Insert / Update Payloads ─────────────────────────────────────────────────
// Omit server-generated fields when creating or updating records.

export type TimelineInsert = Omit<Timeline, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type TimelineUpdate = Partial<TimelineInsert>

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>
export type TaskUpdate = Partial<Omit<TaskInsert, 'timeline_id'>>

export type DependencyInsert = Omit<Dependency, 'id'>
