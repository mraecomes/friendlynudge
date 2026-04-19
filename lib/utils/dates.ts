// Duration of 1 means start and end are the same day.

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function daysBetween(startStr: string, endStr: string): number {
  const start = new Date(startStr)
  const end = new Date(endStr)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
