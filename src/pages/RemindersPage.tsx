import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDown, MoreHorizontal, X, Check, Plus } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import {
  initialReminders, PRIORITY_ORDER,
  type Reminder, type Priority, type RelatedType,
} from '../data/remindersMockData'
import { clients, jobs, candidates, recruiters } from '../data/mockData'

// ── Constants ─────────────────────────────────────────────────────────────────
const TODAY = '2026-07-11'
const LS_KEY = 'rs_reminders'

type TabKey = 'all' | 'overdue' | 'today' | 'upcoming' | 'completed'
type SortKey = 'dueAsc' | 'dueDesc' | 'priority' | 'createdAt'

// ── localStorage ──────────────────────────────────────────────────────────────
function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : initialReminders
  } catch { return initialReminders }
}
function saveReminders(r: Reminder[]) { localStorage.setItem(LS_KEY, JSON.stringify(r)) }

// ── Date helpers ──────────────────────────────────────────────────────────────
function addDays(base: string, n: number) {
  const d = new Date(base); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10)
}
const TOMORROW = addDays(TODAY, 1)
const WEEK_END = addDays(TODAY, 7)

function sectionOf(r: Reminder): string {
  if (r.status === 'completed') return 'completed'
  if (r.dueDate < TODAY)        return 'overdue'
  if (r.dueDate === TODAY)      return 'today'
  if (r.dueDate === TOMORROW)   return 'tomorrow'
  if (r.dueDate <= WEEK_END)    return 'thisWeek'
  return 'later'
}

function dueDateDisplay(r: Reminder): { text: string; cls: string } {
  const sec = sectionOf(r)
  if (sec === 'overdue') {
    const days = Math.ceil((new Date(TODAY).getTime() - new Date(r.dueDate).getTime()) / 86400000)
    const d    = new Date(r.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return { text: `${d} · ${days}d overdue`, cls: 'text-red-500' }
  }
  if (sec === 'today')    return { text: r.dueTime ? `Today ${r.dueTime}` : 'Today',       cls: 'text-amber-600' }
  if (sec === 'tomorrow') return { text: r.dueTime ? `Tomorrow ${r.dueTime}` : 'Tomorrow', cls: 'text-blue-500'  }
  const d = new Date(r.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const inDays = Math.ceil((new Date(r.dueDate).getTime() - new Date(TODAY).getTime()) / 86400000)
  return { text: `${d} · in ${inDays}d`, cls: 'text-slate-500' }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const PRIORITY_EMOJI: Record<Priority, string> = { high: '🔴', medium: '🟡', low: '⚪' }

const PRIORITY_CFG: Record<Priority, { bg: string; text: string; ring: string; label: string; dot: string }> = {
  high:   { bg: 'bg-red-50',    text: 'text-red-600',    ring: 'ring-red-100',    label: 'High',   dot: 'bg-red-500'    },
  medium: { bg: 'bg-amber-50',  text: 'text-amber-600',  ring: 'ring-amber-100',  label: 'Medium', dot: 'bg-amber-400'  },
  low:    { bg: 'bg-slate-100', text: 'text-slate-500',  ring: 'ring-slate-200',  label: 'Low',    dot: 'bg-slate-400'  },
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500',  'bg-teal-500',
]

// ── Shared sub-components ──────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CFG[priority]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// Alias so DetailDrawer's <PriorityIndicator> still compiles unchanged
function PriorityIndicator({ priority }: { priority: Priority }) {
  return <PriorityBadge priority={priority} />
}

function DueDateChip({ reminder }: { reminder: Reminder }) {
  if (reminder.status === 'completed' && reminder.completedAt) {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] text-slate-400 whitespace-nowrap flex-shrink-0">
        <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '13px' }}>check_circle</span>
        Done {fmtDate(reminder.completedAt)}
      </span>
    )
  }
  const { text, cls } = dueDateDisplay(reminder)
  const sec = sectionOf(reminder)
  const iconCls =
    sec === 'overdue'   ? 'text-red-400'    :
    sec === 'today'     ? 'text-amber-500'  :
    sec === 'tomorrow'  ? 'text-blue-400'   : 'text-slate-400'
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold whitespace-nowrap flex-shrink-0 ${cls}`}>
      <span className={`material-symbols-outlined flex-shrink-0 ${iconCls}`} style={{ fontSize: '14px' }}>calendar_today</span>
      {text}
    </span>
  )
}

function RecruiterAvatar({ name }: { name: string }) {
  const parts  = name.trim().split(' ')
  const init   = parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : (parts[0] ?? '?').slice(0, 2)
  const color  = AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]
  const shortN = parts.length >= 2 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : name
  return (
    <div className="inline-flex items-center gap-1.5 flex-shrink-0">
      <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center`}>
        <span className="text-[9px] font-bold text-white uppercase leading-none">{init}</span>
      </div>
      <span className="text-[12px] text-slate-500 whitespace-nowrap hidden xl:inline">{shortN}</span>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  emoji: string
  count: number
  label: string
  active: boolean
  activeCls: string
  onClick: () => void
}
function StatCard({ emoji, count, label, active, activeCls, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-0 bg-white rounded-xl px-4 py-4 text-left transition-all border shadow-sm cursor-pointer ${
        active
          ? `shadow-md ${activeCls}`
          : 'border-slate-100 hover:shadow-md hover:border-slate-200'
      }`}
    >
      <span className="text-xl block mb-2">{emoji}</span>
      <span className={`text-[26px] font-bold leading-none block mb-1 ${active ? '' : 'text-slate-800'}`}>{count}</span>
      <span className="text-[12px] text-slate-400 font-medium block">{label}</span>
    </button>
  )
}

// ── More Menu ─────────────────────────────────────────────────────────────────
function MoreMenu({
  onView, onEdit, onReschedule, onComplete, onDuplicate, onDelete,
}: {
  onView: () => void; onEdit: () => void; onReschedule: () => void
  onComplete: () => void; onDuplicate: () => void; onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    if (open) document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const items: { label: string; icon: string; action: () => void; danger?: boolean }[] = [
    { label: 'View details',  icon: 'open_in_new',  action: onView },
    { label: 'Edit',          icon: 'edit',          action: onEdit },
    { label: 'Reschedule',    icon: 'schedule',      action: onReschedule },
    { label: 'Mark complete', icon: 'check_circle',  action: onComplete },
    { label: 'Duplicate',     icon: 'content_copy',  action: onDuplicate },
    { label: 'Delete',        icon: 'delete',        action: onDelete, danger: true },
  ]

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 bg-white rounded-xl border border-slate-200 shadow-xl py-1 w-44">
          {items.map(({ label, icon, action, danger }) => (
            <button key={label}
              onClick={(e) => { e.stopPropagation(); action(); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors text-left ${danger ? 'text-red-500' : 'text-slate-700'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Reminder Row ──────────────────────────────────────────────────────────────
function ReminderRow({
  reminder, onCheck, onView, onEdit, onReschedule, onDuplicate, onDelete,
}: {
  reminder: Reminder
  onCheck: () => void; onView: () => void; onEdit: () => void
  onReschedule: () => void; onDuplicate: () => void; onDelete: () => void
}) {
  const sec       = sectionOf(reminder)
  const completed = reminder.status === 'completed'
  const context   = [reminder.jobTitle, reminder.clientName, reminder.candidateName].filter(Boolean).join(' · ')

  const accentCls =
    sec === 'overdue' ? 'bg-red-400'   :
    sec === 'today'   ? 'bg-amber-400' : 'bg-transparent'

  return (
    <div
      className={`group relative flex items-center gap-4 px-6 min-h-[72px] hover:bg-slate-50 hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all border-b border-slate-50 last:border-0 cursor-pointer ${completed ? 'opacity-55' : ''}`}
      style={{ paddingTop: '16px', paddingBottom: '16px' }}
    >
      {/* Left accent — overdue & today only */}
      {!completed && (sec === 'overdue' || sec === 'today') && (
        <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full ${accentCls}`} />
      )}

      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onCheck() }}
        className={`flex-shrink-0 w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-colors ${completed ? 'bg-slate-100 border-slate-300' : 'border-slate-300 hover:border-primary'}`}
      >
        {completed && <Check size={9} className="text-slate-400" strokeWidth={3} />}
      </button>

      {/* Title + context */}
      <div className="flex-1 min-w-0" onClick={onView}>
        <p className={`text-[15px] font-semibold leading-snug truncate ${completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {reminder.title}
        </p>
        {context && (
          <p className="text-[12px] text-slate-400 mt-0.5 truncate">{context}</p>
        )}
      </div>

      {/* Hover quick actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mr-2">
        {!completed && (
          <button
            onClick={(e) => { e.stopPropagation(); onCheck() }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors whitespace-nowrap"
          >
            <Check size={10} strokeWidth={2.5} />
            Complete
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>edit</span>
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onReschedule() }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>schedule</span>
          Reschedule
        </button>
      </div>

      {/* Right meta */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <DueDateChip reminder={reminder} />
        <PriorityBadge priority={reminder.priority} />
        <RecruiterAvatar name={reminder.assignedRecruiter} />
        <MoreMenu
          onView={onView} onEdit={onEdit} onReschedule={onReschedule}
          onComplete={onCheck} onDuplicate={onDuplicate} onDelete={onDelete}
        />
      </div>
    </div>
  )
}

// ── Reminder Section ──────────────────────────────────────────────────────────
const SECTION_META: Record<string, { label: string; labelCls: string }> = {
  overdue:   { label: 'Overdue',   labelCls: 'text-red-500'   },
  today:     { label: 'Today',     labelCls: 'text-amber-600' },
  tomorrow:  { label: 'Tomorrow',  labelCls: 'text-blue-500'  },
  thisWeek:  { label: 'This Week', labelCls: 'text-slate-500' },
  later:     { label: 'Upcoming',  labelCls: 'text-slate-500' },
  completed: { label: 'Completed', labelCls: 'text-green-600' },
}

const SHOW_MORE_LIMIT = 3

function ReminderSection({
  sectionKey, reminders, defaultOpen,
  onCheck, onView, onEdit, onReschedule, onDuplicate, onDelete,
}: {
  sectionKey: string; reminders: Reminder[]; defaultOpen?: boolean
  onCheck: (id: string) => void; onView: (r: Reminder) => void
  onEdit: (r: Reminder) => void; onReschedule: (r: Reminder) => void
  onDuplicate: (r: Reminder) => void; onDelete: (id: string) => void
}) {
  const [open,    setOpen]    = useState(defaultOpen ?? true)
  const [showAll, setShowAll] = useState(false)
  const meta = SECTION_META[sectionKey]
  if (!meta || reminders.length === 0) return null

  const useLimit   = ['tomorrow', 'thisWeek', 'later'].includes(sectionKey) && !showAll
  const visible    = useLimit ? reminders.slice(0, SHOW_MORE_LIMIT) : reminders
  const hiddenCount = reminders.length - visible.length

  return (
    <div className="mb-1">
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-6 py-2.5 text-left hover:bg-slate-50/70 transition-colors group/sec"
      >
        <ChevronDown
          size={12}
          className={`text-slate-300 group-hover/sec:text-slate-400 transition-transform flex-shrink-0 ${!open ? '-rotate-90' : ''}`}
        />
        <span className={`text-[11px] font-bold uppercase tracking-widest ${meta.labelCls}`}>{meta.label}</span>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full tabular-nums leading-none">{reminders.length}</span>
        <div className="flex-1 h-px bg-slate-100 ml-1" />
      </button>

      {open && (
        <>
          {visible.map((r) => (
            <ReminderRow
              key={r.id}
              reminder={r}
              onCheck={() => onCheck(r.id)}
              onView={() => onView(r)}
              onEdit={() => onEdit(r)}
              onReschedule={() => onReschedule(r)}
              onDuplicate={() => onDuplicate(r)}
              onDelete={() => onDelete(r.id)}
            />
          ))}
          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center gap-1.5 pl-[72px] py-2.5 text-[12px] font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              <Plus size={12} strokeWidth={2.5} />
              {hiddenCount} more reminder{hiddenCount !== 1 ? 's' : ''}
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ reminder, onClose, onEdit, onComplete, onDelete }: {
  reminder: Reminder; onClose: () => void
  onEdit: () => void; onComplete: () => void; onDelete: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const sec = sectionOf(reminder)
  const { text: dueTxt, cls: dueCls } = dueDateDisplay(reminder)
  const relTypeLabel: Record<RelatedType, string> = {
    client: 'Client', job: 'Job', candidate: 'Candidate', candidateJob: 'Candidate + Job',
  }
  const completed = reminder.status === 'completed'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/10" />
      <div ref={ref} className="relative w-[400px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
        <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <button
            onClick={onComplete}
            className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${completed ? 'bg-slate-200 border-slate-300' : 'border-slate-300 hover:border-primary'}`}
          >
            {completed && <Check size={9} className="text-slate-500" strokeWidth={3} />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold text-slate-800 leading-snug ${completed ? 'line-through text-slate-400' : ''}`}>{reminder.title}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <PriorityIndicator priority={reminder.priority} />
              <span className={`text-[11px] font-medium ${dueCls}`}>{dueTxt}</span>
            </div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Status',       value: completed ? 'Completed' : sec === 'overdue' ? 'Overdue' : 'Open' },
              { label: 'Priority',     value: reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1) },
              { label: 'Due Date',     value: reminder.dueDate ? fmtDate(reminder.dueDate) + (reminder.dueTime ? ` ${reminder.dueTime}` : '') : '—' },
              { label: 'Related Type', value: relTypeLabel[reminder.relatedType] },
              { label: 'Recruiter',    value: reminder.assignedRecruiter },
              { label: 'Created',      value: fmtDate(reminder.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-xs font-semibold text-slate-700">{value}</p>
              </div>
            ))}
          </div>

          {(reminder.clientName || reminder.jobTitle || reminder.candidateName) && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Related</p>
              <div className="space-y-1.5">
                {reminder.clientName && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '13px' }}>business</span>
                    <span className="text-xs text-slate-600 font-medium">{reminder.clientName}</span>
                  </div>
                )}
                {reminder.jobTitle && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '13px' }}>work</span>
                    <span className="text-xs text-slate-600 font-medium">{reminder.jobTitle}</span>
                  </div>
                )}
                {reminder.candidateName && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '13px' }}>person</span>
                    <span className="text-xs text-slate-600 font-medium">{reminder.candidateName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {reminder.notes && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">{reminder.notes}</p>
            </div>
          )}

          {completed && reminder.completedAt && (
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">Completed</p>
              <p className="text-xs text-green-700">{fmtDate(reminder.completedAt)}{reminder.completedBy ? ` by ${reminder.completedBy}` : ''}</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-3 flex items-center gap-2 flex-shrink-0">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>edit</span>Edit
          </button>
          {!completed ? (
            <button onClick={onComplete} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors">
              <Check size={12} strokeWidth={2.5} />Mark Complete
            </button>
          ) : (
            <button onClick={onComplete} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
              Reopen
            </button>
          )}
          <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
const BLANK: Omit<Reminder, 'id' | 'createdAt'> = {
  title: '', status: 'open', dueDate: TODAY, priority: 'medium',
  relatedType: 'candidateJob', assignedRecruiter: recruiters[0]?.name ?? '',
}

function ReminderModal({ initial, onClose, onSave }: {
  initial?: Reminder | null; onClose: () => void; onSave: (r: Reminder) => void
}) {
  const editing = !!initial
  const [form, setForm] = useState<Omit<Reminder, 'id' | 'createdAt'>>(initial ? { ...initial } : { ...BLANK })
  const [errs, setErrs] = useState<Record<string, string>>({})

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrs((e) => { const n = { ...e }; delete n[k]; return n })
  }

  const filteredJobs       = form.clientId ? jobs.filter((j) => j.clientId === form.clientId) : jobs
  const filteredCandidates = form.jobId    ? candidates.filter((c) => c.jobId === form.jobId) : candidates

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title   = 'Title is required'
    if (!form.dueDate)      errs.dueDate = 'Due date is required'
    if (!form.clientId && !form.jobId && !form.candidateId) errs.related = 'Select at least one related record'
    if (Object.keys(errs).length) { setErrs(errs); return }

    const selectedClient    = clients.find((c) => c.id === form.clientId)
    const selectedJob       = jobs.find((j) => j.id === form.jobId)
    const selectedCandidate = candidates.find((c) => c.id === form.candidateId)

    onSave({
      ...form,
      id: initial?.id ?? `rem-${Date.now()}`,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      title: form.title.trim(),
      clientName:    selectedClient?.companyName  ?? form.clientName,
      jobTitle:      selectedJob?.title           ?? form.jobTitle,
      candidateName: selectedCandidate?.name      ?? form.candidateName,
    } as Reminder)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-800">{editing ? 'Edit Reminder' : 'Add Reminder'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Set a follow-up task for your team</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><X size={14} /></button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Title <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="What needs to be done?"
              className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${errs.title ? 'border-red-400' : 'border-slate-200'}`} />
            {errs.title && <p className="text-xs text-red-500 mt-1">{errs.title}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Related To <span className="text-red-400">*</span></label>
              {errs.related && <p className="text-xs text-red-500">{errs.related}</p>}
            </div>
            <div className="grid grid-cols-1 gap-2">
              <select value={form.clientId ?? ''} onChange={(e) => { set('clientId', e.target.value); set('jobId', ''); set('candidateId', '') }}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">— Client (optional) —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
              <select value={form.jobId ?? ''} onChange={(e) => { set('jobId', e.target.value); set('candidateId', '') }}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">— Job (optional) —</option>
                {filteredJobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
              <select value={form.candidateId ?? ''} onChange={(e) => set('candidateId', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">— Candidate (optional) —</option>
                {filteredCandidates.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Due Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)}
                className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${errs.dueDate ? 'border-red-400' : 'border-slate-200'}`} />
              {errs.dueDate && <p className="text-xs text-red-500 mt-1">{errs.dueDate}</p>}
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Due Time <span className="text-slate-300 font-normal">(opt)</span></label>
              <input type="time" value={form.dueTime ?? ''} onChange={(e) => set('dueTime', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Priority</label>
              <div className="flex gap-1.5">
                {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                  <button key={p} type="button" onClick={() => set('priority', p)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold border transition-colors capitalize ${form.priority === p ? 'border-current bg-slate-50 text-slate-700' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                    {PRIORITY_EMOJI[p]} {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Recruiter</label>
              <select value={form.assignedRecruiter} onChange={(e) => set('assignedRecruiter', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                {recruiters.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Notes <span className="text-slate-300 font-normal">(optional)</span></label>
            <textarea rows={3} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)}
              placeholder="Additional context…"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={submit} className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            <Check size={13} strokeWidth={2.5} />
            {editing ? 'Save Changes' : 'Save Reminder'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Confirm Delete ────────────────────────────────────────────────────────────
function ConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl p-5 max-w-xs w-full mx-4">
        <p className="text-sm font-bold text-slate-800 mb-1">Delete reminder?</p>
        <p className="text-xs text-slate-400 mb-4">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 text-sm font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const SECTION_ORDER = ['overdue', 'today', 'tomorrow', 'thisWeek', 'later', 'completed']

export default function RemindersPage() {
  const [reminders,  setReminders]  = useState<Reminder[]>(loadReminders)
  const [tab,        setTab]        = useState<TabKey>('all')
  const [search,     setSearch]     = useState('')
  const [recruiterF, setRecruiterF] = useState('')
  const [typeF,      setTypeF]      = useState<RelatedType | ''>('')
  const [sortBy,     setSortBy]     = useState<SortKey>('dueAsc')
  const [drawer,     setDrawer]     = useState<Reminder | null>(null)
  const [modal,      setModal]      = useState<Reminder | null | 'new'>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

  useEffect(() => { saveReminders(reminders) }, [reminders])

  useEffect(() => {
    if (drawer) {
      const updated = reminders.find((r) => r.id === drawer.id)
      if (updated) setDrawer(updated); else setDrawer(null)
    }
  }, [reminders]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mutations ────────────────────────────────────────────────────────────
  function toggleComplete(id: string) {
    setReminders((prev) => prev.map((r) => r.id !== id ? r : r.status === 'open'
      ? { ...r, status: 'completed', completedAt: new Date().toISOString(), completedBy: 'Y. Tanaka' }
      : { ...r, status: 'open', completedAt: undefined, completedBy: undefined }
    ))
  }
  function deleteReminder(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id))
    if (drawer?.id === id) setDrawer(null)
    setConfirmDel(null)
  }
  function saveReminder(r: Reminder) {
    setReminders((prev) => {
      const idx = prev.findIndex((x) => x.id === r.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = r; return next }
      return [r, ...prev]
    })
  }
  function duplicateReminder(r: Reminder) {
    saveReminder({ ...r, id: `rem-dup-${Date.now()}`, createdAt: new Date().toISOString(), completedAt: undefined, completedBy: undefined, status: 'open' })
  }

  // ── Stats ────────────────────────────────────────────────────────────────
  const open      = reminders.filter((r) => r.status === 'open')
  const completed = reminders.filter((r) => r.status === 'completed')
  const sectionCounts = {
    overdue:  open.filter((r) => r.dueDate < TODAY).length,
    today:    open.filter((r) => r.dueDate === TODAY).length,
    upcoming: open.filter((r) => r.dueDate > TODAY).length,
  }

  // ── Filtering & sorting ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let pool =
      tab === 'completed' ? completed :
      tab === 'overdue'   ? open.filter((r) => r.dueDate < TODAY) :
      tab === 'today'     ? open.filter((r) => r.dueDate === TODAY) :
      tab === 'upcoming'  ? open.filter((r) => r.dueDate > TODAY) :
      reminders.filter((r) => r.status === 'open')

    const q = search.toLowerCase()
    if (q) pool = pool.filter((r) =>
      r.title.toLowerCase().includes(q) ||
      (r.clientName ?? '').toLowerCase().includes(q) ||
      (r.candidateName ?? '').toLowerCase().includes(q) ||
      (r.jobTitle ?? '').toLowerCase().includes(q)
    )
    if (recruiterF) pool = pool.filter((r) => r.assignedRecruiter === recruiterF)
    if (typeF)      pool = pool.filter((r) => r.relatedType === typeF)

    return [...pool].sort((a, b) => {
      if (sortBy === 'dueAsc')    return a.dueDate.localeCompare(b.dueDate)
      if (sortBy === 'dueDesc')   return b.dueDate.localeCompare(a.dueDate)
      if (sortBy === 'priority')  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (sortBy === 'createdAt') return b.createdAt.localeCompare(a.createdAt)
      return 0
    })
  }, [reminders, tab, search, recruiterF, typeF, sortBy]) // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = useMemo(() => {
    const map: Record<string, Reminder[]> = {}
    filtered.forEach((r) => {
      const s = sectionOf(r)
      if (!map[s]) map[s] = []
      map[s].push(r)
    })
    return map
  }, [filtered])

  const hasFilters    = !!(search || recruiterF || typeF)
  const allRecruiters = [...new Set(reminders.map((r) => r.assignedRecruiter))]

  const sharedRowProps = {
    onCheck:      (id: string)   => toggleComplete(id),
    onView:       (r: Reminder)  => setDrawer(r),
    onEdit:       (r: Reminder)  => setModal(r),
    onReschedule: (r: Reminder)  => setModal(r),
    onDuplicate:  (r: Reminder)  => duplicateReminder(r),
    onDelete:     (id: string)   => setConfirmDel(id),
  }

  // Stat card toggle: clicking active card resets to 'all'
  function toggleTab(key: TabKey) { setTab((prev) => prev === key ? 'all' : key) }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-[20px] font-bold text-slate-900 leading-tight">Reminders</h1>
            <p className="text-[13px] text-slate-400 mt-0.5">Stay on top of your tasks and follow-ups.</p>
          </div>
          <button
            onClick={() => setModal('new')}
            className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Reminder
          </button>
        </div>

        {/* ── Stat Cards ────────────────────────────────────────────────── */}
        <div className="px-6 pt-4 pb-3 flex gap-3 flex-shrink-0">
          <StatCard
            emoji="🔴" count={sectionCounts.overdue} label="Overdue"
            active={tab === 'overdue'}
            activeCls="border-red-200 bg-red-50/40 text-red-600"
            onClick={() => toggleTab('overdue')}
          />
          <StatCard
            emoji="🟠" count={sectionCounts.today} label="Today"
            active={tab === 'today'}
            activeCls="border-amber-200 bg-amber-50/40 text-amber-600"
            onClick={() => toggleTab('today')}
          />
          <StatCard
            emoji="📅" count={sectionCounts.upcoming} label="Upcoming"
            active={tab === 'upcoming'}
            activeCls="border-blue-200 bg-blue-50/40 text-blue-600"
            onClick={() => toggleTab('upcoming')}
          />
          <StatCard
            emoji="✅" count={completed.length} label="Completed"
            active={tab === 'completed'}
            activeCls="border-green-200 bg-green-50/40 text-green-600"
            onClick={() => toggleTab('completed')}
          />
          <StatCard
            emoji="📊" count={reminders.length} label="Total"
            active={tab === 'all'}
            activeCls="border-slate-200 bg-slate-50 text-slate-600"
            onClick={() => setTab('all')}
          />
        </div>

        {/* ── Filters ───────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-2.5 flex-shrink-0">
          {/* Search */}
          <div className="relative flex-1 max-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '16px' }}>search</span>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reminders…"
              className="w-full h-10 pl-9 pr-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 bg-white placeholder:text-slate-400"
            />
          </div>

          {/* Recruiter */}
          <select
            value={recruiterF} onChange={(e) => setRecruiterF(e.target.value)}
            className="h-10 text-sm border border-slate-200 rounded-lg px-3 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 min-w-[140px]"
          >
            <option value="">Recruiter · All</option>
            {allRecruiters.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Type */}
          <select
            value={typeF} onChange={(e) => setTypeF(e.target.value as RelatedType | '')}
            className="h-10 text-sm border border-slate-200 rounded-lg px-3 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 min-w-[140px]"
          >
            <option value="">Type · All</option>
            <option value="client">Client</option>
            <option value="job">Job</option>
            <option value="candidate">Candidate</option>
            <option value="candidateJob">Candidate + Job</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-10 text-sm border border-slate-200 rounded-lg px-3 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 min-w-[190px]"
          >
            <option value="dueAsc">Sort · Due date (soonest)</option>
            <option value="dueDesc">Sort · Due date (latest)</option>
            <option value="priority">Sort · Priority</option>
            <option value="createdAt">Sort · Most recent</option>
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setRecruiterF(''); setTypeF('') }}
              className="h-10 flex items-center gap-1.5 px-3 text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <X size={13} />Clear
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            <span className="text-[12px] text-slate-400 tabular-nums">{filtered.length} reminders</span>
            <button className="h-10 flex items-center gap-2 px-3 text-sm font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>filter_list</span>
              Filters
            </button>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-white">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-2xl">🔔</div>
              <p className="text-sm font-semibold text-slate-700 mb-1">No reminders found</p>
              <p className="text-xs text-slate-400 mb-5">Try adjusting your filters or create a new reminder</p>
              <div className="flex gap-2">
                {hasFilters && (
                  <button
                    onClick={() => { setSearch(''); setRecruiterF(''); setTypeF(''); setTab('all') }}
                    className="text-sm font-medium text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => setModal('new')}
                  className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <Plus size={14} />Add Reminder
                </button>
              </div>
            </div>
          ) : (
            <div className="pb-8">
              {SECTION_ORDER.map((sec) => (
                <ReminderSection
                  key={sec}
                  sectionKey={sec}
                  reminders={grouped[sec] ?? []}
                  defaultOpen={sec !== 'completed'}
                  {...sharedRowProps}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {drawer && (
        <DetailDrawer
          reminder={drawer}
          onClose={() => setDrawer(null)}
          onEdit={() => { setModal(drawer); setDrawer(null) }}
          onComplete={() => toggleComplete(drawer.id)}
          onDelete={() => setConfirmDel(drawer.id)}
        />
      )}

      {modal && (
        <ReminderModal
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={saveReminder}
        />
      )}

      {confirmDel && (
        <ConfirmDialog
          onConfirm={() => deleteReminder(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}
