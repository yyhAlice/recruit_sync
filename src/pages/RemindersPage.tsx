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

function dueDateDisplay(r: Reminder): { text: string; cls: string; icon: string } {
  const sec = sectionOf(r)
  if (sec === 'overdue') {
    const days = Math.ceil((new Date(TODAY).getTime() - new Date(r.dueDate).getTime()) / 86400000)
    return { text: `${days} day${days !== 1 ? 's' : ''} overdue`, cls: 'text-red-600', icon: 'warning' }
  }
  if (sec === 'today') {
    const t = r.dueTime ? `, ${r.dueTime}` : ''
    return { text: `Today${t}`, cls: 'text-amber-600', icon: 'today' }
  }
  if (sec === 'tomorrow') {
    const t = r.dueTime ? `, ${r.dueTime}` : ''
    return { text: `Tomorrow${t}`, cls: 'text-blue-500', icon: 'calendar_today' }
  }
  const d = new Date(r.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return { text: d, cls: 'text-slate-500', icon: 'calendar_today' }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const PRIORITY_EMOJI: Record<Priority, string> = { high: '🔴', medium: '🟡', low: '⚪' }

const PRIORITY_CFG: Record<Priority, { bg: string; text: string; label: string }> = {
  high:   { bg: 'bg-red-100',   text: 'text-red-700',   label: 'High'   },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium' },
  low:    { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Low'    },
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500',  'bg-teal-500',
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  const { bg, text, label } = PRIORITY_CFG[priority]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold whitespace-nowrap flex-shrink-0 ${bg} ${text}`}>
      {label}
    </span>
  )
}

function PriorityIndicator({ priority }: { priority: Priority }) {
  return <PriorityBadge priority={priority} />
}

function DueDateChip({ reminder }: { reminder: Reminder }) {
  if (reminder.status === 'completed' && reminder.completedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 whitespace-nowrap flex-shrink-0">
        <Check size={12} className="text-slate-300" strokeWidth={2.5} />
        {fmtDate(reminder.completedAt)}
      </span>
    )
  }
  const { text, cls, icon } = dueDateDisplay(reminder)
  const isOverdue = sectionOf(reminder) === 'overdue'
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] whitespace-nowrap flex-shrink-0 ${isOverdue ? 'font-bold' : 'font-medium'} ${cls}`}>
      <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '14px' }}>{icon}</span>
      {text}
    </span>
  )
}

function RecruiterAvatar({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const init  = parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : (parts[0] ?? '?').slice(0, 2)
  const color = AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]
  return (
    <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center flex-shrink-0`} title={name}>
      <span className="text-[9px] font-bold text-white uppercase leading-none">{init}</span>
    </div>
  )
}

// ── Stat Chip ─────────────────────────────────────────────────────────────────
function StatChip({
  dotCls, label, count, active, activeText, onClick,
}: {
  dotCls: string; label: string; count: number
  active: boolean; activeText: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 h-8 rounded-lg text-[13px] transition-all border ${
        active
          ? `bg-white border-slate-200 shadow-sm font-semibold ${activeText}`
          : 'border-transparent font-medium text-slate-500 hover:bg-white hover:border-slate-200 hover:text-slate-700'
      }`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? dotCls : 'bg-slate-300'}`} />
      {label}
      <span className={`tabular-nums font-bold ${active ? activeText : 'text-slate-600'}`}>{count}</span>
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
    sec === 'today'   ? 'bg-amber-400' : ''

  return (
    <div
      className={`group relative flex items-center gap-3 pl-6 pr-4 min-h-[64px] border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${completed ? 'opacity-60' : ''}`}
      style={{ paddingTop: '12px', paddingBottom: '12px' }}
    >
      {/* Left accent — overdue and today only */}
      {!completed && accentCls && (
        <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${accentCls}`} />
      )}

      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onCheck() }}
        className={`flex-shrink-0 w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-colors ${
          completed ? 'bg-slate-100 border-slate-300' : 'border-slate-300 hover:border-primary'
        }`}
      >
        {completed && <Check size={9} className="text-slate-400" strokeWidth={3} />}
      </button>

      {/* Title + cross-fade: metadata ↔ quick actions */}
      <div className="flex-1 min-w-0" onClick={onView}>
        <p className={`text-[15px] font-semibold leading-snug truncate ${
          completed ? 'line-through text-slate-400' : 'text-slate-800'
        }`}>
          {reminder.title}
        </p>
        <div className="relative h-[18px] mt-0.5">
          {context && (
            <p className="absolute inset-0 text-[13px] text-slate-500 truncate leading-[18px] transition-opacity group-hover:opacity-0">
              {context}
            </p>
          )}
          {!completed && (
            <div className="absolute inset-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onCheck() }}
                className="inline-flex items-center gap-1 px-2 h-[18px] rounded text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors whitespace-nowrap"
              >
                <Check size={9} strokeWidth={2.5} />Complete
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit() }}
                className="inline-flex items-center gap-1 px-2 h-[18px] rounded text-[11px] font-medium text-slate-500 hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>edit</span>Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReschedule() }}
                className="inline-flex items-center gap-1 px-2 h-[18px] rounded text-[11px] font-medium text-slate-500 hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>schedule</span>Reschedule
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Due date — fixed width column so dates align vertically */}
      <div className="w-[152px] flex-shrink-0 hidden sm:flex justify-end">
        <DueDateChip reminder={reminder} />
      </div>

      {/* Priority badge — fixed width */}
      <div className="w-[72px] flex-shrink-0 hidden md:flex justify-end">
        <PriorityBadge priority={reminder.priority} />
      </div>

      {/* Avatar (fades out on hover) + More menu (fades in on hover) */}
      <div className="flex-shrink-0 flex items-center gap-1.5">
        <div className="transition-opacity group-hover:opacity-0">
          <RecruiterAvatar name={reminder.assignedRecruiter} />
        </div>
        <MoreMenu
          onView={onView} onEdit={onEdit} onReschedule={onReschedule}
          onComplete={onCheck} onDuplicate={onDuplicate} onDelete={onDelete}
        />
      </div>
    </div>
  )
}

// ── Reminder Section ──────────────────────────────────────────────────────────
const SECTION_META: Record<string, {
  label: string; labelCls: string; headerBg: string; dotCls: string; borderCls: string
}> = {
  overdue:   { label: 'Overdue',   labelCls: 'text-red-600',   headerBg: 'bg-red-50/80',   dotCls: 'bg-red-400',   borderCls: 'border-red-100'   },
  today:     { label: 'Today',     labelCls: 'text-amber-700', headerBg: 'bg-amber-50/70', dotCls: 'bg-amber-400', borderCls: 'border-amber-100' },
  tomorrow:  { label: 'Tomorrow',  labelCls: 'text-blue-600',  headerBg: 'bg-slate-50',    dotCls: 'bg-blue-400',  borderCls: 'border-slate-200' },
  thisWeek:  { label: 'This Week', labelCls: 'text-slate-600', headerBg: 'bg-slate-50',    dotCls: 'bg-slate-300', borderCls: 'border-slate-200' },
  later:     { label: 'Upcoming',  labelCls: 'text-slate-600', headerBg: 'bg-slate-50',    dotCls: 'bg-slate-300', borderCls: 'border-slate-200' },
  completed: { label: 'Completed', labelCls: 'text-green-700', headerBg: 'bg-green-50/50', dotCls: 'bg-green-400', borderCls: 'border-green-100' },
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

  const useLimit    = ['tomorrow', 'thisWeek', 'later'].includes(sectionKey) && !showAll
  const visible     = useLimit ? reminders.slice(0, SHOW_MORE_LIMIT) : reminders
  const hiddenCount = reminders.length - visible.length

  return (
    <div>
      {/* Sticky section header */}
      <div className={`sticky top-0 z-10 flex items-center gap-2.5 px-6 py-2 border-y ${meta.headerBg} ${meta.borderCls}`}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <ChevronDown
            size={11}
            className={`text-slate-400 transition-transform flex-shrink-0 ${!open ? '-rotate-90' : ''}`}
          />
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dotCls}`} />
          <span className={`text-[11px] font-bold uppercase tracking-widest ${meta.labelCls}`}>
            {meta.label}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 ml-0.5">
            ({reminders.length})
          </span>
        </button>
      </div>

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
              className="flex items-center gap-1.5 pl-[58px] py-2.5 text-[12px] font-semibold text-primary hover:text-primary-dark transition-colors"
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
    onCheck:      (id: string)  => toggleComplete(id),
    onView:       (r: Reminder) => setDrawer(r),
    onEdit:       (r: Reminder) => setModal(r),
    onReschedule: (r: Reminder) => setModal(r),
    onDuplicate:  (r: Reminder) => duplicateReminder(r),
    onDelete:     (id: string)  => setConfirmDel(id),
  }

  function toggleTab(key: TabKey) { setTab((prev) => prev === key ? 'all' : key) }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Page header ───────────────────────────────────────────────── */}
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

        {/* ── Stat chips — compact filter strip ─────────────────────────── */}
        <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center gap-1 flex-shrink-0">
          <StatChip
            dotCls="bg-red-400" label="Overdue" count={sectionCounts.overdue}
            active={tab === 'overdue'} activeText="text-red-600"
            onClick={() => toggleTab('overdue')}
          />
          <StatChip
            dotCls="bg-amber-400" label="Today" count={sectionCounts.today}
            active={tab === 'today'} activeText="text-amber-600"
            onClick={() => toggleTab('today')}
          />
          <StatChip
            dotCls="bg-blue-400" label="Upcoming" count={sectionCounts.upcoming}
            active={tab === 'upcoming'} activeText="text-blue-600"
            onClick={() => toggleTab('upcoming')}
          />
          <StatChip
            dotCls="bg-green-400" label="Completed" count={completed.length}
            active={tab === 'completed'} activeText="text-green-700"
            onClick={() => toggleTab('completed')}
          />
          <span className="mx-1.5 w-px h-4 bg-slate-200 flex-shrink-0" />
          <StatChip
            dotCls="bg-slate-400" label="Total" count={reminders.length}
            active={tab === 'all'} activeText="text-slate-700"
            onClick={() => setTab('all')}
          />
        </div>

        {/* ── Filter bar ────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 flex-shrink-0">
          <div className="relative flex-1 max-w-[240px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '15px' }}>search</span>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reminders…"
              className="w-full h-9 pl-8 pr-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 bg-white placeholder:text-slate-400"
            />
          </div>

          <select
            value={recruiterF} onChange={(e) => setRecruiterF(e.target.value)}
            className="h-9 text-sm border border-slate-200 rounded-lg px-2.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[130px]"
          >
            <option value="">Recruiter</option>
            {allRecruiters.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={typeF} onChange={(e) => setTypeF(e.target.value as RelatedType | '')}
            className="h-9 text-sm border border-slate-200 rounded-lg px-2.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[100px]"
          >
            <option value="">Type</option>
            <option value="client">Client</option>
            <option value="job">Job</option>
            <option value="candidate">Candidate</option>
            <option value="candidateJob">Candidate + Job</option>
          </select>

          <select
            value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-9 text-sm border border-slate-200 rounded-lg px-2.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px]"
          >
            <option value="dueAsc">Due date ↑</option>
            <option value="dueDesc">Due date ↓</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Most recent</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setRecruiterF(''); setTypeF('') }}
              className="h-9 flex items-center gap-1 px-2.5 text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={13} />Clear
            </button>
          )}

          <span className="ml-auto text-[12px] text-slate-400 tabular-nums">{filtered.length} reminders</span>
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
