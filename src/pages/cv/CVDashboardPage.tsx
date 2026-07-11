import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import CVStatusBadge from '../../components/cv/CVStatusBadge'
import { useCVContext } from '../../context/CVContext'
import { cvTemplates } from '../../data/cvMockData'
import type { OutputFormat } from '../../types/cv'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatLabel(fmt: OutputFormat) {
  return fmt === 'both' ? 'DOCX + PDF' : fmt.toUpperCase()
}

export default function CVDashboardPage() {
  const navigate = useNavigate()
  const { history, deleteFromHistory, resetSession, addToHistory } = useCVContext()

  const total      = history.length
  const pending    = history.filter((h) => h.status === 'pending' || h.status === 'processing').length
  const completed  = history.filter((h) => h.status === 'completed').length
  const failed     = history.filter((h) => h.status === 'failed').length

  const stats = [
    { label: 'Total Uploaded',  value: total,     icon: 'upload_file',  cls: 'bg-blue-50 text-primary'   },
    { label: 'Pending Review',  value: pending,   icon: 'pending',      cls: 'bg-amber-50 text-warning'  },
    { label: 'Generated',       value: completed, icon: 'task_alt',     cls: 'bg-green-50 text-success'  },
    { label: 'Failed',          value: failed,    icon: 'error_outline', cls: 'bg-red-50 text-danger'    },
  ]

  function handleDuplicate(id: string) {
    const original = history.find((h) => h.id === id)
    if (!original) return
    const dupe = { ...original, id: `g-${Date.now()}`, generatedAt: '2026-07-01', status: 'completed' as const }
    addToHistory(dupe)
  }

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

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="CV Management"
          subtitle="Generate, manage and track candidate CVs"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/cv/templates/manage')}
                className="text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Manage Templates
              </button>
              <button
                onClick={() => { resetSession(); navigate('/cv/upload') }}
                className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
                Upload New CV
              </button>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.cls}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{s.icon}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                  <div className="text-xs text-slate-400 font-medium">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent generated CVs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Recent Generated CVs</h2>
                <p className="text-xs text-slate-400 mt-0.5">{history.length} total records</p>
              </div>
              <button onClick={() => navigate('/cv/history')} className="text-xs font-medium text-primary hover:underline">
                View all history →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Candidate', 'Template', 'Format', 'Generated', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 8).map((cv) => (
                    <tr key={cv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-800 text-xs">{cv.candidateName}</div>
                        <div className="text-xs text-slate-400">{cv.candidateEmail}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-xs text-slate-700">{cv.templateName}</div>
                        <div className="text-xs text-slate-400">{cvTemplates.find((t) => t.id === cv.templateId)?.language.toUpperCase()}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {formatLabel(cv.outputFormat)}
                        </span>
                      </td>
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
    </div>
  )
}
