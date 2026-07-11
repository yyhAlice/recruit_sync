import { useState, useRef, useEffect } from 'react'
import type { WsFolder } from '../../types/workspace'

interface Props {
  folder: WsFolder
  fileCount: number
  compact?: boolean
  onOpen: () => void
  onRename: () => void
  onDelete: () => void
  onMove: () => void
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7)  return `${days} days ago`
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

const MENU_ITEMS: { icon: string; label: string; key: string; danger?: boolean }[] = [
  { icon: 'folder_open',     label: 'Open',    key: 'open'   },
  { icon: 'edit',            label: 'Rename',  key: 'rename' },
  { icon: 'drive_file_move', label: 'Move',    key: 'move'   },
  { icon: 'delete',          label: 'Delete',  key: 'delete', danger: true },
]

export default function FolderCard({ folder, fileCount, compact = false, onOpen, onRename, onDelete, onMove }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  function handleAction(key: string) {
    setMenuOpen(false)
    if (key === 'open')   onOpen()
    if (key === 'rename') onRename()
    if (key === 'move')   onMove()
    if (key === 'delete') onDelete()
  }

  const ContextMenu = (
    <div ref={menuRef} className="relative flex-shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-200 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>more_vert</span>
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-7 bg-white rounded-xl border border-slate-200 shadow-xl z-30 py-1.5 w-40">
          {MENU_ITEMS.map(({ icon, label, key, danger }) => (
            <button key={key}
              onClick={(e) => { e.stopPropagation(); handleAction(key) }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${danger ? 'text-danger' : 'text-slate-700'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  if (compact) {
    return (
      <div
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 group cursor-pointer transition-colors"
        onDoubleClick={onOpen}
      >
        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '16px' }}>folder</span>
        </div>
        <button className="flex-1 text-left min-w-0" onClick={onOpen}>
          <p className="text-sm font-medium text-slate-700 truncate">{folder.name}</p>
          <p className="text-xs text-slate-400">{fileCount} {fileCount === 1 ? 'file' : 'files'} · {timeAgo(folder.updatedAt)}</p>
        </button>
        {ContextMenu}
      </div>
    )
  }

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer relative"
      onDoubleClick={onOpen}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '20px' }}>folder</span>
          </div>
          {ContextMenu}
        </div>
        <button className="text-left w-full" onClick={onOpen}>
          <p className="text-sm font-semibold text-slate-800 truncate mb-0.5">{folder.name}</p>
          <p className="text-xs text-slate-400">{fileCount} {fileCount === 1 ? 'file' : 'files'}</p>
        </button>
      </div>
      <div className="px-4 py-2 border-t border-slate-50 flex items-center justify-between">
        <span className="text-xs text-slate-400">{timeAgo(folder.updatedAt)}</span>
        <span className="text-xs text-slate-300">{folder.createdBy}</span>
      </div>
    </div>
  )
}
