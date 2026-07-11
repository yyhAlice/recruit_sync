export const TODAY = '2026-07-11'

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateShort(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function formatSalary(n: number): string {
  return `¥${(n / 1_000_000).toFixed(0)}M`
}

export function daysAgo(dateStr: string, ref = TODAY): string {
  const days = Math.floor((new Date(ref).getTime() - new Date(dateStr).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return formatDateShort(dateStr)
}

export function daysUntil(dateStr: string, ref = TODAY): string {
  const days = Math.ceil((new Date(dateStr).getTime() - new Date(ref).getTime()) / 86400000)
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days}d`
}

export function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}
