const LEGEND_ITEMS = [
  { label: 'Not Started', color: '#9CA3AF' },
  { label: 'In Progress', color: '#2563EB' },
  { label: 'Complete',    color: '#16A34A' },
  { label: 'Blocked',     color: '#EA580C' },
]

export function GanttLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 px-1 py-3">
      {LEGEND_ITEMS.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-[#6B7280]">{label}</span>
        </div>
      ))}
    </div>
  )
}
