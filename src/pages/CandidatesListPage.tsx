import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import StatusDot from '../components/StatusDot'
import { candidates as baseCandidates, jobs, clients, recruiters, STAGE_LABELS } from '../data/mockData'
import type { PipelineStage, Candidate } from '../types'
import { TODAY } from '../utils/format'

const BLANK_CANDIDATE = {
  name: '', email: '', location: 'Tokyo', experienceYears: '3',
  jobId: '', recruiterId: '', skills: '',
}

function AddCandidateModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Candidate) => void }) {
  const [form, setForm] = useState(BLANK_CANDIDATE)
  const [error, setError] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) { if (e.target === overlayRef.current) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  function submit() {
    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.jobId) { setError('Please select a job'); return }
    if (!form.recruiterId) { setError('Please select a recruiter'); return }
    const newCandidate: Candidate = {
      id: `cand-new-${Date.now()}`,
      jobId: form.jobId,
      name: form.name,
      email: form.email,
      location: form.location,
      experienceYears: Number(form.experienceYears) || 3,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      stage: 'sourced',
      recruiterId: form.recruiterId,
      appliedDate: TODAY,
      lastActivityDate: TODAY,
      nextReminderDate: null,
      reminderOverdue: false,
    }
    onAdd(newCandidate)
    onClose()
  }

  const set = (k: keyof typeof BLANK_CANDIDATE) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Add Candidate</h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {error && <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="Yuki Tanaka" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
              <input value={form.email} onChange={set('email')} type="email" placeholder="yuki@email.com" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
              <input value={form.location} onChange={set('location')} placeholder="Tokyo" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Experience (years)</label>
              <input value={form.experienceYears} onChange={set('experienceYears')} type="number" min="0" max="40" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Applying For *</label>
              <select value={form.jobId} onChange={set('jobId')} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select job…</option>
                {jobs.filter((j) => j.status === 'active').map((j) => {
                  const c = clients.find((cl) => cl.id === j.clientId)
                  return <option key={j.id} value={j.id}>{j.title} — {c?.companyName}</option>
                })}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Recruiter *</label>
              <select value={form.recruiterId} onChange={set('recruiterId')} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select recruiter…</option>
                {recruiters.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Skills (comma-separated)</label>
              <input value={form.skills} onChange={set('skills')} placeholder="React, TypeScript, Node.js" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="text-sm font-medium text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={submit} className="text-sm font-semibold text-white bg-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">Add Candidate</button>
        </div>
      </div>
    </div>
  )
}

const stageBadge: Record<PipelineStage, string> = {
  sourced:   'bg-slate-100 text-slate-600',
  screening: 'bg-blue-100 text-blue-700',
  interview: 'bg-teal-100 text-teal-700',
  offered:   'bg-purple-100 text-purple-700',
  placed:    'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-600',
}

function daysAgo(dateStr: string) {
  const d = Math.floor((new Date(TODAY).getTime() - new Date(dateStr).getTime()) / 86400000)
  if (d <= 0) return 'Today'
  if (d === 1) return 'Yesterday'
  return `${d}d ago`
}

const allStages: (PipelineStage | 'all')[] = ['all', 'sourced', 'screening', 'interview', 'offered', 'placed', 'rejected']

export default function CandidatesListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState<PipelineStage | 'all'>('all')
  const [recruiterFilter, setRecruiterFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [localCandidates, setLocalCandidates] = useState<Candidate[]>([])

  const allCandidates = useMemo(() => [...baseCandidates, ...localCandidates], [localCandidates])

  const enriched = useMemo(() => allCandidates.map((c) => {
    const job    = jobs.find((j) => j.id === c.jobId)
    const client = clients.find((cl) => cl.id === job?.clientId)
    const rec    = recruiters.find((r) => r.id === c.recruiterId)
    return { ...c, job, client, rec }
  }), [allCandidates])

  const filtered = useMemo(() => enriched.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.skills.some((s: string) => s.toLowerCase().includes(q)) ||
      c.location.toLowerCase().includes(q) ||
      (c.job?.title ?? '').toLowerCase().includes(q)
    const matchStage = stage === 'all' || c.stage === stage
    const matchRec   = recruiterFilter === 'All' || c.rec?.name === recruiterFilter
    return matchSearch && matchStage && matchRec
  }), [enriched, search, stage, recruiterFilter])

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: allCandidates.length }
    allCandidates.forEach((c) => { m[c.stage] = (m[c.stage] ?? 0) + 1 })
    return m
  }, [allCandidates])

  return (
    <>
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Candidates"
          subtitle={`${allCandidates.length} candidates across ${jobs.length} positions`}
          actions={
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>add</span>
              Add Candidate
            </button>
          }
        />

        {/* Stage filter tabs */}
        <div className="flex items-center gap-1 px-6 py-2 bg-white border-b border-slate-200 overflow-x-auto">
          {allStages.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                stage === s ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {s === 'all' ? 'All' : STAGE_LABELS[s]}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${stage === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {counts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200">
          <div className="relative flex-1 max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '16px' }}>search</span>
            <input
              type="text" placeholder="Search name, skill, location..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select
            value={recruiterFilter} onChange={(e) => setRecruiterFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>All</option>
            {recruiters.map((r) => <option key={r.id}>{r.name}</option>)}
          </select>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} showing</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Candidate</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Applied For</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Skills</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Stage</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Recruiter</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Last Activity</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/candidates/${c.id}`)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <StatusDot lastActivityDate={c.lastActivityDate} reminderOverdue={c.reminderOverdue} />
                        <div>
                          <div className="font-semibold text-slate-800">{c.name}</div>
                          <div className="text-xs text-slate-400">{c.location} · {c.experienceYears}yr exp</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-700">{c.job?.title}</div>
                      <div className="text-xs text-slate-400">{c.client?.companyName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 2).map((s) => (
                          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                        ))}
                        {c.skills.length > 2 && <span className="text-xs text-slate-400">+{c.skills.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stageBadge[c.stage]}`}>
                        {STAGE_LABELS[c.stage]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{c.rec?.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{daysAgo(c.lastActivityDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => navigate(`/candidates/${c.id}`)} className="text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors">
                          Profile
                        </button>
                        <button onClick={() => navigate(`/jobs/${c.jobId}/pipeline`)} className="text-xs font-medium text-teal bg-teal/5 hover:bg-teal/10 px-2.5 py-1 rounded-lg transition-colors">
                          Pipeline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">No candidates found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-slate-400 text-right">Showing {filtered.length} of {allCandidates.length} candidates</div>
        </div>
      </div>
    </div>
    {showModal && (
      <AddCandidateModal
        onClose={() => setShowModal(false)}
        onAdd={(c) => setLocalCandidates((prev) => [c, ...prev])}
      />
    )}
    </>
  )
}
