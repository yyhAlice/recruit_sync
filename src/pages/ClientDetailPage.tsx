import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import StatusDot from '../components/StatusDot'
import {
  getClientById,
  getJobsByClientId,
  getCandidatesByJobId,
  getActivityLogsByTargetId,
  getActiveJobsCount,
} from '../data/mockData'
import { initialReminders } from '../data/remindersMockData'
import { TODAY } from '../utils/format'

type Tab = 'jobs' | 'activity' | 'files' | 'reminders'

const industryBadge: Record<string, string> = {
  Technology: 'bg-blue-100 text-blue-700',
  Finance: 'bg-purple-100 text-purple-700',
  Manufacturing: 'bg-teal-100 text-teal-700',
  Trading: 'bg-amber-100 text-amber-700',
}

const statusBadge: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  'on-hold': 'bg-amber-100 text-amber-700',
  closed: 'bg-slate-100 text-slate-500',
}

const activityTypeBadge: Record<string, string> = {
  Call: 'bg-blue-100 text-blue-700',
  Email: 'bg-purple-100 text-purple-700',
  Meeting: 'bg-teal-100 text-teal-700',
  Chat: 'bg-amber-100 text-amber-700',
}

function daysAgo(dateStr: string): string {
  const ref = new Date('2026-07-01')
  const d = new Date(dateStr)
  const days = Math.floor((ref.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('jobs')

  const client = getClientById(clientId ?? '')
  if (!client) {
    return (
      <div className="flex h-screen bg-surface">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Client not found</div>
        </div>
      </div>
    )
  }

  const jobs = getJobsByClientId(client.id)
  const activeJobsCount = getActiveJobsCount(client.id)
  const activityLogs = getActivityLogsByTargetId(client.id)
  const badgeClass = industryBadge[client.industry] ?? 'bg-slate-100 text-slate-600'

  const totalCandidates = jobs.reduce((sum, job) => sum + getCandidatesByJobId(job.id).length, 0)
  const ytdPlacements = jobs.reduce((sum, job) => sum + getCandidatesByJobId(job.id).filter(c => c.stage === 'placed').length, 0)

  const clientReminders = initialReminders.filter((r) => r.clientId === client.id)
  const openClientReminders  = clientReminders.filter((r) => r.status === 'open')
  const doneClientReminders  = clientReminders.filter((r) => r.status === 'completed')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'jobs', label: 'Jobs' },
    { id: 'activity', label: 'Activity Logs' },
    { id: 'files', label: 'Files' },
    { id: 'reminders', label: `Reminders${openClientReminders.length ? ` (${openClientReminders.length})` : ''}` },
  ]

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title={client.companyName}
          breadcrumbs={[
            { label: 'Clients', to: '/clients' },
            { label: client.companyName },
          ]}
          actions={
            <button
              disabled
              className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg opacity-60 cursor-not-allowed"
            >
              Edit Client
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Info cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Contact card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact</div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-400">Contact Person</div>
                  <div className="text-sm font-semibold text-slate-800">{client.contactPerson}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Email</div>
                  <div className="text-sm text-primary">{client.email}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Phone</div>
                  <div className="text-sm text-slate-700">{client.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Website</div>
                  <div className="text-sm text-primary">{client.website}</div>
                </div>
              </div>
            </div>

            {/* Company card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Company</div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-400">Industry</div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
                    {client.industry}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Address</div>
                  <div className="text-sm text-slate-700">{client.address}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Notes</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{client.notes}</div>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Activity Summary</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Active Jobs</span>
                  <span className="text-sm font-bold text-primary">{activeJobsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Total Candidates</span>
                  <span className="text-sm font-semibold text-slate-700">{totalCandidates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Last Contact</span>
                  <div className="flex items-center gap-1.5">
                    <StatusDot lastActivityDate={client.lastContactDate} />
                    <span className="text-xs text-slate-600">{daysAgo(client.lastContactDate)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Open Reminders</span>
                  <span className={`text-sm font-semibold ${openClientReminders.length > 0 ? 'text-warning' : 'text-success'}`}>{openClientReminders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">YTD Placements</span>
                  <span className="text-sm font-bold text-success">{ytdPlacements}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary -mb-px bg-primary/5'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* Jobs tab */}
              {activeTab === 'jobs' && (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">Job Title</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">Type</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">Status</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">Candidates</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">Closing Date</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const candidateCount = getCandidatesByJobId(job.id).length
                      return (
                        <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4 text-sm font-medium text-slate-800">{job.title}</td>
                          <td className="py-3 pr-4 text-xs text-slate-500">{job.employmentType}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[job.status]}`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-sm text-slate-600">{candidateCount}</td>
                          <td className="py-3 pr-4 text-sm text-slate-500">{formatDate(job.closingDate)}</td>
                          <td className="py-3">
                            <button
                              onClick={() => navigate(`/jobs/${job.id}`)}
                              className="text-xs font-medium text-primary hover:text-primary-dark bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {/* Activity Logs tab */}
              {activeTab === 'activity' && (
                <div className="space-y-3">
                  {activityLogs.length === 0 ? (
                    <div className="text-sm text-slate-400 text-center py-6">No activity logs</div>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${activityTypeBadge[log.type]}`}>
                              {log.type}
                            </span>
                            <span className="text-xs text-slate-500">{log.author}</span>
                          </div>
                          <span className="text-xs text-slate-400">{formatDate(log.date)}</span>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{log.summary}</p>
                        {log.nextAction && (
                          <div className="flex items-center gap-1.5 text-xs text-primary">
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_forward</span>
                            <span>{log.nextAction}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Files tab */}
              {activeTab === 'files' && (
                <div className="space-y-2">
                  {[
                    { name: 'Client_Agreement_2026.pdf', date: '2026-01-15' },
                    { name: 'Job_Brief_Q2_2026.docx', date: '2026-04-01' },
                  ].map((file) => (
                    <div key={file.name} className="flex items-center justify-between bg-slate-50 rounded-lg border border-slate-200 px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '20px' }}>description</span>
                        <div>
                          <div className="text-sm font-medium text-slate-700">{file.name}</div>
                          <div className="text-xs text-slate-400">{formatDate(file.date)}</div>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Reminders tab */}
              {activeTab === 'reminders' && (
                <div className="space-y-2">
                  {clientReminders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">notifications_off</span>
                      <p className="text-sm text-slate-400">No reminders for this client</p>
                    </div>
                  ) : (
                    <>
                      {openClientReminders.map((r) => {
                        const isOverdue = r.dueDate < TODAY
                        return (
                          <div key={r.id} className={`flex items-center justify-between rounded-lg border px-4 py-3 ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${r.priority === 'high' ? 'text-red-600 bg-red-100' : r.priority === 'medium' ? 'text-amber-600 bg-amber-100' : 'text-slate-500 bg-slate-100'}`}>
                                {r.priority}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm text-slate-700 font-medium truncate">{r.title}</p>
                                <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                                  Due {formatDate(r.dueDate)}{isOverdue ? ' · Overdue' : ''}
                                </p>
                              </div>
                            </div>
                            <button onClick={() => navigate('/reminders')} className="flex-shrink-0 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors ml-3">
                              View
                            </button>
                          </div>
                        )
                      })}
                      {doneClientReminders.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Completed ({doneClientReminders.length})</p>
                          {doneClientReminders.map((r) => (
                            <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100 mb-1.5 opacity-60">
                              <span className="material-symbols-outlined text-success" style={{ fontSize: '14px' }}>check_circle</span>
                              <p className="text-xs text-slate-400 line-through">{r.title}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
