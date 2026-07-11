import type { CVStatus } from '../../types/cv'

const config: Record<CVStatus, { cls: string; icon: string; label: string }> = {
  pending:    { cls: 'bg-slate-100 text-slate-600',  icon: 'schedule',      label: 'Pending'    },
  processing: { cls: 'bg-blue-100 text-blue-700',    icon: 'autorenew',     label: 'Processing' },
  completed:  { cls: 'bg-green-100 text-success',    icon: 'check_circle',  label: 'Completed'  },
  failed:     { cls: 'bg-red-100 text-danger',       icon: 'error',         label: 'Failed'     },
}

export default function CVStatusBadge({ status }: { status: CVStatus }) {
  const { cls, icon, label } = config[status]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{icon}</span>
      {label}
    </span>
  )
}
