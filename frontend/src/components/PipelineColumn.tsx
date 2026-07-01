import { useDroppable } from '@dnd-kit/core'
import type { Candidate, PipelineStage } from '../types'
import CandidateCard from './CandidateCard'

interface PipelineColumnProps {
  stage: PipelineStage
  candidates: Candidate[]
  label: string
  color: string
}

const stageHeaderColors: Record<PipelineStage, string> = {
  sourced: 'bg-slate-500',
  screening: 'bg-primary',
  interview: 'bg-teal',
  offered: 'bg-client-purple',
  placed: 'bg-success',
  rejected: 'bg-danger',
}

export default function PipelineColumn({ stage, candidates, label }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  const headerColor = stageHeaderColors[stage]

  return (
    <div className="min-w-[220px] w-[220px] flex-shrink-0 flex flex-col">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className={`text-xs font-bold text-white px-2 py-1 rounded-md ${headerColor}`}>
          {label}
        </span>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
          {candidates.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-[400px] bg-slate-50 rounded-lg p-2 overflow-y-auto
          max-h-[calc(100vh-260px)]
          transition-colors
          ${isOver ? 'ring-2 ring-primary ring-offset-1 bg-primary/5' : ''}
        `}
      >
        {candidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
        {candidates.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-slate-300 border-2 border-dashed border-slate-200 rounded-lg">
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}
