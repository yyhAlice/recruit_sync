import { useDraggable } from '@dnd-kit/core'
import type { Candidate } from '../types'
import StatusDot from './StatusDot'

interface CandidateCardProps {
  candidate: Candidate
  isDragOverlay?: boolean
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export default function CandidateCard({ candidate, isDragOverlay = false }: CandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidate.id,
    data: { candidate },
  })

  const style: React.CSSProperties = {
    transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
    opacity: isDragging ? 0.35 : 1,
    cursor: isDragging || isDragOverlay ? 'grabbing' : 'grab',
  }

  const isPlaced = candidate.stage === 'placed'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        bg-white rounded-lg border border-slate-200 p-3 mb-2 select-none
        ${isDragOverlay ? 'shadow-xl ring-2 ring-primary/30' : 'shadow-sm hover:shadow-md hover:border-slate-300'}
        ${isPlaced ? 'opacity-60' : ''}
        transition-shadow
      `}
    >
      {/* Top row: StatusDot + Name */}
      <div className="flex items-center gap-2 mb-2">
        <StatusDot lastActivityDate={candidate.lastActivityDate} reminderOverdue={candidate.reminderOverdue} />
        <span className="font-semibold text-slate-800 text-sm truncate">{candidate.name}</span>
      </div>

      {/* Skills badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        {candidate.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">
            {skill}
          </span>
        ))}
        {candidate.skills.length > 3 && (
          <span className="text-xs bg-slate-100 text-slate-400 rounded px-1.5 py-0.5">
            +{candidate.skills.length - 3}
          </span>
        )}
      </div>

      {/* Experience */}
      <div className="text-xs text-slate-500 mb-1.5">
        {candidate.experienceYears}y exp · {candidate.location}
      </div>

      {/* Last activity */}
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>calendar_today</span>
        <span>{formatDate(candidate.lastActivityDate)}</span>
      </div>

      {/* Next reminder */}
      <div className={`flex items-center gap-1 text-xs ${candidate.reminderOverdue ? 'text-danger font-medium' : candidate.nextReminderDate ? 'text-slate-400' : 'text-slate-300'}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>notifications</span>
        {candidate.nextReminderDate
          ? <span>{formatDate(candidate.nextReminderDate)}{candidate.reminderOverdue ? ' (overdue)' : ''}</span>
          : <span>No reminder</span>
        }
      </div>
    </div>
  )
}
