import { useState, useRef } from 'react'
import type { WsFolder, WsFileType } from '../../types/workspace'

interface Props {
  workspaceId: string
  folders: WsFolder[]
  currentFolderId: string | null
  onUpload: (file: { name: string; fileType: WsFileType; size: number; description: string; tags: string[]; folderId: string }) => void
  onClose: () => void
}

const ACCEPTED = '.pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.zip,.txt,.csv'

function detectType(name: string): WsFileType {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf')  return 'pdf'
  if (ext === 'docx' || ext === 'doc') return 'docx'
  if (ext === 'xlsx' || ext === 'xls') return 'xlsx'
  if (ext === 'png')  return 'png'
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg'
  if (ext === 'zip')  return 'zip'
  if (ext === 'txt')  return 'txt'
  if (ext === 'csv')  return 'csv'
  return 'txt'
}

export default function UploadDialog({ workspaceId: _wsId, folders, currentFolderId, onUpload, onClose }: Props) {
  const [pickedFile,   setPickedFile]   = useState<File | null>(null)
  const [description,  setDescription]  = useState('')
  const [tagsInput,    setTagsInput]    = useState('')
  const [folderId,     setFolderId]     = useState(currentFolderId ?? (folders[0]?.id ?? ''))
  const [progress,     setProgress]     = useState(0)
  const [uploading,    setUploading]    = useState(false)
  const [done,         setDone]         = useState(false)
  const [drag,         setDrag]         = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function pickFile(f: File) { setPickedFile(f); setProgress(0); setDone(false) }

  function handleUpload() {
    if (!pickedFile || !folderId) return
    setUploading(true)
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 35
      if (p >= 100) {
        clearInterval(iv)
        setProgress(100)
        setDone(true)
        setUploading(false)
        const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
        onUpload({ name: pickedFile.name, fileType: detectType(pickedFile.name), size: pickedFile.size, description, tags, folderId })
      } else {
        setProgress(Math.min(p, 99))
      }
    }, 120)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Upload File</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Drop zone */}
          <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f) }} />

          {!pickedFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) pickFile(f) }}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors ${drag ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/40 hover:bg-slate-50'}`}
            >
              <span className={`material-symbols-outlined text-4xl ${drag ? 'text-primary' : 'text-slate-300'}`}>cloud_upload</span>
              <p className="text-sm font-semibold text-slate-600">{drag ? 'Drop to upload' : 'Drag & drop or click to browse'}</p>
              <p className="text-xs text-slate-400">PDF, DOCX, XLSX, PNG, JPG, ZIP, TXT, CSV</p>
            </div>
          ) : (
            <div className={`border rounded-xl p-4 ${done ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>insert_drive_file</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{pickedFile.name}</p>
                  <p className="text-xs text-slate-400">{(pickedFile.size / 1024).toFixed(0)} KB</p>
                </div>
                {done && <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }}>check_circle</span>}
                {!uploading && !done && (
                  <button onClick={() => setPickedFile(null)} className="text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                  </button>
                )}
              </div>
              {uploading && (
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}

          {/* Fields */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this file…"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Tags <span className="font-normal text-slate-400">(comma-separated)</span></label>
            <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. contract, signed, 2026"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            {tagsInput && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tagsInput.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                  <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{t}</span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Folder <span className="text-red-400">*</span></label>
            <select value={folderId} onChange={(e) => setFolderId(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end px-6 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
            {done ? 'Close' : 'Cancel'}
          </button>
          {!done && (
            <button
              onClick={handleUpload}
              disabled={!pickedFile || uploading || !folderId}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${pickedFile && folderId && !uploading ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              {uploading ? (
                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>autorenew</span>Uploading…</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>upload</span>Upload</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
