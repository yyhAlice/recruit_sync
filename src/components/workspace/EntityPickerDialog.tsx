import { useState } from 'react'
import { Search, X, type LucideIcon } from 'lucide-react'

interface Row {
  id: string
  name: string
  subtitle: string
  lastUpdated: string
  icon: LucideIcon
}

interface Props {
  category: 'clients' | 'jobs' | 'candidates'
  rows: Row[]
  onPick: (id: string, hasWorkspace: boolean) => void
  onClose: () => void
}

const LABELS = { clients: 'Client', jobs: 'Job', candidates: 'Candidate' }

export default function EntityPickerDialog({ category, rows, onPick, onClose }: Props) {
  const [search, setSearch] = useState('')
  const label = LABELS[category]

  const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.subtitle.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-96 max-h-[32rem] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-sm font-bold text-slate-800">New {label} Workspace</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}s…`}
              className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400 min-w-0"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <p className="text-xs text-slate-400">No matches</p>
            </div>
          ) : (
            filtered.map((r) => {
              const hasWs = r.lastUpdated !== ''
              return (
                <button
                  key={r.id}
                  onClick={() => onPick(r.id, hasWs)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <r.icon size={14} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{r.name}</p>
                    <p className="text-xs text-slate-400 truncate">{r.subtitle}</p>
                  </div>
                  {hasWs && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/8 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      Has workspace
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
