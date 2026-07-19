import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import { Search } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import PipelineColumn from '../components/PipelineColumn'
import CandidateCard from '../components/CandidateCard'
import {
  getJobById, getClientById, getCandidatesByJobId,
  recruiters, PIPELINE_STAGES, STAGE_LABELS,
} from '../data/mockData'
import type { Candidate, PipelineStage } from '../types'

function lsKey(jobId: string) { return `rs_pipeline_${jobId}` }

function loadStages(jobId: string, initial: Candidate[]): Candidate[] {
  try {
    const raw = localStorage.getItem(lsKey(jobId))
    if (!raw) return initial
    const saved: Record<string, PipelineStage> = JSON.parse(raw)
    return initial.map((c) => saved[c.id] ? { ...c, stage: saved[c.id] } : c)
  } catch { return initial }
}

function saveStages(jobId: string, candidates: Candidate[]) {
  const map: Record<string, PipelineStage> = {}
  candidates.forEach((c) => { map[c.id] = c.stage })
  localStorage.setItem(lsKey(jobId), JSON.stringify(map))
}

const stageColors: Record<PipelineStage, string> = {
  sourced: 'bg-slate-500', screening: 'bg-primary', interview: 'bg-teal',
  offered: 'bg-violet-500', placed: 'bg-success', rejected: 'bg-danger',
}

export default function PipelineBoardPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate  = useNavigate()

  const job    = getJobById(jobId ?? '')
  const client = job ? getClientById(job.clientId) : undefined

  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    loadStages(jobId ?? '', getCandidatesByJobId(jobId ?? ''))
  )
  const [recruiterFilter, setRecruiterFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    if (jobId) saveStages(jobId, candidates)
  }, [candidates, jobId])

  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id as string) }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over) return
    const newStage = over.id as PipelineStage
    setCandidates((prev) =>
      prev.map((c) => c.id === active.id ? { ...c, stage: newStage } : c)
    )
  }

  if (!job || !client) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-slate-400">Job not found</div>
      </div>
    )
  }

  const q = search.toLowerCase()
  const filtered = candidates.filter((c) => {
    if (recruiterFilter !== 'all' && c.recruiterId !== recruiterFilter) return false
    if (q && !c.name.toLowerCase().includes(q) && !c.skills.some((s) => s.toLowerCase().includes(q))) return false
    return true
  })

  const activeCandidate = activeId ? candidates.find((c) => c.id === activeId) ?? null : null

  const stageCounts = Object.fromEntries(
    PIPELINE_STAGES.map((s) => [s, filtered.filter((c) => c.stage === s).length])
  ) as Record<PipelineStage, number>

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title={`${job.title} — Pipeline`}
          breadcrumbs={[
            { label: 'Clients', to: '/clients' },
            { label: client.companyName, to: `/clients/${client.id}` },
            { label: job.title, to: `/jobs/${job.id}` },
            { label: 'Pipeline' },
          ]}
          actions={
            <button
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
              Job Detail
            </button>
          }
        />

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates or skills…"
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-56 bg-white"
            />
          </div>

          <select
            value={recruiterFilter}
            onChange={(e) => setRecruiterFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-slate-700"
          >
            <option value="all">All Recruiters</option>
            {recruiters.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          <span className="text-xs text-slate-400 font-medium">{filtered.length} candidate{filtered.length !== 1 ? 's' : ''}</span>

          {(search || recruiterFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setRecruiterFilter('all') }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>close</span>
              Clear
            </button>
          )}
        </div>

        {/* Board */}
        <div className="flex-1 overflow-auto p-5">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <div className="flex gap-3 pb-4 min-h-[500px]">
              {PIPELINE_STAGES.map((stage) => (
                <PipelineColumn
                  key={stage}
                  stage={stage}
                  label={`${STAGE_LABELS[stage]} (${stageCounts[stage]})`}
                  color={stageColors[stage]}
                  candidates={filtered.filter((c) => c.stage === stage)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeCandidate ? <CandidateCard candidate={activeCandidate} isDragOverlay /> : null}
            </DragOverlay>
          </DndContext>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-5 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Activity:</span>
            {[
              { color: 'bg-success', label: 'Active (<7d)' },
              { color: 'bg-warning', label: 'Needs attention (7–14d)' },
              { color: 'bg-danger',  label: 'Overdue (>14d)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
