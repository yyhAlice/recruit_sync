import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import { clients as baseClients, getActiveJobsCount } from '../data/mockData'
import type { Client } from '../types'
import { TODAY } from '../utils/format'

const industryBadge: Record<string, string> = {
  Technology: 'bg-blue-100 text-blue-700',
  Finance: 'bg-purple-100 text-purple-700',
  Manufacturing: 'bg-teal-100 text-teal-700',
  Trading: 'bg-amber-100 text-amber-700',
}

function daysAgo(dateStr: string): string {
  const ref = new Date(TODAY)
  const d = new Date(dateStr)
  const days = Math.floor((ref.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

const PAGE_SIZE = 10

const INDUSTRY_OPTIONS = ['Technology', 'Finance', 'Manufacturing', 'Trading']
const industries = ['All Industries', ...INDUSTRY_OPTIONS]

const BLANK_CLIENT = {
  companyName: '', contactPerson: '', email: '', phone: '',
  industry: 'Technology', address: '', website: '', notes: '',
}

function AddClientModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Client) => void }) {
  const [form, setForm] = useState(BLANK_CLIENT)
  const [error, setError] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (e.target === overlayRef.current) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  function submit() {
    if (!form.companyName.trim()) { setError('Company name is required'); return }
    if (!form.contactPerson.trim()) { setError('Contact person is required'); return }
    const newClient: Client = {
      id: `client-new-${Date.now()}`,
      lastContactDate: TODAY,
      ...form,
    }
    onAdd(newClient)
    onClose()
  }

  const set = (k: keyof typeof BLANK_CLIENT) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Add Client</h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Name *</label>
              <input value={form.companyName} onChange={set('companyName')} placeholder="Acme Corp" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Contact Person *</label>
              <input value={form.contactPerson} onChange={set('contactPerson')} placeholder="Taro Yamamoto" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Industry</label>
              <select value={form.industry} onChange={set('industry')} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                {INDUSTRY_OPTIONS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
              <input value={form.email} onChange={set('email')} type="email" placeholder="contact@acme.jp" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+81-3-0000-0000" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Website</label>
              <input value={form.website} onChange={set('website')} placeholder="https://acme.jp" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Address</label>
              <input value={form.address} onChange={set('address')} placeholder="Shibuya, Tokyo" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</label>
              <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Any relevant notes..." className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="text-sm font-medium text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={submit} className="text-sm font-semibold text-white bg-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">Add Client</button>
        </div>
      </div>
    </div>
  )
}

export default function ClientListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('All Industries')
  const [showModal, setShowModal] = useState(false)
  const [localClients, setLocalClients] = useState<Client[]>([])
  const [page, setPage] = useState(1)

  const clients = [...baseClients, ...localClients]

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase())
    const matchIndustry = industry === 'All Industries' || c.industry === industry
    return matchSearch && matchIndustry
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSearchChange(v: string) { setSearch(v); setPage(1) }
  function handleIndustryChange(v: string) { setIndustry(v); setPage(1) }

  return (
    <>
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Clients"
          breadcrumbs={[]}
          actions={
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>add</span>
              Add Client
            </button>
          }
        />

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200">
          <div className="relative flex-1 max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '16px' }}>search</span>
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select
            value={industry}
            onChange={(e) => handleIndustryChange(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white text-slate-700"
          >
            {industries.map((ind) => (
              <option key={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Company</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Contact Person</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Industry</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Active Jobs</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Last Contact</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((client) => {
                  const activeJobs = getActiveJobsCount(client.id)
                  const badgeClass = industryBadge[client.industry] ?? 'bg-slate-100 text-slate-600'
                  return (
                    <tr
                      key={client.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800 text-sm">{client.companyName}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{client.contactPerson}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
                          {client.industry}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold text-slate-700">{activeJobs}</span>
                        <span className="text-xs text-slate-400 ml-1">jobs</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">
                        {daysAgo(client.lastContactDate)}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="text-xs font-medium text-primary hover:text-primary-dark bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                      No clients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={currentPage} pageSize={PAGE_SIZE} totalItems={filtered.length} onChange={setPage} />
        </div>
      </div>
    </div>
    {showModal && (
      <AddClientModal
        onClose={() => setShowModal(false)}
        onAdd={(c) => setLocalClients((prev) => [c, ...prev])}
      />
    )}
  </>
  )
}
