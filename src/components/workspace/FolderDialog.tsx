import { useState, useEffect } from 'react'
import type { WsFolder } from '../../types/workspace'

interface Props {
  mode: 'create' | 'rename'
  currentName?: string
  folders: WsFolder[]
  onConfirm: (name: string, parentId: string | null) => void
  onClose: () => void
}

export default function FolderDialog({ mode, currentName = '', folders, onConfirm, onClose }: Props) {
  const [name,     setName]     = useState(mode === 'rename' ? currentName : '')
  const [parentId, setParentId] = useState<string | null>(null)
  const [error,    setError]    = useState('')

  useEffect(() => { setName(mode === 'rename' ? currentName : '') }, [mode, currentName])

  function handleSubmit() {
    if (!name.trim()) { setError('Folder name is required'); return }
    onConfirm(name.trim(), parentId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-96">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '18px' }}>folder</span>
            <h2 className="text-sm font-bold text-slate-800">{mode === 'create' ? 'New Folder' : 'Rename Folder'}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {mode === 'rename' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Current Name</label>
              <p className="text-sm text-slate-700 font-medium bg-slate-50 px-3 py-2 rounded-lg">{currentName}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              {mode === 'rename' ? 'New Name' : 'Folder Name'} <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={mode === 'create' ? 'e.g. Contracts 2026' : 'New folder name…'}
              className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${error ? 'border-red-300' : 'border-slate-200'}`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {mode === 'create' && folders.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Parent Folder <span className="font-normal text-slate-400">(optional)</span></label>
              <select value={parentId ?? ''} onChange={(e) => setParentId(e.target.value || null)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Root (no parent)</option>
                {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{mode === 'create' ? 'add' : 'save'}</span>
            {mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
