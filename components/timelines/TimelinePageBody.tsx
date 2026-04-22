'use client'

import { useTimeline } from '@/lib/hooks/useTimelines'
import { useTasksByTimeline } from '@/lib/hooks/useTasks'
import { useDependenciesByTimeline } from '@/lib/hooks/useDependencies'
import { TaskList } from '@/components/tasks/TaskList'
import { GanttChart } from '@/components/gantt/GanttChart'
import { GanttLegend } from '@/components/gantt/GanttLegend'

interface TimelinePageBodyProps {
  timelineId: string
}

export function TimelinePageBody({ timelineId }: TimelinePageBodyProps) {
  const { isLoading: timelineLoading } = useTimeline(timelineId)
  const { data: tasks, isLoading: tasksLoading } = useTasksByTimeline(timelineId)
  const { data: dependencies, isLoading: depsLoading } = useDependenciesByTimeline(timelineId)

  if (timelineLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-5" />
        <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
        <div className="h-4 bg-gray-100 rounded w-64" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <TaskList timelineId={timelineId} />

      <div className="border-t border-[#E5E7EB] mt-2 px-4">
        <GanttLegend />

        {tasksLoading || depsLoading ? (
          <div className="animate-pulse space-y-2 pb-6">
            <div className="h-8 bg-gray-100 rounded w-full" />
            <div className="h-8 bg-gray-100 rounded w-5/6" />
            <div className="h-8 bg-gray-100 rounded w-4/6" />
          </div>
        ) : (
          <GanttChart
            tasks={tasks ?? []}
            dependencies={dependencies ?? []}
          />
        )}
      </div>
    </div>
  )
}
