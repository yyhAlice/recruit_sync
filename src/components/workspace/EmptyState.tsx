interface Props {
  icon: string
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="material-symbols-outlined text-slate-200 mb-4" style={{ fontSize: '52px' }}>{icon}</span>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1 max-w-xs">{subtitle}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-4 text-sm font-semibold text-white bg-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          {action.label}
        </button>
      )}
    </div>
  )
}
