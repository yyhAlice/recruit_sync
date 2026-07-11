import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import CVStatusBadge from '../../components/cv/CVStatusBadge'
import { useCVContext } from '../../context/CVContext'
import { cvTemplates } from '../../data/cvMockData'
import type { CVStatus, OutputFormat } from '../../types/cv'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatLabel(fmt: OutputFormat) {
  return fmt === 'both' ? 'PDF+DOCX' : fmt.toUpperCase()
}

export default function CVHistoryPage() {
  const navigate = useNavigate()
  const { history, deleteFromHistory, addToHistory } = useCVContext()

  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState<CVStatus | 'all'>('all')
  const [fmtFilter, setFmt]   = useState<OutputFormat | 'all'>('all')

  const filtered = useMemo(() => {
    return history.filter((h) => {
      const q = search.toLowerCase()
      if (q && !h.candidateName.toLowerCase().includes(q) && !h.candidateEmail.toLowerCase().includes(q) && !h.templateName.toLowerCase().includes(q)) return false
      if (status !== 'all' && h.status !== status) return false
      if (fmtFilter !== 'all' && h.outputFormat !== fmtFilter) return false
      return true
    })
  }, [history, search, status, fmtFilter])

  function handleDownload(id: string) {
    const cv = history.find((h) => h.id === id)
    if (!cv) return
    const text = `RecruitSync Generated CV\n\nCandidate: ${cv.candidateName}\nEmail: ${cv.candidateEmail}\nTemplate: ${cv.templateName}\nFormat: ${cv.outputFormat.toUpperCase()}\nGenerated: ${cv.generatedAt}\n`
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${cv.candidateName.replace(/ /g, '_')}_CV.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDuplicate(id: string) {
    const original = history.find((h) => h.id === id)
    if (!original) return
    addToHistory({ ...original, id: `g-${Date.now()}`, generatedAt: new Date().toISOString().slice(0, 10) })
  }

  const statusOptions: { value: CVStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending',   label: 'Pending' },
    { value: 'failed',    label: 'Failed' },
  ]
  const fmtOptions: { value: OutputFormat | 'all'; label: string }[] = [
    { value: 'all',  label: 'All Formats' },
    { value: 'pdf',  label: 'PDF' },
    { value: 'docx', label: 'DOCX' },
    { value: 'both', label: 'PDF + DOCX' },
  ]

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Generation History"
          subtitle={`${history.length} total records — all generated CVs`}
          actions={
            <button onClick={() => navigate('/cv')} className="text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              ← Back to Dashboard
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '16px' }}>search</span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, template…"
                className="w-full text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value as CVStatus | 'all')}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30">
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={fmtFilter} onChange={(e) => setFmt(e.target.value as OutputFormat | 'all')}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30">
              {fmtOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {(search || status !== 'all' || fmtFilter !== 'all') && (
              <button onClick={() => { setSearch(''); setStatus('all'); setFmt('all') }}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>Clear
              </button>
            )}
            <span className="text-xs text-slate-400 ml-auto">{filtered.length} of {history.length}</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Candidate', 'Template', 'Format', 'Generated By', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                      No records match your filters.
                    </td>
                  </tr>
                ) : filtered.map((cv) => (
                  <tr key={cv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-xs text-slate-800">{cv.candidateName}</div>
                      <div className="text-xs text-slate-400">{cv.candidateEmail}</div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {cv.sourceFiles.slice(0, 2).map((f) => (
                          <span key={f} className="text-xs text-slate-300 flex items-center gap-0.5">
                            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>attach_file</span>{f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded flex-shrink-0"
                          style={{ backgroundColor: cvTemplates.find((t) => t.id === cv.templateId)?.thumbnailColor ?? '#cbd5e1' }} />
                        <div>
                          <p className="text-xs text-slate-700 font-medium">{cv.templateName}</p>
                          {cvTemplates.find((t) => t.id === cv.templateId)?.clientName && (
                            <p className="text-xs text-client-purple">{cvTemplates.find((t) => t.id === cv.templateId)?.clientName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{formatLabel(cv.outputFormat)}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{cv.generatedBy}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDate(cv.generatedAt)}</td>
                    <td className="px-5 py-3"><CVStatusBadge status={cv.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate('/cv/preview')} className="text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded transition-colors">Preview</button>
                        {cv.status === 'completed' && (
                          <button onClick={() => handleDownload(cv.id)} className="text-xs font-medium text-success bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-colors">Download</button>
                        )}
                        <button onClick={() => handleDuplicate(cv.id)} className="text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors">Duplicate</button>
                        <button onClick={() => deleteFromHistory(cv.id)} className="text-xs font-medium text-danger bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
