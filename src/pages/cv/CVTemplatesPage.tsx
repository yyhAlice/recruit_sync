import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import StepIndicator from '../../components/cv/StepIndicator'
import { useCVContext } from '../../context/CVContext'
import { cvTemplates } from '../../data/cvMockData'
import type { OutputFormat, TemplateLanguage } from '../../types/cv'

const LANG_FILTERS: { value: TemplateLanguage | 'all'; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'en',        label: 'English' },
  { value: 'ja',        label: 'Japanese' },
  { value: 'bilingual', label: 'Bilingual' },
]

const FORMAT_OPTIONS: { value: OutputFormat; label: string; icon: string }[] = [
  { value: 'pdf',  label: 'PDF',        icon: 'picture_as_pdf' },
  { value: 'docx', label: 'DOCX',       icon: 'description' },
  { value: 'both', label: 'PDF + DOCX', icon: 'file_copy' },
]

function langBadge(lang: TemplateLanguage) {
  if (lang === 'ja') return 'bg-red-100 text-red-700'
  if (lang === 'bilingual') return 'bg-purple-100 text-purple-700'
  return 'bg-blue-100 text-blue-700'
}

function langLabel(lang: TemplateLanguage) {
  if (lang === 'ja') return 'Japanese'
  if (lang === 'bilingual') return 'Bilingual EN/JA'
  return 'English'
}

export default function CVTemplatesPage() {
  const navigate = useNavigate()
  const { session, updateSession } = useCVContext()

  const [selectedId, setSelectedId]     = useState<string>(session.selectedTemplateId ?? '')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(session.outputFormat ?? 'pdf')
  const [langFilter, setLangFilter]     = useState<TemplateLanguage | 'all'>('all')

  const filtered = cvTemplates.filter((t) => langFilter === 'all' || t.language === langFilter)
  const selected = cvTemplates.find((t) => t.id === selectedId)

  function handleContinue() {
    if (!selectedId) return
    updateSession({ selectedTemplateId: selectedId, outputFormat })
    navigate('/cv/mapping')
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Select Template"
          subtitle="Step 3 of 5 — Choose an output template for the generated CV"
          actions={
            <button onClick={() => navigate('/cv/templates/manage')} className="text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              Manage Templates
            </button>
          }
        />
        <StepIndicator currentPath="/cv/templates" />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Language filter */}
          <div className="flex items-center gap-2 mb-5">
            {LANG_FILTERS.map((f) => (
              <button key={f.value} onClick={() => setLangFilter(f.value)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${langFilter === f.value ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {filtered.map((tpl) => {
              const isSelected = tpl.id === selectedId
              return (
                <button key={tpl.id} onClick={() => setSelectedId(tpl.id)}
                  className={`text-left rounded-xl border-2 overflow-hidden transition-all ${isSelected ? 'border-primary shadow-md shadow-primary/10' : 'border-slate-200 hover:border-primary/40'}`}>
                  {/* Color thumbnail */}
                  <div className="relative h-28 flex items-center justify-center" style={{ backgroundColor: tpl.thumbnailColor }}>
                    <span className="material-symbols-outlined text-white opacity-30" style={{ fontSize: '52px' }}>description</span>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                      <div className="w-20 h-1.5 bg-white/40 rounded-full" />
                      <div className="w-16 h-1 bg-white/30 rounded-full" />
                      <div className="w-18 h-1 bg-white/30 rounded-full" />
                      <div className="w-14 h-1 bg-white/20 rounded-full" />
                      <div className="w-16 h-1 bg-white/20 rounded-full mt-1" />
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>check</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="bg-white p-3.5">
                    <div className="flex items-start gap-2 mb-1.5">
                      <div className="font-semibold text-slate-800 text-xs flex-1 leading-snug">{tpl.name}</div>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${langBadge(tpl.language)}`}>{langLabel(tpl.language)}</span>
                    </div>
                    {tpl.clientName && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-client-purple" style={{ fontSize: '12px' }}>business</span>
                        <span className="text-xs text-client-purple font-medium">{tpl.clientName}</span>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 leading-snug line-clamp-2">{tpl.description}</p>
                    <div className="mt-2 text-xs text-slate-300">Updated {tpl.lastUpdated} · {tpl.createdBy}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Output format selector */}
          {selectedId && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Output Format</h3>
              <div className="flex gap-3">
                {FORMAT_OPTIONS.map((f) => (
                  <button key={f.value} onClick={() => setOutputFormat(f.value)}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${outputFormat === f.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:border-primary/30'}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{f.icon}</span>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected summary */}
          {selected && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex-shrink-0" style={{ backgroundColor: selected.thumbnailColor }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{selected.name}</p>
                <p className="text-xs text-slate-500">{langLabel(selected.language)} · {outputFormat === 'both' ? 'PDF + DOCX' : outputFormat.toUpperCase()}</p>
              </div>
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>check_circle</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pb-6">
            <button onClick={() => navigate('/cv/review')} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedId}
              className={`flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors ${selectedId ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              Continue to Field Mapping
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
