import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import { jobs, clients, candidates } from '../data/mockData'

const TODAY = new Date('2026-07-01')

const statusBadge: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  'on-hold': 'bg-amber-100 text-amber-700',
  closed: 'bg-slate-100 text-slate-500',
}

const statusIcon: Record<string, string> = {
  active: 'check_circle',
  'on-hold': 'pause_circle',
  closed: 'cancel',
}

function formatSalary(n: number) {
  return `¥${(n / 1_000_000).toFixed(0)}M`
}

function daysUntilClose(dateStr: string): string {
  const close = new Date(dateStr)
  const diff = Math.floor((close.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Expired'
  if (diff === 0) return 'Today'
  if (diff <= 7) return `${diff}d left`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function daysUntilColor(dateStr: string, status: string): string {
  if (status === 'closed') return 'text-slate-400'
  const close = new Date(dateStr)
  const diff = Math.floor((close.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'text-danger font-semibold'
  if (diff <= 7) return 'text-warning font-semibold'
  return 'text-slate-500'
}

const allClients = ['All Clients', ...clients.map((c) => c.companyName)]
const allLocations = ['All Locations', ...Array.from(new Set(jobs.map((j) => j.location)))]
const allStatuses = ['All Status', 'active', 'on-hold', 'closed']

// Pre-compute candidate counts per job
const candidateCountByJob = Object.fromEntries(
  jobs.map((j) => {
    const all = candidates.filter((c) => c.jobId === j.id)
    const active = all.filter((c) => c.stage !== 'rejected' && c.stage !== 'placed').length
    return [j.id, { total: all.length, active }]
  })
)

export default function JobListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [clientFilter, setClientFilter] = useState('All Clients')
  const [locationFilter, setLocationFilter] = useState('All Locations')

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const client = clients.find((c) => c.id === j.clientId)
      const matchSearch =
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        (client?.companyName ?? '').toLowerCase().includes(search.toLowerCase()) ||
        j.requiredSkills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = statusFilter === 'All Status' || j.status === statusFilter
      const matchClient = clientFilter === 'All Clients' || client?.companyName === clientFilter
      const matchLocation = locationFilter === 'All Locations' || j.location === locationFilter
      return matchSearch && matchStatus && matchClient && matchLocation
    })
  }, [search, statusFilter, clientFilter, locationFilter])

  const totalActive = jobs.filter((j) => j.status === 'active').length
  const totalOnHold = jobs.filter((j) => j.status === 'on-hold').length
  const totalClosed = jobs.filter((j) => j.status === 'closed').length

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Jobs"
          subtitle={`${jobs.length} total positions across ${clients.length} clients`}
          breadcrumbs={[]}
          actions={
            <button
              disabled
              className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg opacity-60 cursor-not-allowed"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Add Job
            </button>
          }
        />

        {/* Stats bar */}
        <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-slate-200">
          <StatChip label="Active" value={totalActive} color="text-success" bg="bg-green-50" />
          <div className="w-px h-4 bg-slate-200" />
          <StatChip label="On Hold" value={totalOnHold} color="text-warning" bg="bg-amber-50" />
          <div className="w-px h-4 bg-slate-200" />
          <StatChip label="Closed" value={totalClosed} color="text-slate-500" bg="bg-slate-50" />
          <div className="flex-1" />
          <span className="text-xs text-slate-400">{filtered.length} showing</span>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200">
          <div className="relative flex-1 max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '16px' }}>search</span>
            <input
              type="text"
              placeholder="Search title, client, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {allStatuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {allClients.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {allLocations.map((l) => <option key={l}>{l}</option>)}
          </select>
          {(search || statusFilter !== 'All Status' || clientFilter !== 'All Clients' || locationFilter !== 'All Locations') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('All Status'); setClientFilter('All Clients'); setLocationFilter('All Locations') }}
              className="text-xs text-slate-400 hover:text-danger flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Job Title</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Client</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Location</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Salary</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Skills</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Candidates</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Closing</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => {
                  const client = clients.find((c) => c.id === job.clientId)
                  const counts = candidateCountByJob[job.id]
                  const closingLabel = daysUntilClose(job.closingDate)
                  const closingColor = daysUntilColor(job.closingDate, job.status)

                  return (
                    <tr
                      key={job.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      {/* Title + type + exp */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{job.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-slate-400">{job.employmentType}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-400">{job.experienceYears}yr exp</span>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/clients/${job.clientId}`) }}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {client?.companyName}
                        </button>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-slate-600">
                          <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '13px' }}>location_on</span>
                          {job.location}
                        </div>
                      </td>

                      {/* Salary */}
                      <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-700 whitespace-nowrap">
                        {formatSalary(job.salaryMin)}–{formatSalary(job.salaryMax)}
                      </td>

                      {/* Skills */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {job.requiredSkills.slice(0, 3).map((skill) => (
                            <span key={skill} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 3 && (
                            <span className="text-xs text-slate-400">+{job.requiredSkills.length - 3}</span>
                          )}
                        </div>
                      </td>

                      {/* Candidate count */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-700">{counts.total}</span>
                          {counts.active > 0 && (
                            <span className="text-xs bg-blue-50 text-primary px-1.5 py-0.5 rounded font-medium">
                              {counts.active} active
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[job.status]}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{statusIcon[job.status]}</span>
                          {job.status === 'on-hold' ? 'On Hold' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>

                      {/* Closing date */}
                      <td className={`px-4 py-3.5 text-xs ${closingColor}`}>
                        {closingLabel}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="text-xs font-medium text-primary hover:text-primary-dark bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/jobs/${job.id}/pipeline`)}
                            className="text-xs font-medium text-teal hover:text-teal/80 bg-teal/5 hover:bg-teal/10 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>view_kanban</span>
                            Pipeline
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center">
                      <span className="material-symbols-outlined block text-5xl text-slate-200 mb-2">work_off</span>
                      <p className="text-sm text-slate-400">No jobs match your filters</p>
                      <button
                        onClick={() => { setSearch(''); setStatusFilter('All Status'); setClientFilter('All Clients'); setLocationFilter('All Locations') }}
                        className="mt-3 text-xs text-primary hover:underline"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-slate-400 text-right">
            Showing {filtered.length} of {jobs.length} jobs
          </div>
        </div>
      </div>
    </div>
  )
}

function StatChip({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${bg}`}>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}
