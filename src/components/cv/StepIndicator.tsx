const STEPS = [
  { label: 'Upload',    path: '/cv/upload'    },
  { label: 'Review',   path: '/cv/review'    },
  { label: 'Template', path: '/cv/templates' },
  { label: 'Mapping',  path: '/cv/mapping'   },
  { label: 'Preview',  path: '/cv/preview'   },
]

interface StepIndicatorProps {
  currentPath: string
}

export default function StepIndicator({ currentPath }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.path === currentPath)

  return (
    <div className="flex items-center gap-0 px-6 py-3 bg-white border-b border-slate-200">
      {STEPS.map((step, i) => {
        const done    = i < currentIndex
        const active  = i === currentIndex
        return (
          <div key={step.path} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                done   ? 'bg-success text-white' :
                active ? 'bg-primary text-white' :
                         'bg-slate-100 text-slate-400'
              }`}>
                {done ? (
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>check</span>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${
                active ? 'text-primary' : done ? 'text-success' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-px mx-3 ${done ? 'bg-success' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
