import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import PipelineColumn from '../components/PipelineColumn'
import CandidateCard from '../components/CandidateCard'
import {
  getJobById,
  getClientById,
  getCandidatesByJobId,
  recruiters,
  PIPELINE_STAGES,
  STAGE_LABELS,
} from '../data/mockData'
import type { Candidate, PipelineStage } from '../types'

export default function PipelineBoardPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()

  const job = getJobById(jobId ?? '')
  const client = job ? getClientById(job.clientId) : undefined

  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    getCandidatesByJobId(jobId ?? '')
  )
  const [recruiterFilter, setRecruiterFilter] = useState<string>('all')
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const newStage = over.id as PipelineStage
    setCandidates((prev) =>
      prev.map((c) => (c.id === active.id ? { ...c, stage: newStage } : c))
    )
  }

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

  const filteredCandidates =
    recruiterFilter === 'all'
      ? candidates
      : candidates.filter((c) => c.recruiterId === recruiterFilter)

  const activeCandidate = activeId
    ? candidates.find((c) => c.id === activeId) ?? null
    : null

  const stageColors: Record<PipelineStage, string> = {
    sourced: 'bg-slate-500',
    screening: 'bg-primary',
    interview: 'bg-teal',
    offered: 'bg-client-purple',
    placed: 'bg-success',
    rejected: 'bg-danger',
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
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
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>arrow_back</span>
              Job Detail
            </button>
          }
        />

        {/* Filter row */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200">
          <label className="text-sm text-slate-500 font-medium">Recruiter:</label>
          <select
            value={recruiterFilter}
            onChange={(e) => setRecruiterFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white text-slate-700"
          >
            <option value="all">All Recruiters</option>
            {recruiters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <div className="text-xs text-slate-400 ml-2">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Board */}
        <div className="flex-1 overflow-auto p-6">
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
                  label={STAGE_LABELS[stage]}
                  color={stageColors[stage]}
                  candidates={filteredCandidates.filter((c) => c.stage === stage)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeCandidate ? (
                <CandidateCard candidate={activeCandidate} isDragOverlay />
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-5 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Activity status:</span>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-success" />
              Active (&lt;7 days)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-warning" />
              Needs attention (7–14 days)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-danger" />
              Overdue (&gt;14 days or reminder overdue)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
