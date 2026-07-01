import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import StatusDot from '../components/StatusDot'
import {
  getJobById,
  getClientById,
  getCandidatesByJobId,
  getRecruiterById,
  getActivityLogsByTargetId,
} from '../data/mockData'
import type { PipelineStage } from '../types'

type Tab = 'candidates' | 'activity' | 'files'

const stageBadge: Record<PipelineStage, string> = {
  sourced: 'bg-slate-100 text-slate-600',
  screening: 'bg-blue-100 text-blue-700',
  interview: 'bg-teal-100 text-teal-700',
  offered: 'bg-purple-100 text-purple-700',
  placed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatSalary(n: number): string {
  return `¥${(n / 1000000).toFixed(0)}M`
}

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('candidates')

  const job = getJobById(jobId ?? '')
  const client = job ? getClientById(job.clientId) : undefined

  if (!job || !client) {
    return (
      <div className="flex h-screen bg-surface">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Job not found</div>
        </div>
      </div>
    )
  }

  const candidates = getCandidatesByJobId(job.id)
  const activityLogs = getActivityLogsByTargetId(job.id)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'candidates', label: 'Candidates' },
    { id: 'activity', label: 'Activity Logs' },
    { id: 'files', label: 'Files' },
  ]

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title={job.title}
          subtitle={client.companyName}
          breadcrumbs={[
            { label: 'Clients', to: '/clients' },
            { label: client.companyName, to: `/clients/${client.id}` },
            { label: job.title },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <button
                disabled
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg opacity-60 cursor-not-allowed"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>upload_file</span>
                Upload CV
              </button>
              <button
                onClick={() => navigate(`/jobs/${job.id}/pipeline`)}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark px-3 py-1.5 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>view_kanban</span>
                Pipeline Board
              </button>
            </div>
          }
        />

        {/* Badge row */}
        <div className="flex items-center gap-2.5 px-6 py-3 bg-white border-b border-slate-200 flex-wrap">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge[job.status]}`}>
            {job.status}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {job.employmentType}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
            {job.location}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>payments</span>
            {formatSalary(job.salaryMin)} – {formatSalary(job.salaryMax)} JPY
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_month</span>
            Closes {formatDate(job.closingDate)}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>translate</span>
            {job.japaneseLevel} · {job.englishLevel}
          </div>
          <div className="flex gap-1 flex-wrap">
            {job.requiredSkills.map((skill) => (
              <span key={skill} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary -mb-px bg-primary/5'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'candidates' && (
                    <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5">
                      {candidates.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* Candidates tab */}
              {activeTab === 'candidates' && (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">Candidate</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">Stage</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">Applied</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">Recruiter</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">Next Reminder</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">Pipeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate) => {
                      const recruiter = getRecruiterById(candidate.recruiterId)
                      return (
                        <tr key={candidate.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <StatusDot
                                lastActivityDate={candidate.lastActivityDate}
                                reminderOverdue={candidate.reminderOverdue}
                              />
                              <div>
                                <div className="text-sm font-medium text-slate-800">{candidate.name}</div>
                                <div className="text-xs text-slate-400">{candidate.location}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageBadge[candidate.stage]}`}>
                              {candidate.stage}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-sm text-slate-500">{formatDate(candidate.appliedDate)}</td>
                          <td className="py-3 pr-4 text-sm text-slate-600">{recruiter?.name ?? candidate.recruiterId}</td>
                          <td className="py-3 pr-4">
                            {candidate.nextReminderDate ? (
                              <span className={`text-xs ${candidate.reminderOverdue ? 'text-danger font-medium' : 'text-slate-500'}`}>
                                {formatDate(candidate.nextReminderDate)}
                                {candidate.reminderOverdue && ' ⚠'}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => navigate(`/jobs/${job.id}/pipeline`)}
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
                  {[{ name: `Job_Description_${job.title.replace(/\s+/g, '_')}.pdf`, date: '2026-06-01' }].map((file) => (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
