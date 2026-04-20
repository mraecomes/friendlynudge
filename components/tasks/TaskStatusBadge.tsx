import type { TaskStatus } from '@/types'

const statusConfig: Record<TaskStatus, { label: string; classes: string }> = {
  not_started: { label: 'Not Started', classes: 'bg-gray-100 text-gray-600' },
  in_progress:  { label: 'In Progress', classes: 'bg-blue-100 text-[#2563EB]' },
  complete:     { label: 'Complete',    classes: 'bg-green-100 text-[#16A34A]' },
  blocked:      { label: 'Blocked',     classes: 'bg-orange-100 text-[#EA580C]' },
}

interface TaskStatusBadgeProps {
  status: TaskStatus
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const { label, classes } = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${classes}`}>
      {label}
    </span>
  )
}
