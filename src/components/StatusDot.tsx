interface StatusDotProps {
  lastActivityDate: string
  reminderOverdue?: boolean
}

const REF_DATE = new Date('2026-07-01')

export default function StatusDot({ lastActivityDate, reminderOverdue = false }: StatusDotProps) {
  const last = new Date(lastActivityDate)
  const days = Math.floor((REF_DATE.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

  let colorClass: string
  if (reminderOverdue || days >= 14) {
    colorClass = 'bg-danger'
  } else if (days >= 7) {
    colorClass = 'bg-warning'
  } else {
    colorClass = 'bg-success'
  }

  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorClass}`} />
}
