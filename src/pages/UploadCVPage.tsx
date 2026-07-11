import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import { clients, jobs, candidates, recruiters, getClientById, getJobById } from '../data/mockData'

interface UploadedCV {
  id: string
  fileName: string
  candidateName: string
  jobTitle: string
  clientName: string
  uploadedBy: string
  uploadedAt: string
  size: string
  isNew?: boolean
}

const RECENT_CVS: UploadedCV[] = [
  { id: 'u1', fileName: 'CV_Aung_Aung.pdf',      candidateName: 'Aung Aung',      jobTitle: 'Senior Java Engineer', clientName: 'Nexus Systems K.K.', uploadedBy: 'J. Park',     uploadedAt: '2026-06-22', size: '102 KB' },
  { id: 'u2', fileName: 'CV_Emma_Wilson.pdf',     candidateName: 'Emma Wilson',    jobTitle: 'DevOps Engineer',      clientName: 'Nexus Systems K.K.', uploadedBy: 'J. Park',     uploadedAt: '2026-06-21', size: '96 KB'  },
  { id: 'u3', fileName: 'CV_Wang_Fang.pdf',       candidateName: 'Wang Fang',      jobTitle: 'Finance Analyst',      clientName: 'Atlas Fintech Ltd.', uploadedBy: 'Y. Tanaka',   uploadedAt: '2026-06-20', size: '88 KB'  },
  { id: 'u4', fileName: 'CV_David_Kim.pdf',       candidateName: 'David Kim',      jobTitle: 'Cloud Infra Engineer', clientName: 'Toyota IT Systems',  uploadedBy: 'H. Yamamoto', uploadedAt: '2026-06-19', size: '99 KB'  },
  { id: 'u5', fileName: 'CV_Isabella_Costa.pdf',  candidateName: 'Isabella Costa', jobTitle: 'AI Engineer',          clientName: 'SoftBank Robotics',  uploadedBy: 'J. Park',     uploadedAt: '2026-06-18', size: '132 KB' },
]

const EMPTY_FORM = {
  candidateType: 'existing' as 'existing' | 'new',
  candidateId:   '',
  newName:       '',
  jobId:         '',   // only used when candidateType === 'new'
  uploadedBy:    recruiters[0].name,
  notes:         '',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fileSize(bytes: number) {
  if (bytes < 1024) return '< 1 KB'
  return `${Math.round(bytes / 1024)} KB`
}

export default function UploadCVPage() {
  const navigate  = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)

  const [form, setForm]         = useState({ ...EMPTY_FORM })
  const [file, setFile]         = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [uploads, setUploads]   = useState<UploadedCV[]>(RECENT_CVS)
  const [success, setSuccess]   = useState(false)

  // When existing candidate is selected, derive their job + client automatically
  const selectedCandidate = useMemo(
    () => candidates.find((c) => c.id === form.candidateId),
    [form.candidateId]
  )
  const derivedJob = useMemo(
    () => (form.candidateType === 'existing' && selectedCandidate)
      ? getJobById(selectedCandidate.jobId)
      : getJobById(form.jobId),
    [form.candidateType, selectedCandidate, form.jobId]
  )
  const derivedClient = useMemo(
    () => derivedJob ? getClientById(derivedJob.clientId) : undefined,
    [derivedJob]
  )

  function pickFile(f: File | null) {
    if (!f) return
    if (!f.name.match(/\.(pdf|docx|doc)$/i)) {
      setErrors((e) => ({ ...e, file: 'Only PDF or Word files are accepted' }))
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, file: 'File must be under 10 MB' }))
      return
    }
    setFile(f)
    setErrors((e) => { const { file: _, ...rest } = e; return rest })
  }

  function removeFile() {
    setFile(null)
    if (fileInput.current) fileInput.current.value = ''
    setErrors((e) => { const { file: _, ...rest } = e; return rest })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files[0] ?? null)
  }

  function clearError(key: string) {
    setErrors((e) => { const { [key]: _, ...rest } = e; return rest })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!file) e.file = 'Please select a file to upload'
    if (form.candidateType === 'existing' && !form.candidateId)
      e.candidateId = 'Please select a candidate'
    if (form.candidateType === 'new' && !form.newName.trim())
      e.newName = 'Please enter the candidate name'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const newEntry: UploadedCV = {
      id:            `u-${Date.now()}`,
      fileName:      file!.name,
      candidateName: form.candidateType === 'existing'
        ? (selectedCandidate?.name ?? '')
        : form.newName.trim(),
      jobTitle:      derivedJob?.title    ?? '—',
      clientName:    derivedClient?.companyName ?? '—',
      uploadedBy:    form.uploadedBy,
      uploadedAt:    '2026-07-01',
      size:          fileSize(file!.size),
      isNew:         true,
    }

    setUploads((prev) => [newEntry, ...prev])

    // Reset form and file input completely
    setFile(null)
    if (fileInput.current) fileInput.current.value = ''
    setForm({ ...EMPTY_FORM })
    setErrors({})
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Upload CV"
          subtitle="Attach candidate CVs to jobs and clients"
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Upload Form ─────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-800">New Upload</h2>
                  <p className="text-xs text-slate-400 mt-0.5">PDF or Word documents only · max 10 MB</p>
                </div>

                {success && (
                  <div className="mx-5 mt-4 flex items-center gap-2 bg-green-50 text-success border border-green-200 rounded-lg px-3 py-2 text-xs font-semibold">
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>check_circle</span>
                    CV uploaded successfully!
                  </div>
                )}

                <form onSubmit={handleSubmit} className="p-5 space-y-4">

                  {/* ① File drop zone */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                      CV File <span className="text-red-400">*</span>
                    </label>
                    <input
                      ref={fileInput}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                    />
                    {!file ? (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInput.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
                          dragging          ? 'border-primary bg-primary/5' :
                          errors.file       ? 'border-red-300 bg-red-50'   :
                                              'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dragging ? 'bg-primary/10' : 'bg-slate-100'}`}>
                          <span className={`material-symbols-outlined text-2xl ${dragging ? 'text-primary' : 'text-slate-400'}`}>
                            upload_file
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-700">
                            {dragging ? 'Drop file here' : 'Drag & drop or click to select'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, DOCX</p>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-green-200 bg-green-50 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }}>picture_as_pdf</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                          <p className="text-xs text-slate-400">{fileSize(file.size)}</p>
                        </div>
                        <button type="button" onClick={removeFile} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                        </button>
                      </div>
                    )}
                    {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
                  </div>

                  {/* ② Candidate */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                      Candidate <span className="text-red-400">*</span>
                    </label>
                    {/* Toggle */}
                    <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-2">
                      {(['existing', 'new'] as const).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => { setForm((f) => ({ ...f, candidateType: k, candidateId: '', newName: '', jobId: '' })); clearError('candidateId'); clearError('newName') }}
                          className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                            form.candidateType === k ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {k === 'existing' ? 'Existing Candidate' : 'New Candidate'}
                        </button>
                      ))}
                    </div>

                    {form.candidateType === 'existing' ? (
                      <>
                        <select
                          value={form.candidateId}
                          onChange={(e) => { setForm((f) => ({ ...f, candidateId: e.target.value })); clearError('candidateId') }}
                          className={`w-full text-sm border rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.candidateId ? 'border-red-400' : 'border-slate-200'}`}
                        >
                          <option value="">— Select candidate —</option>
                          {candidates.map((c) => {
                            const j = getJobById(c.jobId)
                            return <option key={c.id} value={c.id}>{c.name} · {j?.title}</option>
                          })}
                        </select>
                        {errors.candidateId && <p className="text-xs text-red-500 mt-1">{errors.candidateId}</p>}

                        {/* Auto-populated job + client info */}
                        {selectedCandidate && (
                          <div className="mt-2 bg-slate-50 rounded-lg px-3 py-2.5 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '13px' }}>work</span>
                              <span className="text-xs text-slate-600 font-medium">{derivedJob?.title ?? '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '13px' }}>business</span>
                              <span className="text-xs text-slate-500">{derivedClient?.companyName ?? '—'}</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Full name e.g. Tanaka Hiroshi"
                          value={form.newName}
                          onChange={(e) => { setForm((f) => ({ ...f, newName: e.target.value })); clearError('newName') }}
                          className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.newName ? 'border-red-400' : 'border-slate-200'}`}
                        />
                        {errors.newName && <p className="text-xs text-red-500 mt-1">{errors.newName}</p>}

                        {/* Job selector for new candidates */}
                        <div className="mt-2">
                          <label className="text-xs text-slate-500 mb-1 block">Associate with job <span className="text-slate-400">(optional)</span></label>
                          <select
                            value={form.jobId}
                            onChange={(e) => setForm((f) => ({ ...f, jobId: e.target.value }))}
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">— No job —</option>
                            {jobs.map((j) => {
                              const cl = getClientById(j.clientId)
                              return <option key={j.id} value={j.id}>{j.title} — {cl?.companyName}</option>
                            })}
                          </select>
                          {/* Show derived client */}
                          {derivedClient && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '13px' }}>business</span>
                              <span className="text-xs text-slate-500">{derivedClient.companyName}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* ③ Uploaded by */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Uploaded by</label>
                    <select
                      value={form.uploadedBy}
                      onChange={(e) => setForm((f) => ({ ...f, uploadedBy: e.target.value }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {recruiters.map((r) => <option key={r.id}>{r.name}</option>)}
                    </select>
                  </div>

                  {/* ④ Notes */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                      Notes <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Updated version with portfolio link..."
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload</span>
                    Upload CV
                  </button>
                </form>
              </div>
            </div>

            {/* ── Recent Uploads ───────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Recent Uploads</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{uploads.length} CVs on file</p>
                  </div>
                  <button
                    onClick={() => navigate('/files')}
                    className="text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>folder_open</span>
                    File Workspace
                  </button>
                </div>

                <div className="divide-y divide-slate-50">
                  {uploads.map((cv) => (
                    <div
                      key={cv.id}
                      className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors ${cv.isNew ? 'bg-green-50/40' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-red-400" style={{ fontSize: '20px' }}>picture_as_pdf</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-slate-800 truncate">{cv.fileName}</p>
                          {cv.isNew && (
                            <span className="text-xs font-bold text-success bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full flex-shrink-0">New</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                          <span className="font-medium text-slate-600">{cv.candidateName}</span>
                          {cv.jobTitle !== '—' && <><span className="text-slate-300">·</span><span>{cv.jobTitle}</span></>}
                          {cv.clientName !== '—' && <><span className="text-slate-300">·</span><span>{cv.clientName}</span></>}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 space-y-0.5">
                        <p className="text-xs text-slate-400">{formatDate(cv.uploadedAt)}</p>
                        <p className="text-xs text-slate-400">{cv.uploadedBy} · {cv.size}</p>
                      </div>

                      <button disabled className="text-xs font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-lg opacity-50 cursor-not-allowed flex-shrink-0">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
