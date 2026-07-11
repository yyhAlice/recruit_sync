interface Props {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-80 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-danger" style={{ fontSize: '18px' }}>warning</span>
          </div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold bg-danger text-white rounded-lg hover:opacity-90 transition-opacity">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
