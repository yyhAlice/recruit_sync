import { useState } from 'react'
import type { WsFolder } from '../../types/workspace'

interface Props {
  itemName: string
  itemId: string
  folders: WsFolder[]
  currentFolderId?: string | null
  onMove: (destFolderId: string | null) => void
  onClose: () => void
}

export default function MoveDialog({ itemName, itemId, folders, currentFolderId, onMove, onClose }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(currentFolderId ?? null)

  // Exclude the item itself (if it's a folder) from destinations
  const available = folders.filter((f) => f.id !== itemId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-[400px]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Move Item</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-64">"{itemName}"</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold text-slate-500 mb-3">Choose destination folder:</p>
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            {/* Root option */}
            <button
              onClick={() => setSelectedId(null)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left border-b border-slate-50 transition-colors ${selectedId === null ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '18px' }}>home</span>
              <span className="font-medium">Root (workspace)</span>
              {selectedId === null && <span className="material-symbols-outlined text-primary ml-auto" style={{ fontSize: '16px' }}>check</span>}
            </button>

            {available.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left border-b border-slate-50 last:border-0 transition-colors ${selectedId === f.id ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-700'}`}
              >
                <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '18px' }}>
                  {f.parentId ? 'subdirectory_arrow_right' : 'folder'}
                </span>
                <span className={`${f.parentId ? 'pl-3 text-slate-500' : 'font-medium'}`}>{f.name}</span>
                {f.id === currentFolderId && (
                  <span className="text-xs text-slate-300 ml-auto">current</span>
                )}
                {selectedId === f.id && f.id !== currentFolderId && (
                  <span className="material-symbols-outlined text-primary ml-auto" style={{ fontSize: '16px' }}>check</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={() => onMove(selectedId)}
            disabled={selectedId === currentFolderId}
            className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${selectedId !== currentFolderId ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>drive_file_move</span>
            Move Here
          </button>
        </div>
      </div>
    </div>
  )
}
