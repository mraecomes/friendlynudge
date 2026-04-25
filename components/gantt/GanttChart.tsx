'use client'

import { useEffect, useRef, useState } from 'react'
import type Gantt from 'frappe-gantt'
import type { Task, Dependency } from '@/types'
import { toGanttTasks } from '@/lib/utils/gantt'

interface GanttChartProps {
  tasks: Task[]
  dependencies: Dependency[]
}

// Union-find: groups all transitively connected task IDs into a single chain ID.
// Returns a `find` function that maps any task ID to its chain's root ID.
function buildChainMap(deps: Dependency[]): (id: string) => string {
  const parent = new Map<string, string>()
  const find = (id: string): string => {
    if (!parent.has(id)) parent.set(id, id)
    if (parent.get(id) !== id) parent.set(id, find(parent.get(id)!))
    return parent.get(id)!
  }
  deps.forEach(dep => {
    const ra = find(dep.predecessor_id)
    const rb = find(dep.successor_id)
    if (ra !== rb) parent.set(ra, rb)
  })
  return find
}

export function GanttChart({ tasks, dependencies }: GanttChartProps) {
  const containerRef           = useRef<HTMLDivElement>(null)
  const ganttRef               = useRef<Gantt | null>(null)
  const observerRef            = useRef<MutationObserver | null>(null)
  const setupArrowHitAreasRef  = useRef<() => void>(() => {})
  const setupChainHighlightRef = useRef<() => void>(() => {})
  const highlightAbortRef      = useRef<AbortController | null>(null)
  const [viewMode, setViewMode] = useState<'Day' | 'Week'>('Week')

  useEffect(() => {
    if (!containerRef.current || tasks.length === 0) return

    const ganttTasks = toGanttTasks(tasks, dependencies) as unknown as Record<string, unknown>[]

    if (ganttRef.current) {
      // refresh() wipes $svg.innerHTML, destroying all arrow DOM and event listeners.
      // Re-run both setup passes after the new DOM is ready.
      ganttRef.current.refresh(ganttTasks)
      setTimeout(() => {
        setupArrowHitAreasRef.current()
        setupChainHighlightRef.current()
      }, 60)
      return
    }

    let cancelled = false

    // Shared scroll-to-today logic — used on init and after every view mode change.
    // 50 ms gives frappe-gantt time to finish re-rendering before we read scrollLeft.
    const scrollToToday = () => {
      setTimeout(() => {
        if (cancelled || !containerRef.current || !ganttRef.current) return
        const gantt = ganttRef.current
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        if (now < gantt.gantt_start || now > gantt.gantt_end) return

        const diffMs   = now.getTime() - gantt.gantt_start.getTime()
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        const scrollPos = (diffDays / gantt.config.step) * gantt.config.column_width

        const ganttEl = containerRef.current.querySelector('.gantt-container') as HTMLElement | null
        if (ganttEl) ganttEl.scrollLeft = Math.max(0, scrollPos - ganttEl.clientWidth / 2)
      }, 50)
    }

    // Clone each real arrow path as a wide transparent sibling for a larger hover hit area.
    // Must run after every render because refresh()/change_view_mode() wipe the SVG.
    setupArrowHitAreasRef.current = () => {
      if (!containerRef.current) return
      containerRef.current.querySelectorAll<SVGPathElement>('.gantt .arrow path:not(.arrow-hit)').forEach(arrow => {
        if (arrow.previousElementSibling?.classList.contains('arrow-hit')) return
        const hit = arrow.cloneNode() as SVGPathElement
        hit.style.strokeWidth = '12'
        hit.style.stroke = 'transparent'
        hit.style.fill = 'none'
        hit.classList.add('arrow-hit')
        arrow.parentNode?.insertBefore(hit, arrow)
      })
    }

    // Attach chain-based mouseenter/mouseleave to bar wrappers and arrow-hit paths.
    // AbortController lets us remove all listeners atomically before re-running.
    setupChainHighlightRef.current = () => {
      highlightAbortRef.current?.abort()
      highlightAbortRef.current = new AbortController()
      const { signal } = highlightAbortRef.current

      const svg = containerRef.current?.querySelector('.gantt') as SVGElement | null
      if (!svg) return

      const findChain = buildChainMap(dependencies)
      const allArrows = Array.from(svg.querySelectorAll<SVGPathElement>('.arrow path:not(.arrow-hit)'))

      const bars    = Array.from(svg.querySelectorAll<SVGGElement>('.bar-wrapper[data-id]'))
      const hitPaths = Array.from(svg.querySelectorAll<SVGPathElement>('.arrow-hit[data-from]'))

      const highlight = (taskId: string) => {
        const chain = findChain(taskId)
        allArrows.forEach(a => {
          const from = a.getAttribute('data-from')
          if (from && findChain(from) === chain) {
            a.style.stroke = '#1e3a5f'
            a.style.strokeWidth = '2.5'
          }
        })
      }
      const clear = () => allArrows.forEach(a => {
        a.style.stroke = ''
        a.style.strokeWidth = ''
      })

      bars.forEach(bar => {
        const id = bar.getAttribute('data-id')!
        if (id === '__today_anchor__') return
        bar.addEventListener('mouseenter', () => highlight(id), { signal })
        bar.addEventListener('mouseleave', clear, { signal })
      })

      hitPaths.forEach(hit => {
        const from = hit.getAttribute('data-from')!
        hit.addEventListener('mouseenter', () => highlight(from), { signal })
        hit.addEventListener('mouseleave', clear, { signal })
      })
    }

    // YYYY-MM-DD string → MM/DD/YYYY. Uses the raw task string, not the Date object,
    // because frappe-gantt stores _end as exclusive (one day past the visual end date).
    const fmtStr = (s: string) => {
      const [y, m, d] = s.split('-')
      return `${m}/${d}/${y}`
    }

    // Remaining viewport height so frappe-gantt fills the screen.
    const top = containerRef.current.getBoundingClientRect().top
    const remainingHeight = Math.max(window.innerHeight - top - 32, 300)

    import('frappe-gantt').then(({ default: GanttClass }) => {
      if (cancelled || !containerRef.current || ganttRef.current) return

      ganttRef.current = new GanttClass(containerRef.current, ganttTasks, {
        view_mode: 'Week',
        scroll_to: 'start',
        infinite_padding: false,
        today_button: true,
        view_mode_select: false,
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
          ctx.set_subtitle(`${fmtStr(t.start)} → ${fmtStr(t.end)}`)
          ctx.set_details(
            `Duration: ${t.actual_duration} day${t.actual_duration === 1 ? '' : 's'}${statusLabel ? `<br/>Status: ${statusLabel}` : ''}`,
          )
        },
        bar_height: 32,
        padding: 12,
        container_height: remainingHeight,
        on_view_change: () => {
          scrollToToday()
          setTimeout(() => {
            setupArrowHitAreasRef.current()
            setupChainHighlightRef.current()
          }, 60)
        },
      })

      // Reposition the popup when it overflows the chart's right or bottom edge.
      const ganttEl = containerRef.current.querySelector('.gantt-container') as HTMLElement | null
      const popup   = ganttEl?.querySelector('.popup-wrapper') as HTMLElement | null
      if (ganttEl && popup) {
        observerRef.current = new MutationObserver(() => {
          if (popup.style.display === 'none') return
          const pr = popup.getBoundingClientRect()
          const cr = ganttEl.getBoundingClientRect()
          if (pr.right > cr.right - 8) {
            popup.style.left = `${parseFloat(popup.style.left) - (pr.right - cr.right) - 8}px`
          }
          if (pr.bottom > cr.bottom - 8) {
            popup.style.top = `${parseFloat(popup.style.top) - pr.height - 50}px`
          }
        })
        observerRef.current.observe(ganttEl, {
          subtree: true,
          attributes: true,
          attributeFilter: ['style'],
        })
      }

      scrollToToday()
      setTimeout(() => {
        setupArrowHitAreasRef.current()
        setupChainHighlightRef.current()
      }, 60)
    })

    return () => {
      cancelled = true
      observerRef.current?.disconnect()
      observerRef.current = null
      highlightAbortRef.current?.abort()
      highlightAbortRef.current = null
    }
  }, [tasks, dependencies])

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
    <div className="flex flex-col">
      <div className="flex gap-2 mb-3">
        {(['Day', 'Week'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              ganttRef.current?.change_view_mode(mode)
              setViewMode(mode)
            }}
            className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
              viewMode === mode
                ? 'bg-[#1E3A5F] text-white'
                : 'border border-[#E5E7EB] text-[#6B7280] hover:border-[#1E3A5F] hover:text-[#1E3A5F]'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  )
}
