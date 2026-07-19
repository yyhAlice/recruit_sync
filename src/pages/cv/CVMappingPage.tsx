import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import StepIndicator from '../../components/cv/StepIndicator'
import { useCVContext } from '../../context/CVContext'
import { useCandidateContext } from '../../context/CandidateContext'
import { cvTemplates } from '../../data/cvMockData'
import { TODAY } from '../../utils/format'
import type { Candidate } from '../../types'
import type { FieldMapping } from '../../types/cv'

function confidenceBadge(score: number) {
  if (score >= 90) return 'bg-green-100 text-success'
  if (score >= 70) return 'bg-amber-100 text-warning'
  return 'bg-red-100 text-danger'
}

function confidenceLabel(score: number) {
  if (score >= 90) return 'High'
  if (score >= 70) return 'Medium'
  return 'Low'
}

export default function CVMappingPage() {
  const navigate = useNavigate()
  const { session, updateSession, addToHistory, simulateAutoMap } = useCVContext()
  const { addCandidate } = useCandidateContext()

  const template = cvTemplates.find((t) => t.id === session.selectedTemplateId) ?? cvTemplates[0]

  const [mappings, setMappings] = useState<FieldMapping[]>(
    session.fieldMappings.length > 0 ? session.fieldMappings : simulateAutoMap(template.placeholders)
  )
  const [filter, setFilter]           = useState<'all' | 'unmapped' | 'mapped'>('all')
  const [saveTemplate, setSaveTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [autoMatched, setAutoMatched]   = useState(session.fieldMappings.length > 0)
  const [generating, setGenerating]     = useState(false)

  function updateDest(id: string, dest: string) {
    setMappings((ms) => ms.map((m) => m.id === id ? { ...m, destination: dest } : m))
  }

  function handleAutoMatch() {
    setMappings(simulateAutoMap(template.placeholders))
    setAutoMatched(true)
  }

  async function handleGenerate() {
    setGenerating(true)
    updateSession({ fieldMappings: mappings })

    await new Promise((r) => setTimeout(r, 1500))

    addToHistory({
      id: `g-${Date.now()}`,
      candidateName:  session.candidateName  || session.parsedData?.fullName  || 'Unknown',
      candidateEmail: session.candidateEmail || session.parsedData?.email     || '',
      sourceFiles: session.files.map((f) => f.name),
      templateId:   template.id,
      templateName: template.name,
      outputFormat: session.outputFormat,
      generatedBy: 'Y. Tanaka',
      generatedAt: new Date().toISOString().slice(0, 10),
      status: 'completed',
    })

    if (!session.candidateSaved && session.parsedData && session.jobId && session.recruiterId) {
      const parsed = session.parsedData
      const newCandidate: Candidate = {
        id: `cand-new-${Date.now()}`,
        jobId: session.jobId,
        recruiterId: session.recruiterId,
        name: parsed.fullName,
        email: parsed.email,
        location: parsed.currentLocation,
        experienceYears: Number(parsed.totalExperienceYears) || 0,
        skills: parsed.skills,
        stage: 'sourced',
        appliedDate: TODAY,
        lastActivityDate: TODAY,
        nextReminderDate: null,
        reminderOverdue: false,
        phone: parsed.phone,
        address: parsed.address,
        dateOfBirth: parsed.dateOfBirth,
        currentJobTitle: parsed.currentJobTitle,
        desiredRole: parsed.desiredRole,
        availability: parsed.availability,
        workExperience: parsed.workExperience,
        education: parsed.education,
        languages: parsed.languages,
        certifications: parsed.certifications,
        cvTemplateName: template.name,
        cvOutputFormat: session.outputFormat,
        cvGeneratedAt: new Date().toISOString().slice(0, 10),
        cvStatus: 'completed',
      }
      addCandidate(newCandidate)
      updateSession({ candidateSaved: true, candidateId: newCandidate.id })
    }

    setGenerating(false)
    navigate('/cv/preview')
  }

  const filtered = mappings.filter((m) => {
    if (filter === 'unmapped') return !m.destination
    if (filter === 'mapped')   return !!m.destination
    return true
  })

  const unmappedCount = mappings.filter((m) => !m.destination).length
  const mappedCount   = mappings.filter((m) => !!m.destination).length

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Field Mapping"
          subtitle={`Step 4 of 5 — Map source fields to placeholders in "${template.name}"`}
          actions={
            <button
              onClick={handleAutoMatch}
              className="flex items-center gap-1.5 text-sm font-medium bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_fix_high</span>
              Auto-Match
            </button>
          }
        />
        <StepIndicator currentPath="/cv/mapping" />

        <div className="mx-6 mt-4 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>description</span>
          {template.templateFileName
            ? <>Mapping into <strong>{template.templateFileName}</strong> ({template.placeholders.length} placeholders found)</>
            : <>This template has no uploaded file yet — showing {template.placeholders.length} placeholders defined in <strong>{template.name}</strong></>}
        </div>

        {autoMatched && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-700 font-medium">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_fix_high</span>
            Auto-match complete — {mappedCount} of {mappings.length} fields mapped. Review and adjust as needed.
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              {(['all', 'mapped', 'unmapped'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                  {f} {f === 'unmapped' ? `(${unmappedCount})` : f === 'mapped' ? `(${mappedCount})` : `(${mappings.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Mapping table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 w-48">Source Field</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Sample Value</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 w-52">Template Placeholder</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 w-24">Confidence</th>
                  <th className="px-5 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${!m.destination ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-5 py-3">
                      <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{m.sourceField}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 max-w-xs truncate">{m.sampleValue}</td>
                    <td className="px-5 py-3">
                      <select
                        value={m.destination}
                        onChange={(e) => updateDest(m.id, e.target.value)}
                        className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">— Ignore Field —</option>
                        {template.placeholders.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      {m.destination ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confidenceBadge(m.confidence)}`}>
                          {confidenceLabel(m.confidence)} {m.confidence}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {m.destination && (
                        <span className="material-symbols-outlined text-success" style={{ fontSize: '16px' }}>check_circle</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save mapping template option */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={saveTemplate} onChange={(e) => setSaveTemplate(e.target.checked)} className="rounded" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Save as mapping template</p>
                <p className="text-xs text-slate-400">Reuse this mapping for future uploads with the same format</p>
              </div>
            </label>
            {saveTemplate && (
              <div className="mt-3 flex gap-3">
                <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name e.g. Japanese Resume Standard"
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pb-6">
            <button onClick={() => navigate('/cv/templates')} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors ${!generating ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              {generating ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>autorenew</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_awesome</span>
                  Generate CV
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
