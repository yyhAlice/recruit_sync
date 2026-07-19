import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import StepIndicator from '../../components/cv/StepIndicator'
import { useCVContext } from '../../context/CVContext'
import { exampleParsedCandidate } from '../../data/cvMockData'
import { jobs, clients, recruiters } from '../../data/mockData'
import type { ParsedCandidate, WorkExperience, Education, CVLanguage, Certification } from '../../types/cv'

const LANG_LEVELS = ['native', 'fluent', 'business', 'conversational', 'basic'] as const

function uid() { return `id-${Date.now()}-${Math.random().toString(36).slice(2)}` }

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
      <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>{icon}</span>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', multiline = false }: {
  label: string; value: string | number; onChange: (v: string) => void
  type?: string; multiline?: boolean
}) {
  const cls = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white'
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1 block">{label}</label>
      {multiline
        ? <textarea rows={3} value={String(value)} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-none`} />
        : <input type={type} value={String(value)} onChange={(e) => onChange(e.target.value)} className={cls} />}
    </div>
  )
}

export default function CVReviewPage() {
  const navigate = useNavigate()
  const { session, updateSession } = useCVContext()
  const [data, setData] = useState<ParsedCandidate>(session.parsedData ?? exampleParsedCandidate)
  const [unsaved, setUnsaved] = useState(false)
  const [expandedExp, setExpandedExp] = useState<string | null>(null)
  const [jobId, setJobId] = useState(session.jobId)
  const [recruiterId, setRecruiterId] = useState(session.recruiterId)
  const [formError, setFormError] = useState('')

  useEffect(() => { setUnsaved(true) }, [data])

  function patch<K extends keyof ParsedCandidate>(key: K, val: ParsedCandidate[K]) {
    setData((d) => ({ ...d, [key]: val }))
  }

  function resolveConflict(field: string, choice: 'file1' | 'file2') {
    const conflict = data.conflicts.find((c) => c.field === field)
    if (!conflict) return
    const resolved = { ...conflict, selected: choice }
    const value    = choice === 'file1' ? conflict.file1Value : conflict.file2Value
    setData((d) => ({
      ...d,
      [field]: value,
      conflicts: d.conflicts.map((c) => c.field === field ? resolved : c),
    }))
  }

  const [newSkill, setNewSkill] = useState('')
  function addSkill() {
    if (!newSkill.trim()) return
    patch('skills', [...data.skills, newSkill.trim()])
    setNewSkill('')
  }
  function removeSkill(s: string) { patch('skills', data.skills.filter((sk) => sk !== s)) }

  function updateExp(id: string, field: keyof WorkExperience, val: string | boolean | string[]) {
    patch('workExperience', data.workExperience.map((e) => e.id === id ? { ...e, [field]: val } : e))
  }
  function addExp() {
    const newE: WorkExperience = { id: uid(), company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: '', responsibilities: '', technologies: [] }
    patch('workExperience', [newE, ...data.workExperience])
    setExpandedExp(newE.id)
  }
  function removeExp(id: string) { patch('workExperience', data.workExperience.filter((e) => e.id !== id)) }

  function updateEdu(id: string, field: keyof Education, val: string) {
    patch('education', data.education.map((e) => e.id === id ? { ...e, [field]: val } : e))
  }
  function addEdu() {
    patch('education', [...data.education, { id: uid(), institution: '', degree: '', major: '', graduationYear: '' }])
  }
  function removeEdu(id: string) { patch('education', data.education.filter((e) => e.id !== id)) }

  function updateLang(id: string, field: keyof CVLanguage, val: string) {
    patch('languages', data.languages.map((l) => l.id === id ? { ...l, [field]: val } : l))
  }
  function addLang() {
    patch('languages', [...data.languages, { id: uid(), language: '', level: 'conversational' }])
  }
  function removeLang(id: string) { patch('languages', data.languages.filter((l) => l.id !== id)) }

  function updateCert(id: string, field: keyof Certification, val: string) {
    patch('certifications', data.certifications.map((c) => c.id === id ? { ...c, [field]: val } : c))
  }
  function addCert() {
    patch('certifications', [...data.certifications, { id: uid(), name: '', organization: '', date: '' }])
  }
  function removeCert(id: string) { patch('certifications', data.certifications.filter((c) => c.id !== id)) }

  function handleSaveDraft() {
    updateSession({ parsedData: data })
    setUnsaved(false)
  }

  function handleContinue() {
    if (!data.fullName.trim()) { setFormError('Name is required'); return }
    if (!jobId) { setFormError('Please select a job'); return }
    if (!recruiterId) { setFormError('Please select a recruiter'); return }
    setFormError('')
    updateSession({ parsedData: data, jobId, recruiterId })
    navigate('/cv/templates')
  }

  const unresolvedConflicts = data.conflicts.filter((c) => c.selected === null)

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Review Parsed Data"
          subtitle="Step 2 of 5 — Verify and edit extracted information"
          actions={
            <div className="flex items-center gap-2">
              {unsaved && <span className="text-xs text-warning font-medium flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>Unsaved changes</span>}
              <button onClick={handleSaveDraft} className="text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">Save Draft</button>
            </div>
          }
        />
        <StepIndicator currentPath="/cv/review" />

        {/* Conflict alerts */}
        {unresolvedConflicts.length > 0 && (
          <div className="mx-6 mt-4 space-y-2">
            {unresolvedConflicts.map((c) => (
              <div key={String(c.field)} className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="material-symbols-outlined text-warning mt-0.5" style={{ fontSize: '16px' }}>warning</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-800">{c.label} conflict detected</p>
                  <p className="text-xs text-amber-700 mt-0.5">File 1: <strong>{c.file1Value}</strong> · File 2: <strong>{c.file2Value}</strong></p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => resolveConflict(String(c.field), 'file1')} className="text-xs font-semibold px-2.5 py-1 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50">Use File 1</button>
                  <button onClick={() => resolveConflict(String(c.field), 'file2')} className="text-xs font-semibold px-2.5 py-1 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50">Use File 2</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {formError && (
            <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
          )}

          {/* Assignment */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <SectionHeader icon="assignment_ind" title="Assignment" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Applying For *</label>
                <select value={jobId} onChange={(e) => setJobId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select job…</option>
                  {jobs.filter((j) => j.status === 'active').map((j) => {
                    const c = clients.find((cl) => cl.id === j.clientId)
                    return <option key={j.id} value={j.id}>{j.title} — {c?.companyName}</option>
                  })}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Recruiter *</label>
                <select value={recruiterId} onChange={(e) => setRecruiterId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select recruiter…</option>
                  {recruiters.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <SectionHeader icon="person" title="Personal Information" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name"       value={data.fullName}       onChange={(v) => patch('fullName', v)} />
              <Field label="Email"           value={data.email}          onChange={(v) => patch('email', v)} type="email" />
              <Field label="Phone"           value={data.phone}          onChange={(v) => patch('phone', v)} />
              <Field label="Current Location" value={data.currentLocation} onChange={(v) => patch('currentLocation', v)} />
              <Field label="Address"         value={data.address}        onChange={(v) => patch('address', v)} />
              <Field label="Date of Birth"   value={data.dateOfBirth}    onChange={(v) => patch('dateOfBirth', v)} type="date" />
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <SectionHeader icon="work_history" title="Professional Summary" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Current Job Title"    value={data.currentJobTitle}    onChange={(v) => patch('currentJobTitle', v)} />
              <Field label="Desired Role"         value={data.desiredRole}        onChange={(v) => patch('desiredRole', v)} />
              <Field label="Total Experience (yrs)" value={data.totalExperienceYears} onChange={(v) => patch('totalExperienceYears', Number(v))} type="number" />
              <Field label="Availability"         value={data.availability}       onChange={(v) => patch('availability', v)} />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <SectionHeader icon="construction" title="Skills" />
            <div className="flex flex-wrap gap-2 mb-3">
              {data.skills.map((s) => (
                <span key={s} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                  {s}
                  <button onClick={() => removeSkill(s)} className="ml-0.5 hover:text-danger"><span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                placeholder="Add skill and press Enter"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={addSkill} className="text-sm font-medium bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors">Add</button>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>business_center</span>
                <h3 className="text-sm font-bold text-slate-800">Work Experience</h3>
              </div>
              <button onClick={addExp} className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>Add
              </button>
            </div>
            <div className="space-y-3">
              {data.workExperience.map((exp) => (
                <div key={exp.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer" onClick={() => setExpandedExp(expandedExp === exp.id ? null : exp.id)}>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{exp.position || 'New Position'}</p>
                      <p className="text-xs text-slate-400">{exp.company || 'Company'}{exp.isCurrent ? ' · Current' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); removeExp(exp.id) }} className="text-xs text-danger hover:bg-red-50 p-1 rounded">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                      </button>
                      <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>
                        {expandedExp === exp.id ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>
                  </div>
                  {expandedExp === exp.id && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Company"  value={exp.company}  onChange={(v) => updateExp(exp.id, 'company', v)} />
                        <Field label="Position" value={exp.position} onChange={(v) => updateExp(exp.id, 'position', v)} />
                        <Field label="Start Date (YYYY-MM)" value={exp.startDate} onChange={(v) => updateExp(exp.id, 'startDate', v)} />
                        <div>
                          <Field label="End Date (YYYY-MM)" value={exp.endDate} onChange={(v) => updateExp(exp.id, 'endDate', v)} />
                          <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                            <input type="checkbox" checked={exp.isCurrent} onChange={(e) => updateExp(exp.id, 'isCurrent', e.target.checked)} className="rounded" />
                            <span className="text-xs text-slate-500">Current job</span>
                          </label>
                        </div>
                      </div>
                      <Field label="Description" value={exp.description} onChange={(v) => updateExp(exp.id, 'description', v)} multiline />
                      <Field label="Responsibilities" value={exp.responsibilities} onChange={(v) => updateExp(exp.id, 'responsibilities', v)} multiline />
                      <Field label="Technologies (comma-separated)" value={exp.technologies.join(', ')} onChange={(v) => updateExp(exp.id, 'technologies', v.split(',').map((s) => s.trim()).filter(Boolean))} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>school</span>
                <h3 className="text-sm font-bold text-slate-800">Education</h3>
              </div>
              <button onClick={addEdu} className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>Add
              </button>
            </div>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="grid grid-cols-4 gap-3 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  <Field label="Institution" value={edu.institution} onChange={(v) => updateEdu(edu.id, 'institution', v)} />
                  <Field label="Degree"      value={edu.degree}      onChange={(v) => updateEdu(edu.id, 'degree', v)} />
                  <Field label="Major"       value={edu.major}       onChange={(v) => updateEdu(edu.id, 'major', v)} />
                  <div className="flex gap-2 items-end">
                    <Field label="Grad. Year" value={edu.graduationYear} onChange={(v) => updateEdu(edu.id, 'graduationYear', v)} />
                    <button onClick={() => removeEdu(edu.id)} className="mb-0 pb-2 text-danger hover:opacity-70">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>translate</span>
                <h3 className="text-sm font-bold text-slate-800">Languages</h3>
              </div>
              <button onClick={addLang} className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>Add
              </button>
            </div>
            <div className="space-y-2">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex items-center gap-3">
                  <input type="text" value={lang.language} onChange={(e) => updateLang(lang.id, 'language', e.target.value)}
                    placeholder="Language" className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <select value={lang.level} onChange={(e) => updateLang(lang.id, 'level', e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 capitalize">
                    {LANG_LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                  </select>
                  <button onClick={() => removeLang(lang.id)} className="text-danger hover:opacity-70">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>workspace_premium</span>
                <h3 className="text-sm font-bold text-slate-800">Certifications</h3>
              </div>
              <button onClick={addCert} className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>Add
              </button>
            </div>
            <div className="space-y-2">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="flex items-center gap-3">
                  <input type="text" value={cert.name} onChange={(e) => updateCert(cert.id, 'name', e.target.value)} placeholder="Certification name" className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input type="text" value={cert.organization} onChange={(e) => updateCert(cert.id, 'organization', e.target.value)} placeholder="Issuing org" className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input type="month" value={cert.date} onChange={(e) => updateCert(cert.id, 'date', e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={() => removeCert(cert.id)} className="text-danger hover:opacity-70">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2 pb-6">
            <button onClick={() => navigate('/cv/upload')} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>Back
            </button>
            <div className="flex gap-3">
              <button onClick={handleSaveDraft} className="text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">Save Draft</button>
              <button onClick={handleContinue} className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                Continue to Template Selection
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
