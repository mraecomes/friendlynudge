declare module 'frappe-gantt' {
  export interface FrappeTask {
    id: string
    name: string
    start: string
    end: string
    progress: number
    dependencies: string | string[]
    color?: string
    [key: string]: unknown
  }

  export interface PopupContext {
    task: FrappeTask & {
      _start: Date
      _end: Date
      actual_duration: number
    }
    chart: Gantt
    set_title: (html: string) => void
    set_subtitle: (html: string) => void
    set_details: (html: string) => void
  }

  export interface GanttOptions {
    view_mode?: string
    scroll_to?: string | null
    today_button?: boolean
    view_mode_select?: boolean
    readonly?: boolean
    readonly_dates?: boolean
    readonly_progress?: boolean
    popup_on?: 'click' | 'hover' | 'none'
    popup?: ((ctx: PopupContext) => string | false | void) | false
    bar_height?: number
    padding?: number
    bar_corner_radius?: number
    language?: string
    lines?: 'both' | 'horizontal' | 'vertical' | 'none'
    container_height?: number | 'auto'
    infinite_padding?: boolean
    on_view_change?: (mode: string) => void
  }

  export default class Gantt {
    gantt_start: Date
    gantt_end: Date
    config: { column_width: number; step: number; unit: string }
    constructor(
      wrapper: string | HTMLElement,
      tasks: Record<string, unknown>[],
      options?: GanttOptions
    )
    refresh(tasks: Record<string, unknown>[]): void
    change_view_mode(mode?: string): void
    scroll_current(): void
  }
}
