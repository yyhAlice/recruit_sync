import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import StatusDot from '../components/StatusDot'
import { candidates, jobs, clients, recruiters, PIPELINE_STAGES, STAGE_LABELS } from '../data/mockData'
import type { PipelineStage } from '../types'

const stageBadge: Record<PipelineStage, string> = {
  sourced:   'bg-slate-100 text-slate-600',
  screening: 'bg-blue-100 text-blue-700',
  interview: 'bg-teal-100 text-teal-700',
  offered:   'bg-purple-100 text-purple-700',
  placed:    'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-600',
}

const stageBarColor: Record<PipelineStage, string> = {
  sourced: 'bg-slate-400', screening: 'bg-primary', interview: 'bg-teal',
  offered: 'bg-client-purple', placed: 'bg-success', rejected: 'bg-danger',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CandidateProfilePage() {
  const { candidateId } = useParams<{ candidateId: string }>()
  const navigate = useNavigate()

  const candidate = candidates.find((c) => c.id === candidateId)
  if (!candidate) return (
    <div className="flex h-screen items-center justify-center text-slate-400">
      Candidate not found.
    </div>
  )

  const job    = jobs.find((j) => j.id === candidate.jobId)
  const client = clients.find((cl) => cl.id === job?.clientId)
  const rec    = recruiters.find((r) => r.id === candidate.recruiterId)

  const stageIdx      = PIPELINE_STAGES.indexOf(candidate.stage)
  const isRejected    = candidate.stage === 'rejected'

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title={candidate.name}
          subtitle={`${candidate.location} · ${candidate.experienceYears} years experience`}
          breadcrumbs={[
            { label: 'Candidates', to: '/candidates' },
            { label: candidate.name },
          ]}
          actions={
            <button
              onClick={() => navigate(`/jobs/${candidate.jobId}/pipeline`)}
              className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>view_kanban</span>
              View Pipeline
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-12 gap-5">

            {/* Left: Profile card */}
            <div className="col-span-4 space-y-4">

              {/* Identity card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary">{candidate.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{candidate.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StatusDot lastActivityDate={candidate.lastActivityDate} reminderOverdue={candidate.reminderOverdue} />
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stageBadge[candidate.stage]}`}>
                        {STAGE_LABELS[candidate.stage]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '16px' }}>location_on</span>
                    {candidate.location}
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '16px' }}>mail</span>
                    {candidate.email}
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '16px' }}>work_history</span>
                    {candidate.experienceYears} years experience
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '16px' }}>calendar_today</span>
                    Applied {formatDate(candidate.appliedDate)}
                  </div>
                </div>

                {/* Skills */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((s) => (
                      <span key={s} className="text-xs bg-primary/5 text-primary font-medium px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assignment card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Current Assignment</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Position</div>
                    <button onClick={() => navigate(`/jobs/${job?.id}`)} className="text-sm font-semibold text-primary hover:underline text-left">
                      {job?.title}
                    </button>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Client</div>
                    <button onClick={() => navigate(`/clients/${client?.id}`)} className="text-sm font-medium text-slate-700 hover:text-primary text-left">
                      {client?.companyName}
                    </button>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Recruiter</div>
                    <div className="text-sm text-slate-700">{rec?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Salary Range</div>
                    <div className="text-sm font-mono font-medium text-slate-700">
                      ¥{((job?.salaryMin ?? 0) / 1e6).toFixed(0)}M – ¥{((job?.salaryMax ?? 0) / 1e6).toFixed(0)}M
                    </div>
                  </div>
                </div>
              </div>

              {/* Reminder card */}
              <div className={`rounded-xl border shadow-sm p-5 ${candidate.reminderOverdue ? 'bg-red-50 border-red-100' : candidate.nextReminderDate ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`material-symbols-outlined ${candidate.reminderOverdue ? 'text-danger' : candidate.nextReminderDate ? 'text-warning' : 'text-success'}`} style={{ fontSize: '18px' }}>
                    {candidate.reminderOverdue ? 'notification_important' : candidate.nextReminderDate ? 'notifications' : 'check_circle'}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Reminder</span>
                </div>
                <div className="text-sm font-semibold text-slate-700">
                  {candidate.reminderOverdue
                    ? 'Overdue — Follow up immediately'
                    : candidate.nextReminderDate
                    ? `Due ${formatDate(candidate.nextReminderDate)}`
                    : 'No upcoming reminder'}
                </div>
              </div>
            </div>

            {/* Right: Pipeline progress + last activity */}
            <div className="col-span-8 space-y-5">

              {/* Pipeline progress */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-5">Pipeline Progress</h3>
                <div className="flex items-center gap-0">
                  {PIPELINE_STAGES.filter(s => s !== 'rejected').map((s, i, arr) => {
                    const past    = PIPELINE_STAGES.indexOf(s) < stageIdx && !isRejected
                    const current = s === candidate.stage
                    const future  = PIPELINE_STAGES.indexOf(s) > stageIdx || isRejected
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            current ? 'bg-primary text-white ring-4 ring-primary/20' :
                            past    ? 'bg-success text-white' :
                                      'bg-slate-100 text-slate-400'
                          }`}>
                            {past ? '✓' : i + 1}
                          </div>
                          <div className={`text-xs font-medium ${current ? 'text-primary' : past ? 'text-success' : 'text-slate-400'}`}>
                            {STAGE_LABELS[s]}
                          </div>
                        </div>
                        {i < arr.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-1 ${past || current ? 'bg-primary/30' : 'bg-slate-100'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
                {isRejected && (
                  <div className="mt-4 text-center">
                    <span className="text-xs font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full">
                      Candidate was rejected
                    </span>
                  </div>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Job Requirements</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Japanese Level</span>
                      <span className="font-semibold text-slate-700">{job?.japaneseLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">English Level</span>
                      <span className="font-semibold text-slate-700">{job?.englishLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Exp Required</span>
                      <span className="font-semibold text-slate-700">{job?.experienceYears}+ years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location</span>
                      <span className="font-semibold text-slate-700">{job?.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Type</span>
                      <span className="font-semibold text-slate-700">{job?.employmentType}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Timeline</div>
                  <div className="space-y-3">
                    {[
                      { label: 'Applied', date: candidate.appliedDate, icon: 'send', color: 'text-slate-400' },
                      { label: 'Last Activity', date: candidate.lastActivityDate, icon: 'history', color: 'text-primary' },
                      { label: 'Next Reminder', date: candidate.nextReminderDate ?? '—', icon: 'notifications', color: candidate.reminderOverdue ? 'text-danger' : 'text-warning' },
                    ].map(({ label, date, icon, color }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined ${color}`} style={{ fontSize: '15px' }}>{icon}</span>
                          <span className="text-slate-500">{label}</span>
                        </div>
                        <span className="font-medium text-slate-700 text-xs">
                          {date === '—' ? '—' : formatDate(date)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Job required skills vs candidate skills */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Skill Match</h3>
                <div className="space-y-2">
                  {(job?.requiredSkills ?? []).map((skill) => {
                    const has = candidate.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))
                    return (
                      <div key={skill} className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-sm ${has ? 'text-success' : 'text-slate-300'}`} style={{ fontSize: '16px' }}>
                          {has ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={`text-sm ${has ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{skill}</span>
                        {has && <span className="text-xs bg-green-50 text-success px-2 py-0.5 rounded-full font-medium ml-auto">Matched</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
