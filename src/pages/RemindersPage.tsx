import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import { candidates, jobs, clients } from '../data/mockData'

const TODAY = '2026-07-01'

function daysUntil(dateStr: string) {
  const diff = Math.floor((new Date(dateStr).getTime() - new Date(TODAY).getTime()) / 86400000)
  if (diff < 0)  return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Candidates with reminders
const withReminders = candidates
  .filter((c) => c.nextReminderDate || c.reminderOverdue)
  .map((c) => {
    const job    = jobs.find((j) => j.id === c.jobId)
    const client = clients.find((cl) => cl.id === job?.clientId)
    return { ...c, job, client }
  })

const overdue  = withReminders.filter((c) => c.reminderOverdue)
const dueToday = withReminders.filter((c) => !c.reminderOverdue && c.nextReminderDate === TODAY)
const upcoming = withReminders.filter((c) => !c.reminderOverdue && c.nextReminderDate && c.nextReminderDate > TODAY)

type Section = 'all' | 'overdue' | 'today' | 'upcoming'

export default function RemindersPage() {
  const navigate = useNavigate()
  const [section, setSection] = useState<Section>('all')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDismissed((prev) => new Set(prev).add(id))
  }

  const tabs: { key: Section; label: string; count: number; color: string }[] = [
    { key: 'all',      label: 'All',      count: withReminders.length - dismissed.size, color: 'text-slate-600' },
    { key: 'overdue',  label: 'Overdue',  count: overdue.filter(c => !dismissed.has(c.id)).length,  color: 'text-danger' },
    { key: 'today',    label: 'Due Today', count: dueToday.filter(c => !dismissed.has(c.id)).length, color: 'text-warning' },
    { key: 'upcoming', label: 'Upcoming', count: upcoming.filter(c => !dismissed.has(c.id)).length, color: 'text-success' },
  ]

  function renderGroup(
    title: string,
    items: typeof withReminders,
    accent: string,
    icon: string,
    badgeCls: string,
  ) {
    const visible = items.filter((c) => !dismissed.has(c.id))
    if (visible.length === 0) return null
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className={`material-symbols-outlined ${accent}`} style={{ fontSize: '18px' }}>{icon}</span>
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeCls}`}>{visible.length}</span>
        </div>
        <div className="space-y-2">
          {visible.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/candidates/${c.id}`)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">{c.name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">{c.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{c.job?.title} · {c.client?.companyName}</div>
                  {c.nextReminderDate && (
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>calendar_today</span>
                      {formatDate(c.nextReminderDate)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  c.reminderOverdue
                    ? 'bg-red-50 text-danger'
                    : c.nextReminderDate === TODAY
                    ? 'bg-amber-50 text-warning'
                    : 'bg-green-50 text-success'
                }`}>
                  {c.nextReminderDate ? daysUntil(c.nextReminderDate) : 'Overdue'}
                </span>
                <button
                  onClick={(e) => dismiss(c.id, e)}
                  className="flex items-center gap-1 text-xs font-medium text-success bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>check</span>
                  Done
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${c.jobId}/pipeline`) }}
                  className="text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Reminders"
          subtitle="Follow-up reminders across all candidates"
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 bg-white border-b border-slate-200">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setSection(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                section === t.key ? 'bg-primary text-white' : `${t.color} hover:bg-slate-100`
              }`}
            >
              {t.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${section === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {(section === 'all' || section === 'overdue') &&
            renderGroup('Overdue', overdue, 'text-danger', 'notification_important', 'bg-red-50 text-danger')}
          {(section === 'all' || section === 'today') &&
            renderGroup('Due Today', dueToday, 'text-warning', 'today', 'bg-amber-50 text-warning')}
          {(section === 'all' || section === 'upcoming') &&
            renderGroup('Upcoming', upcoming, 'text-success', 'upcoming', 'bg-green-50 text-success')}

          {withReminders.filter((c) => !dismissed.has(c.id)).length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">check_circle</span>
              <p className="text-sm font-medium">All reminders cleared!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
