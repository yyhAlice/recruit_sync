import { useState, useMemo, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import {
  initialActivities,
  ACTIVITY_LABELS, ACTIVITY_EMOJI, ACTIVITY_COLORS, STATUS_COLORS,
  type Activity, type ActivityType, type ActivityStatus,
} from '../data/activityMockData'
import { clients, jobs, candidates, recruiters } from '../data/mockData'

const LS_KEY = 'rs_activities_local'

function loadLocal(): Activity[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}
function saveLocal(items: Activity[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

function dateLabel(ts: string): string {
  const d = new Date(ts)
  const today = new Date('2026-07-11')
  const diff = Math.floor((today.getTime() - d.setHours(0, 0, 0, 0)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return d.toLocaleDateString('en-US', { weekday: 'long' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function groupKey(ts: string) { return ts.slice(0, 10) }

function fmtTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// ── Activity type → icon config ───────────────────────────────────────────────
const TYPE_BG: Record<ActivityType, string> = {
  call:          'bg-green-100',
  email:         'bg-indigo-100',
  meeting:       'bg-blue-100',
  candidate:     'bg-teal-100',
  client:        'bg-purple-100',
  job:           'bg-slate-100',
  cv_generated:  'bg-violet-100',
  file_uploaded: 'bg-orange-100',
  note:          'bg-gray-100',
  reminder:      'bg-amber-100',
  task:          'bg-emerald-100',
}
const TYPE_ICON_COLOR: Record<ActivityType, string> = {
  call:          'text-green-600',
  email:         'text-indigo-600',
  meeting:       'text-blue-600',
  candidate:     'text-teal-600',
  client:        'text-purple-600',
  job:           'text-slate-500',
  cv_generated:  'text-violet-600',
  file_uploaded: 'text-orange-600',
  note:          'text-gray-500',
  reminder:      'text-amber-600',
  task:          'text-emerald-600',
}
const TYPE_ICON: Record<ActivityType, string> = {
  call:          'call',
  email:         'mail',
  meeting:       'groups',
  candidate:     'person_search',
  client:        'business',
  job:           'work',
  cv_generated:  'description',
  file_uploaded: 'upload_file',
  note:          'edit_note',
  reminder:      'notifications',
  task:          'task_alt',
}

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_CFG: Record<ActivityStatus, { bg: string; text: string; dot: string; label: string }> = {
  completed: { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Completed' },
  pending:   { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500',  label: 'Pending'   },
  info:      { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'Info'      },
  cancelled: { bg: 'bg-slate-100',  text: 'text-slate-500',  dot: 'bg-slate-400',  label: 'Cancelled' },
  failed:    { bg: 'bg-rose-100',   text: 'text-rose-700',   dot: 'bg-rose-500',   label: 'Failed'    },
}

// Statuses available in the editable dropdown (excludes system-only 'info')
const EDITABLE_STATUSES: ActivityStatus[] = ['pending', 'completed', 'cancelled', 'failed']

// ── Recruiter avatar ──────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-teal-500',
]
function RecruiterAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  const color = AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]
  return (
    <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
      <span className="text-[9px] font-bold text-white">{initials}</span>
    </div>
  )
}
function shortName(name: string): string {
  const parts = name.split(' ')
  return parts.length < 2 ? name : `${parts[0][0]}. ${parts.slice(1).join(' ')}`
}

// ── Quick filter chips ────────────────────────────────────────────────────────
const QUICK_CHIPS: { label: string; type: ActivityType | ''; icon: string }[] = [
  { label: 'All',      type: '',              icon: 'apps'          },
  { label: 'Call',     type: 'call',          icon: 'call'          },
  { label: 'Email',    type: 'email',         icon: 'mail'          },
  { label: 'Meeting',  type: 'meeting',       icon: 'groups'        },
  { label: 'Note',     type: 'note',          icon: 'edit_note'     },
  { label: 'Reminder', type: 'reminder',      icon: 'notifications' },
  { label: 'CV',       type: 'cv_generated',  icon: 'description'   },
  { label: 'File',     type: 'file_uploaded', icon: 'upload_file'   },
]

// ── Status Badge (read-only, used in feed rows + table) ──────────────────────
function StatusBadge({ status }: { status: ActivityStatus }) {
  const cfg = STATUS_CFG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ── Editable Status Badge (used in drawer) ────────────────────────────────────
function EditableStatusBadge({ status, onChange }: { status: ActivityStatus; onChange: (s: ActivityStatus) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const cfg = STATUS_CFG[status]
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-transparent hover:border-current/20 transition-all cursor-pointer select-none ${cfg.bg} ${cfg.text}`}
        title="Click to change status"
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {cfg.label}
        <span className="material-symbols-outlined" style={{ fontSize: '12px', lineHeight: 1 }}>expand_more</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-20 py-1 min-w-[150px]">
          {EDITABLE_STATUSES.map((s) => {
            const c = STATUS_CFG[s]
            const active = status === s
            return (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-50 ${active ? 'text-slate-900' : 'text-slate-600'}`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                {c.label}
                {active && <span className="material-symbols-outlined ml-auto text-primary" style={{ fontSize: '13px' }}>check</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-2xl pointer-events-none">
      <span className="material-symbols-outlined text-green-400" style={{ fontSize: '16px' }}>check_circle</span>
      {message}
    </div>
  )
}

// ── Type Chip ─────────────────────────────────────────────────────────────────
function TypeChip({ type }: { type: ActivityType }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${ACTIVITY_COLORS[type]}`}>
      <span>{ACTIVITY_EMOJI[type]}</span>
      {ACTIVITY_LABELS[type]}
    </span>
  )
}

// ── Activity Drawer ───────────────────────────────────────────────────────────
function ActivityDrawer({
  item, onClose, onStatusChange, onMarkComplete,
}: {
  item: Activity
  onClose: () => void
  onStatusChange: (id: string, status: ActivityStatus) => void
  onMarkComplete: (id: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" />
      <div ref={ref} className="relative w-[420px] bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_BG[item.type]}`}>
              <span className={`material-symbols-outlined ${TYPE_ICON_COLOR[item.type]}`} style={{ fontSize: '20px' }}>{TYPE_ICON[item.type]}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-tight truncate">{item.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(item.timestamp).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · {fmtTime(item.timestamp)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors ml-2">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeChip type={item.type} />
            <EditableStatusBadge
              status={item.status}
              onChange={(s) => onStatusChange(item.id, s)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {item.clientName && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Client</p>
                <p className="text-xs font-semibold text-slate-700">{item.clientName}</p>
              </div>
            )}
            {item.candidateName && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Candidate</p>
                <p className="text-xs font-semibold text-slate-700">{item.candidateName}</p>
              </div>
            )}
            {item.jobTitle && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Job</p>
                <p className="text-xs font-semibold text-slate-700">{item.jobTitle}</p>
              </div>
            )}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Recruiter</p>
              <div className="flex items-center gap-2 mt-0.5">
                <RecruiterAvatar name={item.recruiterName} />
                <p className="text-xs font-semibold text-slate-700">{item.recruiterName}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Summary</p>
            <p className="text-sm text-slate-700 leading-relaxed">{item.summary}</p>
          </div>

          {item.status === 'pending' && (
            <button
              onClick={() => onMarkComplete(item.id)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>check_circle</span>
              Mark as Completed
            </button>
          )}

          {item.notes && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">{item.notes}</p>
            </div>
          )}

          {item.nextAction && (
            <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Next Action</p>
              <p className="text-sm font-medium text-primary">{item.nextAction}</p>
            </div>
          )}

          {item.attachments && item.attachments.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Attachments</p>
              <div className="space-y-1.5">
                {item.attachments.map((a) => (
                  <div key={a} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>attach_file</span>
                    <span className="text-xs text-slate-600 font-medium truncate">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Activity Row (72px, large icon) ───────────────────────────────────────────
function ActivityRow({ item, onView, isLast }: { item: Activity; onView: () => void; isLast: boolean }) {
  const context = [item.clientName, item.jobTitle, item.candidateName].filter(Boolean).join(' · ')
  return (
    <div
      className={`group flex items-center gap-4 px-4 hover:bg-slate-50 transition-all cursor-pointer ${!isLast ? 'border-b border-slate-50' : ''}`}
      style={{ minHeight: '72px', paddingTop: '14px', paddingBottom: '14px' }}
      onClick={onView}
    >
      {/* Icon — 44px soft colored square */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_BG[item.type]} transition-transform group-hover:scale-105`}>
        <span className={`material-symbols-outlined ${TYPE_ICON_COLOR[item.type]}`} style={{ fontSize: '22px' }}>{TYPE_ICON[item.type]}</span>
      </div>

      {/* Title + context */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-slate-800 leading-snug truncate">{item.title}</p>
        {context && <p className="text-[12px] text-slate-400 mt-0.5 truncate">{context}</p>}
      </div>

      {/* Status badge */}
      <StatusBadge status={item.status} />

      {/* Time */}
      <div className="text-right flex-shrink-0 w-14">
        <p className="text-[13px] font-medium text-slate-500 tabular-nums">{fmtTime(item.timestamp)}</p>
      </div>

      {/* Recruiter */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0 w-32">
        <RecruiterAvatar name={item.recruiterName} />
        <span className="text-[12px] text-slate-500 truncate">{shortName(item.recruiterName)}</span>
      </div>

      {/* More — hover only */}
      <button
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-200 hover:text-slate-600 transition-all"
        onClick={(e) => { e.stopPropagation(); onView() }}
        title="View details"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>more_horiz</span>
      </button>
    </div>
  )
}

// ── Day Card (collapsible) ────────────────────────────────────────────────────
function DayCard({ label, count, items, onView }: { label: string; count: number; items: Activity[]; onView: (a: Activity) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          <span className="min-w-[22px] h-5 px-1.5 inline-flex items-center justify-center text-[11px] font-bold text-slate-400 bg-slate-100 rounded-full">{count}</span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-0.5 text-[12px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          {open ? 'Collapse' : 'Expand'}
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{open ? 'expand_less' : 'expand_more'}</span>
        </button>
      </div>
      {open && items.map((item, i) => (
        <ActivityRow key={item.id} item={item} onView={() => onView(item)} isLast={i === items.length - 1} />
      ))}
    </div>
  )
}

// ── Table View ────────────────────────────────────────────────────────────────
function TableView({ items, onView }: { items: Activity[]; onView: (a: Activity) => void }) {
  const cols = ['Time', 'Type', 'Client', 'Candidate', 'Job', 'Recruiter', 'Status', '']
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {cols.map((c) => (
              <th key={c} className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 py-2.5 whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
              <td className="px-4 py-3 text-slate-400 tabular-nums whitespace-nowrap">
                <div className="text-[11px] font-medium">{fmtTime(item.timestamp)}</div>
                <div className="text-[10px] text-slate-300">{new Date(item.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
              </td>
              <td className="px-4 py-3"><TypeChip type={item.type} /></td>
              <td className="px-4 py-3 text-slate-600 max-w-[120px] truncate">{item.clientName ?? '—'}</td>
              <td className="px-4 py-3 text-slate-600 max-w-[120px] truncate">{item.candidateName ?? '—'}</td>
              <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">{item.jobTitle ?? '—'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <RecruiterAvatar name={item.recruiterName} />
                  <span className="text-slate-500 whitespace-nowrap">{item.recruiterName}</span>
                </div>
              </td>
              <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onView(item)}
                  className="text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-2xl">🔍</div>
      <p className="text-sm font-semibold text-slate-600 mb-1">No activities found</p>
      <p className="text-xs text-slate-400 mb-4">Try adjusting your filters or search terms</p>
      <button onClick={onClear} className="text-sm font-semibold text-primary hover:underline">Clear Filters</button>
    </div>
  )
}

// ── Log Activity Modal ────────────────────────────────────────────────────────
const BLANK_FORM = {
  type:        'call' as ActivityType,
  title:       '',
  clientId:    '',
  candidateId: '',
  jobId:       '',
  recruiterId: 'r1',
  summary:     '',
  nextAction:  '',
  status:      'completed' as ActivityStatus,
}

function LogModal({ onClose, onSave }: { onClose: () => void; onSave: (a: Activity) => void }) {
  const [form, setForm] = useState({ ...BLANK_FORM })
  const [err,  setErr]  = useState<Record<string, string>>({})

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); setErr((e) => { const n = { ...e }; delete n[k]; return n }) }

  const filteredJobs       = form.clientId ? jobs.filter((j) => j.clientId === form.clientId)  : jobs
  const filteredCandidates = form.jobId    ? candidates.filter((c) => c.jobId === form.jobId)  : candidates

  const selectedClient    = clients.find((c) => c.id === form.clientId)
  const selectedJob       = jobs.find((j) => j.id === form.jobId)
  const selectedCandidate = candidates.find((c) => c.id === form.candidateId)
  const selectedRecruiter = recruiters.find((r) => r.id === form.recruiterId)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.title.trim())   errs.title   = 'Title is required'
    if (!form.summary.trim()) errs.summary = 'Summary is required'
    if (Object.keys(errs).length) { setErr(errs); return }

    const now = new Date().toISOString()
    const a: Activity = {
      id:            `a-local-${Date.now()}`,
      type:          form.type,
      title:         form.title.trim(),
      timestamp:     now,
      clientId:      form.clientId || undefined,
      clientName:    selectedClient?.companyName,
      candidateId:   form.candidateId || undefined,
      candidateName: selectedCandidate?.name,
      jobId:         form.jobId || undefined,
      jobTitle:      selectedJob?.title,
      recruiterId:   form.recruiterId,
      recruiterName: selectedRecruiter?.name ?? '',
      summary:       form.summary.trim(),
      nextAction:    form.nextAction.trim() || undefined,
      status:        form.status,
    }
    onSave(a)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Log Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">Record a call, email, meeting, or other interaction</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Activity Type</label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((t) => (
                <button key={t} type="button" onClick={() => set('type', t)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${form.type === t ? `${ACTIVITY_COLORS[t]} border-current` : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                  <span>{ACTIVITY_EMOJI[t]}</span>{ACTIVITY_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Title <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Brief activity title…"
              className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${err.title ? 'border-red-400' : 'border-slate-200'}`} />
            {err.title && <p className="text-xs text-red-500 mt-1">{err.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Client</label>
              <select value={form.clientId} onChange={(e) => { set('clientId', e.target.value); set('jobId', ''); set('candidateId', '') }}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">— None —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Job</label>
              <select value={form.jobId} onChange={(e) => { set('jobId', e.target.value); set('candidateId', '') }}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">— None —</option>
                {filteredJobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Candidate</label>
              <select value={form.candidateId} onChange={(e) => set('candidateId', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">— None —</option>
                {filteredCandidates.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Recruiter</label>
              <select value={form.recruiterId} onChange={(e) => set('recruiterId', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                {recruiters.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Status</label>
            <div className="flex gap-2">
              {(['completed', 'pending', 'cancelled', 'failed'] as ActivityStatus[]).map((s) => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-colors ${form.status === s ? STATUS_COLORS[s] : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Summary <span className="text-red-400">*</span></label>
            <textarea rows={3} value={form.summary} onChange={(e) => set('summary', e.target.value)}
              placeholder="What happened? Key outcomes, decisions, action items…"
              className={`w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 ${err.summary ? 'border-red-400' : 'border-slate-200'}`} />
            {err.summary && <p className="text-xs text-red-500 mt-1">{err.summary}</p>}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Next Action <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
            <input value={form.nextAction} onChange={(e) => set('nextAction', e.target.value)}
              placeholder="e.g. Send shortlist by Jul 15…"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button type="submit" form="" onClick={submit}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>check</span>
            Save Activity
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Filter option lists ───────────────────────────────────────────────────────
const ALL_TYPES      = Object.keys(ACTIVITY_LABELS) as ActivityType[]
const ALL_STATUSES: ActivityStatus[] = ['completed', 'pending', 'info', 'cancelled', 'failed']
const ALL_RECRUITERS = recruiters.map((r) => r.name)

const LS_OVERRIDES_KEY = 'rs_activity_status_overrides'
function loadOverrides(): Record<string, ActivityStatus> {
  try { return JSON.parse(localStorage.getItem(LS_OVERRIDES_KEY) ?? '{}') } catch { return {} }
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ActivityLogPage() {
  const [local,           setLocal]           = useState<Activity[]>(loadLocal)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ActivityStatus>>(loadOverrides)
  const [search,          setSearch]          = useState('')
  const [typeFilter,      setTypeFilter]      = useState<ActivityType | ''>('')
  const [clientFilter,    setClientFilter]    = useState('')
  const [recruiterFilter, setRecruiterFilter] = useState('')
  const [statusFilter,    setStatusFilter]    = useState<ActivityStatus | ''>('')
  const [viewMode,        setViewMode]        = useState<'feed' | 'table'>('feed')
  const [drawerItem,      setDrawerItem]      = useState<Activity | null>(null)
  const [showModal,       setShowModal]       = useState(false)
  const [toast,           setToast]           = useState<string | null>(null)

  useEffect(() => { saveLocal(local) }, [local])
  useEffect(() => {
    localStorage.setItem(LS_OVERRIDES_KEY, JSON.stringify(statusOverrides))
  }, [statusOverrides])

  const allActivities = useMemo(
    () => [...local, ...initialActivities]
      .map((a) => statusOverrides[a.id] ? { ...a, status: statusOverrides[a.id] } : a)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [local, statusOverrides]
  )

  function handleStatusChange(id: string, status: ActivityStatus) {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }))
    setDrawerItem((prev) => prev?.id === id ? { ...prev, status } : prev)
  }

  function handleMarkComplete(id: string) {
    handleStatusChange(id, 'completed')
    setToast('Activity marked as completed')
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = useMemo(() => allActivities.filter((a) => {
    const q = search.toLowerCase()
    if (q && !a.title.toLowerCase().includes(q) && !a.summary.toLowerCase().includes(q)
         && !(a.clientName    ?? '').toLowerCase().includes(q)
         && !(a.candidateName ?? '').toLowerCase().includes(q)
         && !(a.jobTitle      ?? '').toLowerCase().includes(q)
         && !a.recruiterName.toLowerCase().includes(q)) return false
    if (typeFilter      && a.type          !== typeFilter)      return false
    if (clientFilter    && a.clientId      !== clientFilter)    return false
    if (recruiterFilter && a.recruiterName !== recruiterFilter) return false
    if (statusFilter    && a.status        !== statusFilter)    return false
    return true
  }), [allActivities, search, typeFilter, clientFilter, recruiterFilter, statusFilter])

  const groups = useMemo(() => {
    const map = new Map<string, Activity[]>()
    filtered.forEach((a) => {
      const k = groupKey(a.timestamp)
      const arr = map.get(k) ?? []
      arr.push(a)
      map.set(k, arr)
    })
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const hasFilters = !!(search || typeFilter || clientFilter || recruiterFilter || statusFilter)

  function clearFilters() {
    setSearch(''); setTypeFilter(''); setClientFilter(''); setRecruiterFilter(''); setStatusFilter('')
  }

  function exportCSV() {
    const header = 'Time,Type,Title,Client,Candidate,Job,Recruiter,Status\n'
    const rows = filtered.map((a) =>
      [a.timestamp, ACTIVITY_LABELS[a.type], `"${a.title}"`, a.clientName ?? '', a.candidateName ?? '', a.jobTitle ?? '', a.recruiterName, a.status].join(',')
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'activity_logs.csv'; link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-bold text-slate-900">Activity Logs</h1>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium tabular-nums">{allActivities.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>download</span>
              Export
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
              Log Activity
            </button>
          </div>
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center gap-2 flex-shrink-0">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }}>search</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
          </div>

          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>

          <select value={recruiterFilter} onChange={(e) => setRecruiterFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Recruiter</option>
            {ALL_RECRUITERS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | '')}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Status</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="text-xs font-semibold text-slate-400 hover:text-danger flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>close</span>
              Clear
            </button>
          )}

          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-slate-400 tabular-nums">{filtered.length} activities</span>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode('feed')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${viewMode === 'feed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>view_agenda</span>
                Feed
              </button>
              <button onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>table_rows</span>
                Table
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick type chips ─────────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-100 px-6 py-2 flex items-center gap-1.5 flex-shrink-0 overflow-x-auto">
          {QUICK_CHIPS.map((chip) => {
            const active = typeFilter === chip.type
            return (
              <button
                key={chip.label}
                onClick={() => setTypeFilter(chip.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>{chip.icon}</span>
                {chip.label}
              </button>
            )
          })}

          {/* Overflow: candidate / client / job / task types */}
          <select
            value={!QUICK_CHIPS.find((c) => c.type === typeFilter) && typeFilter ? typeFilter : ''}
            onChange={(e) => setTypeFilter(e.target.value as ActivityType | '')}
            className="ml-auto text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 flex-shrink-0"
          >
            <option value="">More…</option>
            {ALL_TYPES.filter((t) => !QUICK_CHIPS.find((c) => c.type === t)).map((t) => (
              <option key={t} value={t}>{ACTIVITY_EMOJI[t]} {ACTIVITY_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : viewMode === 'feed' ? (
            <div className="p-4 space-y-3">
              {groups.map(([key, items]) => (
                <DayCard
                  key={key}
                  label={dateLabel(items[0].timestamp)}
                  count={items.length}
                  items={items}
                  onView={setDrawerItem}
                />
              ))}
            </div>
          ) : (
            <div className="p-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <TableView items={filtered} onView={setDrawerItem} />
              </div>
            </div>
          )}
        </div>
      </div>

      {drawerItem && (
        <ActivityDrawer
          item={drawerItem}
          onClose={() => setDrawerItem(null)}
          onStatusChange={handleStatusChange}
          onMarkComplete={handleMarkComplete}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {showModal && (
        <LogModal
          onClose={() => setShowModal(false)}
          onSave={(a) => setLocal((prev) => [a, ...prev])}
        />
      )}
    </div>
  )
}
