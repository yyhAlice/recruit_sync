import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import {
  candidates,
  clients,
  jobs,
  recruiters,
  PIPELINE_STAGES,
  STAGE_LABELS,
  getJobById,
  getClientById,
} from '../data/mockData'
import type { PipelineStage } from '../types/index'

const REF_DATE = new Date('2026-07-01')

function daysSince(dateStr: string) {
  return Math.floor((REF_DATE.getTime() - new Date(dateStr).getTime()) / 86400000)
}

function statusDot(lastActivity: string, overdue: boolean) {
  if (overdue) return 'bg-danger'
  const d = daysSince(lastActivity)
  if (d < 7)  return 'bg-success'
  if (d < 14) return 'bg-warning'
  return 'bg-danger'
}

const STAGE_STYLE: Record<PipelineStage, { header: string; ring: string; badge: string; icon: string }> = {
  sourced:   { header: 'bg-slate-100',  ring: 'border-slate-300',  badge: 'bg-slate-200 text-slate-700',   icon: 'person_add' },
  screening: { header: 'bg-blue-50',    ring: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',     icon: 'assignment' },
  interview: { header: 'bg-amber-50',   ring: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',   icon: 'record_voice_over' },
  offered:   { header: 'bg-purple-50',  ring: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', icon: 'local_offer' },
  placed:    { header: 'bg-green-50',   ring: 'border-green-200',  badge: 'bg-green-100 text-green-700',   icon: 'check_circle' },
  rejected:  { header: 'bg-red-50',     ring: 'border-red-200',    badge: 'bg-red-100 text-red-700',       icon: 'cancel' },
}

export default function PipelineOverviewPage() {
  const navigate = useNavigate()

  const [clientFilter, setClientFilter]   = useState<string>('all')
  const [jobFilter, setJobFilter]         = useState<string>('all')
  const [recruiterFilter, setRecruiter]   = useState<string>('all')

  // Jobs filtered by selected client
  const filteredJobs = useMemo(
    () => clientFilter === 'all' ? jobs : jobs.filter((j) => j.clientId === clientFilter),
    [clientFilter]
  )

  // Reset job filter when client changes
  const handleClientChange = (val: string) => {
    setClientFilter(val)
    setJobFilter('all')
  }

  // Final candidate list after all filters
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (clientFilter !== 'all') {
        const job = getJobById(c.jobId)
        if (!job || job.clientId !== clientFilter) return false
      }
      if (jobFilter !== 'all' && c.jobId !== jobFilter) return false
      if (recruiterFilter !== 'all' && c.recruiterId !== recruiterFilter) return false
      return true
    })
  }, [clientFilter, jobFilter, recruiterFilter])

  // Group by stage
  const grouped = useMemo(() => {
    const map: Record<PipelineStage, typeof filtered> = {
      sourced: [], screening: [], interview: [], offered: [], placed: [], rejected: [],
    }
    filtered.forEach((c) => map[c.stage].push(c))
    return map
  }, [filtered])

  const totalActive = filtered.filter((c) => c.stage !== 'placed' && c.stage !== 'rejected').length

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Pipeline Overview"
          subtitle={`${filtered.length} candidates · ${totalActive} active`}
          actions={
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Showing across all jobs</span>
            </div>
          }
        />

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200 flex-wrap">
          {/* Client filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Client</span>
            <select
              value={clientFilter}
              onChange={(e) => handleClientChange(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          {/* Job filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Job</span>
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Jobs</option>
              {filteredJobs.map((j) => {
                const cl = getClientById(j.clientId)
                return (
                  <option key={j.id} value={j.id}>
                    {j.title}{clientFilter === 'all' ? ` — ${cl?.companyName}` : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Recruiter filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Recruiter</span>
            <select
              value={recruiterFilter}
              onChange={(e) => setRecruiter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Recruiters</option>
              {recruiters.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Stage summary chips */}
          <div className="flex gap-1.5 ml-auto flex-wrap">
            {PIPELINE_STAGES.map((stage) => {
              const count = grouped[stage].length
              const s = STAGE_STYLE[stage]
              return (
                <span key={stage} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>
                  {count} {STAGE_LABELS[stage]}
                </span>
              )
            })}
          </div>
        </div>

        {/* Kanban board — horizontal scroll */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-5">
          <div className="flex gap-4 h-full" style={{ minWidth: `${PIPELINE_STAGES.length * 236}px` }}>
            {PIPELINE_STAGES.map((stage) => {
              const cols = grouped[stage]
              const s = STAGE_STYLE[stage]
              return (
                <div
                  key={stage}
                  className={`flex flex-col rounded-xl border ${s.ring} flex-shrink-0 w-56 overflow-hidden`}
                >
                  {/* Column header */}
                  <div className={`${s.header} px-3 py-2.5 flex items-center gap-2 border-b ${s.ring}`}>
                    <span className="material-symbols-outlined text-slate-500" style={{ fontSize: '16px' }}>{s.icon}</span>
                    <span className="text-xs font-bold text-slate-700 flex-1">{STAGE_LABELS[stage]}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{cols.length}</span>
                  </div>

                  {/* Candidate cards */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-white/50">
                    {cols.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-24 text-slate-300 gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>inbox</span>
                        <span className="text-xs">No candidates</span>
                      </div>
                    )}
                    {cols.map((c) => {
                      const job    = getJobById(c.jobId)
                      const client = job ? getClientById(job.clientId) : undefined
                      const dot    = statusDot(c.lastActivityDate, c.reminderOverdue)
                      return (
                        <div
                          key={c.id}
                          onClick={() => navigate(`/candidates/${c.id}`)}
                          className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
                        >
                          <div className="flex items-start gap-2">
                            {/* Avatar */}
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary">{c.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">
                                {c.name}
                              </div>
                              <div className="text-xs text-slate-400 truncate mt-0.5">{job?.title}</div>
                              {client && (
                                <div className="text-xs text-slate-400 truncate">{client.companyName}</div>
                              )}
                            </div>
                            {/* Status dot */}
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${dot}`} title={`Last activity: ${c.lastActivityDate}`} />
                          </div>

                          {/* Footer: go to job pipeline */}
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-400">{c.lastActivityDate.slice(5).replace('-', '/')}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${c.jobId}/pipeline`) }}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              Board →
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
