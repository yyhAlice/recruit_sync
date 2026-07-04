import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import StatusDot from '../components/StatusDot'
import {
  clients,
  jobs,
  candidates,
  getJobsByClientId,
  PIPELINE_STAGES,
  STAGE_LABELS,
} from '../data/mockData'
import type { PipelineStage } from '../types'

const TODAY = '2026-07-01'

// ── Computed stats ────────────────────────────────────────────────────────────
const activeJobs = jobs.filter((j) => j.status === 'active').length

const candidatesByStage: Record<PipelineStage, number> = {
  sourced: 0, screening: 0, interview: 0, offered: 0, placed: 0, rejected: 0,
}
candidates.forEach((c) => { candidatesByStage[c.stage]++ })

const inScreening = candidatesByStage.screening
const inInterview = candidatesByStage.interview

const overdueReminders = candidates.filter((c) => c.reminderOverdue)
const dueTodayReminders = candidates.filter(
  (c) => c.nextReminderDate === TODAY && !c.reminderOverdue
)
const allDueReminders = [...overdueReminders, ...dueTodayReminders]

const recentPlacements = candidates
  .filter((c) => c.stage === 'placed')
  .slice(0, 6)
  .map((c) => {
    const job = jobs.find((j) => j.id === c.jobId)!
    const client = clients.find((cl) => cl.id === job?.clientId)!
    return { candidate: c, job, client }
  })

const maxStageCount = Math.max(...Object.values(candidatesByStage), 1)

const stageBarColors: Record<PipelineStage, string> = {
  sourced: 'bg-slate-400',
  screening: 'bg-primary',
  interview: 'bg-teal',
  offered: 'bg-client-purple',
  placed: 'bg-success',
  rejected: 'bg-danger',
}

const stageBadge: Record<PipelineStage, string> = {
  sourced: 'bg-slate-100 text-slate-600',
  screening: 'bg-blue-100 text-blue-700',
  interview: 'bg-teal-100 text-teal-700',
  offered: 'bg-purple-100 text-purple-700',
  placed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

function formatSalary(n: number) {
  return `¥${(n / 1_000_000).toFixed(0)}M`
}

function daysAgo(dateStr: string): string {
  const ref = new Date(TODAY)
  const d = new Date(dateStr)
  const days = Math.floor((ref.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

// ── MetricCard ────────────────────────────────────────────────────────────────
function MetricCard({
  label, value, icon, trend, trendColor, accent, onClick,
}: {
  label: string
  value: number | string
  icon: string
  trend?: string
  trendColor?: string
  accent: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={`material-symbols-outlined ${accent}`} style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-slate-800 leading-none">{value}</div>
      {trend && (
        <div className={`text-xs flex items-center gap-1 ${trendColor ?? 'text-slate-400'}`}>
          {trend}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-11 bg-white border-b border-slate-200 flex items-center px-6 justify-between flex-shrink-0">
          <h1 className="text-sm font-semibold text-slate-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <select className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option>This month</option>
              <option>Last 30 days</option>
              <option>All time</option>
            </select>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">YT</span>
              </div>
              <span className="text-xs font-medium text-slate-700">Y. Tanaka</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Metric cards ── */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              label="Active Jobs"
              value={activeJobs}
              icon="work"
              trend={`+3 from last month`}
              trendColor="text-success"
              accent="text-primary"
              onClick={() => navigate('/clients')}
            />
            <MetricCard
              label="In Screening"
              value={inScreening}
              icon="filter_list"
              trend={`${Math.round(inScreening * 0.35)} awaiting feedback`}
              trendColor="text-slate-400"
              accent="text-teal"
            />
            <MetricCard
              label="In Interview"
              value={inInterview}
              icon="calendar_today"
              trend={`${Math.ceil(inInterview / 2)} scheduled this week`}
              trendColor="text-primary"
              accent="text-client-purple"
            />
            <MetricCard
              label="Reminders Due"
              value={allDueReminders.length}
              icon="notifications_active"
              trend={overdueReminders.length > 0 ? `${overdueReminders.length} overdue` : 'All on track'}
              trendColor={overdueReminders.length > 0 ? 'text-danger' : 'text-success'}
              accent={overdueReminders.length > 0 ? 'text-danger' : 'text-success'}
            />
          </div>

          {/* ── Middle row: chart + due today ── */}
          <div className="grid grid-cols-12 gap-4">

            {/* Candidates by stage bar chart */}
            <div className="col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold text-slate-800">Candidates by Stage</h2>
                <span className="text-xs text-slate-400">
                  {candidates.length} total
                </span>
              </div>
              <div className="space-y-4">
                {PIPELINE_STAGES.map((stage) => {
                  const count = candidatesByStage[stage]
                  const pct = Math.round((count / maxStageCount) * 100)
                  return (
                    <div key={stage} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-16 text-right flex-shrink-0">
                        {STAGE_LABELS[stage]}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${stageBarColors[stage]} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-6 text-right flex-shrink-0">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Stage summary chips */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {PIPELINE_STAGES.map((stage) => (
                  <span key={stage} className={`text-xs font-medium px-2.5 py-1 rounded-full ${stageBadge[stage]}`}>
                    {STAGE_LABELS[stage]}: {candidatesByStage[stage]}
                  </span>
                ))}
              </div>
            </div>

            {/* Due Today reminders */}
            <div className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <h2 className="text-sm font-semibold text-slate-800">Due Today</h2>
                {allDueReminders.length > 0 && (
                  <span className="bg-danger text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {allDueReminders.length}
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {allDueReminders.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    <span className="material-symbols-outlined block text-4xl mb-2 text-slate-200">check_circle</span>
                    All caught up!
                  </div>
                ) : (
                  allDueReminders.slice(0, 8).map((c) => {
                    const job = jobs.find((j) => j.id === c.jobId)
                    const isOverdue = c.reminderOverdue
                    return (
                      <div
                        key={c.id}
                        className="px-4 py-3 hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/jobs/${c.jobId}/pipeline`)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <StatusDot lastActivityDate={c.lastActivityDate} reminderOverdue={c.reminderOverdue} />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-700 truncate">{c.name}</p>
                              <p className="text-xs text-slate-400 truncate mt-0.5">{job?.title}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold flex-shrink-0 ${isOverdue ? 'text-danger' : 'text-warning'}`}>
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

          {/* ── Bottom row: active jobs + recent placements ── */}
          <div className="grid grid-cols-12 gap-4">

            {/* Active jobs by client */}
            <div className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-800">Active Jobs by Client</h2>
                <button
                  onClick={() => navigate('/clients')}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {clients.map((client) => {
                  const clientJobs = getJobsByClientId(client.id)
                  const activeCount = clientJobs.filter((j) => j.status === 'active').length
                  if (activeCount === 0) return null
                  return (
                    <div
                      key={client.id}
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {client.companyName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-700 truncate group-hover:text-primary transition-colors">
                          {client.companyName}
                        </div>
                        <div className="text-xs text-slate-400">{client.industry}</div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs font-bold text-slate-700">{activeCount}</span>
                        <span className="text-xs text-slate-400">jobs</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent placements */}
            <div className="col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Recent Placements</h2>
                <span className="text-xs text-slate-400">{recentPlacements.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3 font-semibold text-slate-400 uppercase tracking-wider">Candidate</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider">Job</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider">Salary</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider">Placed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentPlacements.map(({ candidate: c, job, client }) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/jobs/${c.jobId}`)}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <StatusDot lastActivityDate={c.lastActivityDate} reminderOverdue={false} />
                            <span className="font-semibold text-slate-700">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{job?.title}</td>
                        <td className="px-4 py-3 text-slate-500">{client?.companyName}</td>
                        <td className="px-4 py-3 font-mono font-medium text-success">
                          {job ? `${formatSalary(job.salaryMin)}–${formatSalary(job.salaryMax)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{daysAgo(c.lastActivityDate)}</td>
                      </tr>
                    ))}
                    {recentPlacements.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                          No placements yet
                        </td>
                      </tr>
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
