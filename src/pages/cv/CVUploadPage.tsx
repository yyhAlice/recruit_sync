import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import StepIndicator from '../../components/cv/StepIndicator'
import { useCVContext } from '../../context/CVContext'
import type { CVFile, FileRole, InputLanguage } from '../../types/cv'

const LANG_OPTIONS: { value: InputLanguage; label: string }[] = [
  { value: 'auto',     label: 'Auto Detect' },
  { value: 'english',  label: 'English' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'myanmar',  label: 'Myanmar' },
]

const ROLE_OPTIONS: { value: FileRole; label: string }[] = [
  { value: 'resume',       label: 'Resume / 履歴書' },
  { value: 'work_history', label: 'Work History / 職務経歴書' },
  { value: 'other',        label: 'Other' },
]

const ACCEPTED = '.pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg'

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf')  return { icon: 'picture_as_pdf', cls: 'text-red-500' }
  if (ext === 'docx' || ext === 'doc') return { icon: 'description', cls: 'text-blue-500' }
  if (ext === 'xlsx') return { icon: 'table_chart', cls: 'text-green-600' }
  return { icon: 'image', cls: 'text-slate-400' }
}

interface FileSlot {
  file: File | null
  role: FileRole
  progress: number
  done: boolean
}

export default function CVUploadPage() {
  const navigate = useNavigate()
  const { updateSession, simulateParse } = useCVContext()

  const [candidateName,  setCandidateName]  = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [lang, setLang]                     = useState<InputLanguage>('auto')
  const [slot1, setSlot1]                   = useState<FileSlot>({ file: null, role: 'resume',       progress: 0, done: false })
  const [slot2, setSlot2]                   = useState<FileSlot>({ file: null, role: 'work_history', progress: 0, done: false })
  const [drag1, setDrag1]                   = useState(false)
  const [drag2, setDrag2]                   = useState(false)
  const [errors, setErrors]                 = useState<Record<string, string>>({})
  const [parsing, setParsing]               = useState(false)

  const ref1 = useRef<HTMLInputElement>(null)
  const ref2 = useRef<HTMLInputElement>(null)

  function simulateUpload(slot: FileSlot, setSlot: (s: FileSlot) => void) {
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 30
      if (p >= 100) {
        clearInterval(iv)
        setSlot({ ...slot, progress: 100, done: true })
      } else {
        setSlot({ ...slot, progress: Math.min(p, 99) })
      }
    }, 150)
  }

  function pickFile(f: File, slotNum: 1 | 2) {
    if (!f.name.match(/\.(pdf|docx?|xlsx|png|jpe?g)$/i)) {
      setErrors((e) => ({ ...e, [`file${slotNum}`]: 'Unsupported file type' }))
      return
    }
    const newSlot: FileSlot = { file: f, role: slotNum === 1 ? slot1.role : slot2.role, progress: 0, done: false }
    if (slotNum === 1) { setSlot1(newSlot); simulateUpload(newSlot, setSlot1) }
    else               { setSlot2(newSlot); simulateUpload(newSlot, setSlot2) }
    setErrors((e) => { const { [`file${slotNum}`]: _, ...rest } = e; return rest })
  }

  function removeFile(slotNum: 1 | 2) {
    if (slotNum === 1) { setSlot1({ file: null, role: 'resume', progress: 0, done: false }); if (ref1.current) ref1.current.value = '' }
    else               { setSlot2({ file: null, role: 'work_history', progress: 0, done: false }); if (ref2.current) ref2.current.value = '' }
  }

  const canSubmit = slot1.file !== null && slot1.done

  async function handleSubmit() {
    if (!canSubmit) {
      setErrors({ file1: 'Please select at least one file' })
      return
    }
    setParsing(true)

    const files: CVFile[] = []
    if (slot1.file) files.push({ id: 'f1', name: slot1.file.name, size: slot1.file.size, type: slot1.file.type, role: slot1.role })
    if (slot2.file) files.push({ id: 'f2', name: slot2.file.name, size: slot2.file.size, type: slot2.file.type, role: slot2.role })

    updateSession({ candidateName, candidateEmail, inputLanguage: lang, files })

    const parsed = await simulateParse(candidateName, candidateEmail)
    updateSession({ parsedData: parsed })

    setParsing(false)
    navigate('/cv/review')
  }

  function FileDropZone({ slotNum, slot, setSlot, drag, setDrag, inputRef }: {
    slotNum: 1 | 2
    slot: FileSlot
    setSlot: (s: FileSlot) => void
    drag: boolean
    setDrag: (v: boolean) => void
    inputRef: React.RefObject<HTMLInputElement>
  }) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-600">
            File {slotNum} {slotNum === 1 ? <span className="text-red-400">*</span> : <span className="text-slate-400">(optional)</span>}
          </label>
          {slot.file && (
            <select
              value={slot.role}
              onChange={(e) => setSlot({ ...slot, role: e.target.value as FileRole })}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          )}
        </div>

        <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f, slotNum) }} />

        {!slot.file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) pickFile(f, slotNum) }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
              drag ? 'border-primary bg-primary/5' :
              errors[`file${slotNum}`] ? 'border-red-300 bg-red-50' :
              'border-slate-200 hover:border-primary/40 hover:bg-slate-50'
            }`}
          >
            <span className={`material-symbols-outlined text-4xl ${drag ? 'text-primary' : 'text-slate-300'}`}>upload_file</span>
            <p className="text-sm font-semibold text-slate-600">{drag ? 'Drop here' : 'Drag & drop or click to browse'}</p>
            <p className="text-xs text-slate-400">PDF, DOCX, XLSX, PNG, JPG</p>
          </div>
        ) : (
          <div className={`border rounded-xl p-3 ${slot.done ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined ${fileIcon(slot.file.name).cls}`} style={{ fontSize: '28px' }}>
                {fileIcon(slot.file.name).icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{slot.file.name}</p>
                <p className="text-xs text-slate-400">{fileSize(slot.file.size)} · {ROLE_OPTIONS.find((r) => r.value === slot.role)?.label}</p>
                {!slot.done && (
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${slot.progress}%` }} />
                  </div>
                )}
              </div>
              {slot.done && (
                <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }}>check_circle</span>
              )}
              <button type="button" onClick={() => removeFile(slotNum)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
              </button>
            </div>
          </div>
        )}
        {errors[`file${slotNum}`] && <p className="text-xs text-red-500 mt-1">{errors[`file${slotNum}`]}</p>}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader title="Upload CV" subtitle="Step 1 of 5 — Upload candidate files for parsing" />
        <StepIndicator currentPath="/cv/upload" />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-bold text-slate-800">Candidate Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Candidate Name <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input type="text" value={candidateName} onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Aung Aung"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input type="email" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="candidate@email.com"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Input Language</label>
                <div className="flex gap-2">
                  {LANG_OPTIONS.map((l) => (
                    <button key={l.value} type="button" onClick={() => setLang(l.value)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        lang === l.value ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'
                      }`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-bold text-slate-800">File Upload</h2>
              <FileDropZone slotNum={1} slot={slot1} setSlot={setSlot1} drag={drag1} setDrag={setDrag1} inputRef={ref1} />
              <div className="border-t border-slate-100 pt-4">
                <FileDropZone slotNum={2} slot={slot2} setSlot={setSlot2} drag={drag2} setDrag={setDrag2} inputRef={ref2} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => navigate('/cv')} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                Back to Dashboard
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || parsing}
                className={`flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors ${
                  canSubmit && !parsing
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {parsing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span>
                    Parsing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>play_arrow</span>
                    Upload & Parse
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
