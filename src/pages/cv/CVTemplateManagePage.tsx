import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import { cvTemplates as initialTemplates } from '../../data/cvMockData'
import type { CVTemplate, TemplateLanguage } from '../../types/cv'

const LANG_OPTIONS: { value: TemplateLanguage; label: string }[] = [
  { value: 'en',        label: 'English' },
  { value: 'ja',        label: 'Japanese' },
  { value: 'bilingual', label: 'Bilingual EN/JA' },
]

const COLOR_OPTIONS = ['#0c56d0', '#7c3aed', '#dc2626', '#0891b2', '#059669', '#d97706', '#6d28d9', '#be123c']

function langBadge(lang: TemplateLanguage) {
  if (lang === 'ja') return 'bg-red-100 text-red-700'
  if (lang === 'bilingual') return 'bg-purple-100 text-purple-700'
  return 'bg-blue-100 text-blue-700'
}

function langLabel(lang: TemplateLanguage) {
  if (lang === 'ja') return 'JA'
  if (lang === 'bilingual') return 'Bilingual'
  return 'EN'
}

const DEFAULT_PLACEHOLDERS = '{{full_name}}, {{email}}, {{phone}}, {{skills}}, {{experience}}, {{education}}'

const emptyForm = {
  name: '',
  language: 'en' as TemplateLanguage,
  description: '',
  thumbnailColor: '#0c56d0',
  clientName: '',
  fileType: 'docx' as 'docx' | 'pdf',
  templateFileName: '',
  placeholdersInput: DEFAULT_PLACEHOLDERS,
}

function parsePlaceholders(input: string): string[] {
  return input.split(',').map((s) => s.trim()).filter(Boolean)
}

export default function CVTemplateManagePage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<CVTemplate[]>(initialTemplates)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(emptyForm)
  const [editId, setEditId]       = useState<string | null>(null)
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggleActive(id: string) {
    setTemplates((ts) => ts.map((t) => t.id === id ? { ...t, isActive: !t.isActive } : t))
  }

  function deleteTemplate(id: string) {
    setTemplates((ts) => ts.filter((t) => t.id !== id))
  }

  function openEdit(tpl: CVTemplate) {
    setEditId(tpl.id)
    setForm({
      name:              tpl.name,
      language:          tpl.language,
      description:       tpl.description,
      thumbnailColor:    tpl.thumbnailColor,
      clientName:        tpl.clientName ?? '',
      fileType:          tpl.fileType,
      templateFileName:  tpl.templateFileName ?? '',
      placeholdersInput: tpl.placeholders.join(', '),
    })
    setShowForm(true)
    setErrors({})
  }

  function openAdd() {
    setEditId(null)
    setForm(emptyForm)
    setShowForm(true)
    setErrors({})
  }

  function pickTemplateFile(f: File) {
    setForm((prev) => ({ ...prev, templateFileName: f.name, fileType: f.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx' }))
  }

  function removeTemplateFile() {
    setForm((prev) => ({ ...prev, templateFileName: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Template name is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!editId && !form.templateFileName) e.templateFileName = 'Please upload the template file'
    return e
  }

  function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const placeholders = parsePlaceholders(form.placeholdersInput)

    if (editId) {
      setTemplates((ts) => ts.map((t) => t.id === editId ? {
        ...t,
        name:             form.name,
        language:         form.language,
        description:      form.description,
        thumbnailColor:   form.thumbnailColor,
        clientName:       form.clientName || undefined,
        fileType:         form.fileType,
        templateFileName: form.templateFileName || undefined,
        placeholders,
        lastUpdated:      new Date().toISOString().slice(0, 10),
      } : t))
    } else {
      const newTpl: CVTemplate = {
        id:               `tpl-${Date.now()}`,
        name:             form.name,
        language:         form.language,
        description:      form.description,
        thumbnailColor:   form.thumbnailColor,
        clientName:       form.clientName || undefined,
        isActive:         true,
        fileType:         form.fileType,
        templateFileName: form.templateFileName || undefined,
        lastUpdated:      new Date().toISOString().slice(0, 10),
        createdBy:        'Y. Tanaka',
        placeholders,
      }
      setTemplates((ts) => [newTpl, ...ts])
    }
    setShowForm(false)
    setEditId(null)
    setForm(emptyForm)
    setErrors({})
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Manage Templates"
          subtitle={`${templates.length} templates — ${templates.filter((t) => t.isActive).length} active`}
          actions={
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/candidates')} className="text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                ← Candidates
              </button>
              <button onClick={openAdd} className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                New Template
              </button>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Add/Edit form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800">{editId ? 'Edit Template' : 'New Template'}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Template Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Agency Standard Resume"
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.name ? 'border-red-300' : 'border-slate-200'}`} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Language</label>
                  <select value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value as TemplateLanguage }))}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {LANG_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Description <span className="text-red-400">*</span></label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2} placeholder="Describe this template's purpose and use case…"
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none ${errors.description ? 'border-red-300' : 'border-slate-200'}`} />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Client Name <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input type="text" value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                    placeholder="e.g. Nexus Systems K.K."
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                    Template File {!editId && <span className="text-red-400">*</span>}
                    <span className="text-slate-400 font-normal"> (the actual .docx/.pdf document used to generate CVs)</span>
                  </label>
                  <input ref={fileInputRef} type="file" accept=".docx,.doc,.pdf" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) pickTemplateFile(f) }} />
                  {!form.templateFileName ? (
                    <div onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-colors ${errors.templateFileName ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-primary/40 hover:bg-slate-50'}`}>
                      <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '24px' }}>upload_file</span>
                      <span className="text-sm text-slate-500">Click to upload the template document</span>
                    </div>
                  ) : (
                    <div className="border border-green-200 bg-green-50 rounded-xl p-3 flex items-center gap-3">
                      <span className="material-symbols-outlined text-success" style={{ fontSize: '22px' }}>description</span>
                      <span className="flex-1 text-sm font-medium text-slate-700 truncate">{form.templateFileName}</span>
                      <button type="button" onClick={removeTemplateFile} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                      </button>
                    </div>
                  )}
                  {errors.templateFileName && <p className="text-xs text-red-500 mt-1">{errors.templateFileName}</p>}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                    Merge Field Placeholders
                    <span className="text-slate-400 font-normal"> (comma-separated tokens found inside the document, e.g. {'{{full_name}}'})</span>
                  </label>
                  <input type="text" value={form.placeholdersInput} onChange={(e) => setForm((f) => ({ ...f, placeholdersInput: e.target.value }))}
                    placeholder="{{full_name}}, {{email}}, {{skills}}"
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  {parsePlaceholders(form.placeholdersInput).length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No placeholders — this template won't have any fields to map in the CV wizard.</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-2 block">Theme Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map((c) => (
                      <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, thumbnailColor: c }))}
                        className={`w-8 h-8 rounded-lg transition-all ${form.thumbnailColor === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
                <button onClick={() => setShowForm(false)} className="text-sm font-medium text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
                  {editId ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </div>
          )}

          {/* Template list */}
          <div className="grid grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden flex ${tpl.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
                {/* Color stripe */}
                <div className="w-14 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: tpl.thumbnailColor }}>
                  <span className="material-symbols-outlined text-white opacity-50" style={{ fontSize: '24px' }}>description</span>
                </div>
                {/* Info */}
                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{tpl.name}</p>
                      {tpl.clientName && <p className="text-xs text-client-purple">{tpl.clientName}</p>}
                    </div>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${langBadge(tpl.language)}`}>{langLabel(tpl.language)}</span>
                    {!tpl.isActive && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 flex-shrink-0">Inactive</span>}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 mb-2">{tpl.description}</p>
                  {tpl.templateFileName ? (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>attach_file</span>
                      <span className="truncate">{tpl.templateFileName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-amber-600 mb-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>warning</span>
                      <span>No template file uploaded</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span>{tpl.fileType.toUpperCase()}</span>
                    <span>·</span>
                    <span>{tpl.placeholders.length} placeholders</span>
                    <span>·</span>
                    <span>Updated {tpl.lastUpdated}</span>
                    <span>·</span>
                    <span>{tpl.createdBy}</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-col gap-1 p-3 justify-center border-l border-slate-50">
                  <button onClick={() => openEdit(tpl)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                  </button>
                  <button onClick={() => toggleActive(tpl.id)} title={tpl.isActive ? 'Deactivate' : 'Activate'}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{tpl.isActive ? 'toggle_on' : 'toggle_off'}</span>
                  </button>
                  <button onClick={() => deleteTemplate(tpl.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-danger transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-4xl block mb-2">description</span>
              <p className="text-sm font-medium">No templates yet</p>
              <p className="text-xs mt-1">Click "New Template" to create the first one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
