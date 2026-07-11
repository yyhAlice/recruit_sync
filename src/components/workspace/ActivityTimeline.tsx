import { useState } from 'react'
import type { WsActivity, ActivityType } from '../../types/workspace'

interface Props { activities: WsActivity[] }

const TYPE_CONFIG: Record<ActivityType, { icon: string; cls: string; label: string }> = {
  upload:        { icon: 'upload_file',      cls: 'text-primary bg-primary/10',  label: 'Upload'  },
  delete:        { icon: 'delete',           cls: 'text-danger bg-red-50',       label: 'Delete'  },
  delete_folder: { icon: 'folder_delete',    cls: 'text-danger bg-red-50',       label: 'Delete'  },
  rename:        { icon: 'drive_file_rename_outline', cls: 'text-amber-600 bg-amber-50', label: 'Rename' },
  move:          { icon: 'drive_file_move',  cls: 'text-indigo-500 bg-indigo-50',label: 'Move'    },
  create_folder: { icon: 'create_new_folder',cls: 'text-success bg-green-50',   label: 'Folder'  },
  note_update:   { icon: 'edit_note',        cls: 'text-teal-600 bg-teal-50',   label: 'Note'    },
}

type Filter = 'all' | 'upload' | 'delete' | 'rename' | 'move'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',    label: 'All' },
  { value: 'upload', label: 'Uploads' },
  { value: 'delete', label: 'Deletes' },
  { value: 'rename', label: 'Renames' },
  { value: 'move',   label: 'Moves' },
]

function formatTime(ts: string) {
  const d = new Date(ts)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export default function ActivityTimeline({ activities }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = activities.filter((a) => {
    if (filter === 'all')    return true
    if (filter === 'upload') return a.type === 'upload'
    if (filter === 'delete') return a.type === 'delete' || a.type === 'delete_folder'
    if (filter === 'rename') return a.type === 'rename'
    if (filter === 'move')   return a.type === 'move'
    return true
  })

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Activity</p>

      <div className="flex gap-1 mb-3 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${filter === f.value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {filtered.length === 0 && (
          <p className="text-xs text-slate-300 text-center py-6">No activity yet</p>
        )}
        {filtered.slice(0, 30).map((act) => {
          const cfg = TYPE_CONFIG[act.type] ?? { icon: 'info', cls: 'text-slate-400 bg-slate-100', label: act.type }
          return (
            <div key={act.id} className="flex items-start gap-2.5">
              <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 ${cfg.cls}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{cfg.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 leading-snug">{act.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">{act.performedBy} · {formatTime(act.timestamp)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
