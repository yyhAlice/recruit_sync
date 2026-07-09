import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import { activityLogs, clients, jobs } from '../data/mockData'

const typeBadge: Record<string, string> = {
  Call:    'bg-blue-100 text-blue-700',
  Email:   'bg-purple-100 text-purple-700',
  Meeting: 'bg-teal-100 text-teal-700',
  Chat:    'bg-amber-100 text-amber-700',
}

const typeIcon: Record<string, string> = {
  Call: 'phone', Email: 'mail', Meeting: 'groups', Chat: 'chat',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysAgo(dateStr: string) {
  const diff = Math.floor((new Date('2026-07-01').getTime() - new Date(dateStr).getTime()) / 86400000)
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${diff} days ago`
}

const allTypes = ['All Types', 'Call', 'Email', 'Meeting', 'Chat']
const allAuthors = ['All', ...Array.from(new Set(activityLogs.map((l) => l.author)))]

// Enrich logs with target name and navigation
const enriched = activityLogs
  .map((log) => {
    const client = clients.find((c) => c.id === log.targetId)
    const job    = jobs.find((j) => j.id === log.targetId)
    const target = client ?? job
    const isClient = !!client
    return { ...log, targetName: target ? (isClient ? client!.companyName : job!.title) : log.targetId, isClient, targetNav: isClient ? `/clients/${log.targetId}` : `/jobs/${log.targetId}` }
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

export default function ActivityLogPage() {
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter]     = useState('All Types')
  const [authorFilter, setAuthorFilter] = useState('All')
  const [search, setSearch]             = useState('')

  const filtered = useMemo(() => enriched.filter((l) => {
    const q = search.toLowerCase()
    const matchSearch = l.summary.toLowerCase().includes(q) || l.targetName.toLowerCase().includes(q)
    const matchType   = typeFilter === 'All Types' || l.type === typeFilter
    const matchAuthor = authorFilter === 'All' || l.author === authorFilter
    return matchSearch && matchType && matchAuthor
  }), [typeFilter, authorFilter, search])

  // Group by date
  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    filtered.forEach((l) => {
      const g = map.get(l.date) ?? []
      g.push(l)
      map.set(l.date, g)
    })
    return Array.from(map.entries()).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
  }, [filtered])

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Activity Logs"
          subtitle={`${activityLogs.length} activities recorded`}
          actions={
            <button disabled className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg opacity-60 cursor-not-allowed">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Log Activity
            </button>
          }
        />

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200">
          <div className="relative flex-1 max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '16px' }}>search</span>
            <input type="text" placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30">
            {allTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30">
            {allAuthors.map((a) => <option key={a}>{a}</option>)}
          </select>

          {/* Type chips */}
          <div className="flex gap-1 ml-auto">
            {Object.entries(typeBadge).map(([type, cls]) => (
              <span key={type} className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
                {activityLogs.filter((l) => l.type === type).length} {type}s
              </span>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">No activity logs found.</div>
          ) : (
            <div className="space-y-8">
              {groups.map(([date, logs]) => (
                <div key={date}>
                  {/* Date separator */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-semibold text-slate-400 bg-surface px-3 py-1 rounded-full border border-slate-200">
                      {formatDate(date)} · {daysAgo(date)}
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div key={log.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeBadge[log.type]}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{typeIcon[log.type]}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeBadge[log.type]}`}>{log.type}</span>
                              <button
                                onClick={() => navigate(log.targetNav)}
                                className="text-xs font-semibold text-primary hover:underline"
                              >
                                {log.targetName}
                              </button>
                              <span className="text-xs text-slate-400 ml-auto">{log.author}</span>
                            </div>

                            <p className="text-sm text-slate-700 leading-relaxed">{log.summary}</p>

                            {log.nextAction && (
                              <div className="mt-3 flex items-start gap-2 bg-primary/5 rounded-lg px-3 py-2">
                                <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '14px' }}>arrow_forward</span>
                                <p className="text-xs font-medium text-primary">{log.nextAction}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
