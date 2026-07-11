import { useState, useEffect, useRef } from 'react'
import type { WsFolder } from '../../types/workspace'

interface Props {
  folder: WsFolder
  onSave: (notes: string) => void
}

export default function NotesPanel({ folder, onSave }: Props) {
  const [notes,   setNotes]   = useState(folder.notes)
  const [status,  setStatus]  = useState<'idle' | 'saving' | 'saved'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setNotes(folder.notes); setStatus('idle') }, [folder.id, folder.notes])

  function handleChange(value: string) {
    setNotes(value)
    setStatus('saving')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSave(value)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 1500)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Folder Notes</p>
        {status === 'saving' && <span className="text-xs text-slate-400">Saving…</span>}
        {status === 'saved'  && <span className="text-xs text-success flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check</span>Saved</span>}
      </div>
      <p className="text-xs text-slate-400 mb-2 font-medium">{folder.name}</p>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add notes about this folder — requirements, meeting summaries, reminders…"
        className="flex-1 resize-none text-xs text-slate-700 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed min-h-32"
      />
    </div>
  )
}
