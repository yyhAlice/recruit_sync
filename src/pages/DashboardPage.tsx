import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import StatusDot from '../components/StatusDot'
import {
  clients, jobs, candidates,
  getJobsByClientId,
  PIPELINE_STAGES, STAGE_LABELS,
} from '../data/mockData'
import { initialReminders } from '../data/remindersMockData'
import { formatSalary, daysAgo, TODAY } from '../utils/format'
import type { PipelineStage } from '../types'

// ── Computed stats ────────────────────────────────────────────────────────────
const activeJobs = jobs.filter((j) => j.status === 'active').length

const candidatesByStage: Record<PipelineStage, number> = {
  sourced: 0, screening: 0, interview: 0, offered: 0, placed: 0, rejected: 0,
}
candidates.forEach((c) => { candidatesByStage[c.stage]++ })

const recentPlacements = candidates
  .filter((c) => c.stage === 'placed')
  .slice(0, 6)
  .map((c) => {
    const job    = jobs.find((j) => j.id === c.jobId)!
    const client = clients.find((cl) => cl.id === job?.clientId)!
    return { candidate: c, job, client }
  })

const maxStageCount = Math.max(...Object.values(candidatesByStage), 1)

const openReminders  = initialReminders.filter((r) => r.status === 'open')
const overdueCount   = openReminders.filter((r) => r.dueDate < TODAY).length
const todayCount     = openReminders.filter((r) => r.dueDate === TODAY).length
const urgentReminders = openReminders
  .filter((r) => r.dueDate <= TODAY)
  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  .slice(0, 8)

const stageBarColors: Record<PipelineStage, string> = {
  sourced: 'bg-slate-400', screening: 'bg-primary', interview: 'bg-teal',
  offered: 'bg-violet-500', placed: 'bg-success', rejected: 'bg-danger',
}

const stageBadge: Record<PipelineStage, string> = {
  sourced:   'bg-slate-100 text-slate-600',
  screening: 'bg-blue-100 text-blue-700',
  interview: 'bg-teal-100 text-teal-700',
  offered:   'bg-purple-100 text-purple-700',
  placed:    'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({
  label, value, sub, subColor, onClick,
}: {
  label: string; value: number | string; sub?: string; subColor?: string; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 ${onClick ? 'cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all' : ''}`}
    >
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-slate-800 leading-none mb-1.5">{value}</p>
      {sub && <p className={`text-xs ${subColor ?? 'text-slate-400'}`}>{sub}</p>}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Dashboard"
          subtitle="Overview of your recruitment pipeline"
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── Stat tiles ── */}
          <div className="grid grid-cols-4 gap-4">
            <StatTile
              label="Active Jobs"
              value={activeJobs}
              sub="+3 from last month"
              subColor="text-success"
              onClick={() => navigate('/jobs')}
            />
            <StatTile
              label="In Screening"
              value={candidatesByStage.screening}
              sub={`${candidatesByStage.interview} in interview`}
              onClick={() => navigate('/candidates')}
            />
            <StatTile
              label="In Interview"
              value={candidatesByStage.interview}
              sub={`${Math.ceil(candidatesByStage.interview / 2)} scheduled this week`}
              subColor="text-primary"
            />
            <StatTile
              label="Reminders Due"
              value={overdueCount + todayCount}
              sub={overdueCount > 0 ? `${overdueCount} overdue` : todayCount > 0 ? `${todayCount} today` : 'All on track'}
              subColor={overdueCount > 0 ? 'text-danger' : 'text-success'}
              onClick={() => navigate('/reminders')}
            />
          </div>

          {/* ── Middle row ── */}
          <div className="grid grid-cols-12 gap-4">

            {/* Candidates by stage */}
            <div className="col-span-7 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-slate-800">Candidates by Stage</h2>
                <span className="text-xs text-slate-400">{candidates.length} total</span>
              </div>
              <div className="space-y-3.5">
                {PIPELINE_STAGES.map((stage) => {
                  const count = candidatesByStage[stage]
                  const pct   = Math.round((count / maxStageCount) * 100)
                  return (
                    <div key={stage} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-16 text-right flex-shrink-0 font-medium">{STAGE_LABELS[stage]}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className={`${stageBarColors[stage]} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-5 text-right flex-shrink-0">{count}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-slate-50 flex flex-wrap gap-1.5">
                {PIPELINE_STAGES.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => navigate('/candidates')}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stageBadge[stage]} hover:opacity-80 transition-opacity`}
                  >
                    {STAGE_LABELS[stage]}: {candidatesByStage[stage]}
                  </button>
                ))}
              </div>
            </div>

            {/* Due / Overdue reminders */}
            <div className="col-span-5 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between flex-shrink-0">
                <h2 className="text-sm font-semibold text-slate-800">Needs Attention</h2>
                <button onClick={() => navigate('/reminders')} className="text-xs text-primary hover:underline font-medium">
                  View all
                </button>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {urgentReminders.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined block text-3xl text-slate-200 mb-2">check_circle</span>
                    <p className="text-xs text-slate-400">All caught up!</p>
                  </div>
                ) : (
                  urgentReminders.map((r) => {
                    const isOverdue = r.dueDate < TODAY
                    return (
                      <div
                        key={r.id}
                        onClick={() => navigate('/reminders')}
                        className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-700 truncate">{r.title}</p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{r.clientName}{r.jobTitle ? ` · ${r.jobTitle}` : ''}</p>
                          </div>
                          <span className={`text-[10px] font-bold flex-shrink-0 mt-0.5 ${isOverdue ? 'text-danger' : 'text-warning'}`}>
                            {isOverdue ? 'Overdue' : 'Today'}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom row ── */}
          <div className="grid grid-cols-12 gap-4">

            {/* Active jobs by client */}
            <div className="col-span-5 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-800">Active Jobs by Client</h2>
                <button onClick={() => navigate('/clients')} className="text-xs text-primary hover:underline font-medium">View all</button>
              </div>
              <div className="space-y-1">
                {clients.map((client) => {
                  const activeCount = getJobsByClientId(client.id).filter((j) => j.status === 'active').length
                  if (activeCount === 0) return null
                  return (
                    <div
                      key={client.id}
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-primary">{client.companyName.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-primary transition-colors">{client.companyName}</p>
                        <p className="text-[10px] text-slate-400">{client.industry}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-600 flex-shrink-0">{activeCount} <span className="font-normal text-slate-400">jobs</span></span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent placements */}
            <div className="col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Recent Placements</h2>
                <span className="text-xs text-slate-400">{recentPlacements.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Candidate', 'Job', 'Client', 'Salary', 'Placed'].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentPlacements.map(({ candidate: c, job, client }) => (
                      <tr key={c.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => navigate(`/jobs/${c.jobId}`)}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <StatusDot lastActivityDate={c.lastActivityDate} reminderOverdue={false} />
                            <span className="font-semibold text-slate-700">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 max-w-[120px] truncate">{job?.title}</td>
                        <td className="px-4 py-2.5 text-slate-500 max-w-[100px] truncate">{client?.companyName}</td>
                        <td className="px-4 py-2.5 font-mono font-medium text-success">
                          {job ? `${formatSalary(job.salaryMin)}–${formatSalary(job.salaryMax)}` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">{daysAgo(c.lastActivityDate)}</td>
                      </tr>
                    ))}
                    {recentPlacements.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No placements yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
