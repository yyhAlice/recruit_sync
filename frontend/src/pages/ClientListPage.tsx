import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import StatusDot from '../components/StatusDot'
import { clients, getActiveJobsCount } from '../data/mockData'

const industryBadge: Record<string, string> = {
  Technology: 'bg-blue-100 text-blue-700',
  Finance: 'bg-purple-100 text-purple-700',
  Manufacturing: 'bg-teal-100 text-teal-700',
  Trading: 'bg-amber-100 text-amber-700',
}

function daysAgo(dateStr: string): string {
  const ref = new Date('2026-07-01')
  const d = new Date(dateStr)
  const days = Math.floor((ref.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

const industries = ['All Industries', 'Technology', 'Finance', 'Manufacturing', 'Trading']

export default function ClientListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('All Industries')

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase())
    const matchIndustry = industry === 'All Industries' || c.industry === industry
    return matchSearch && matchIndustry
  })

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Clients"
          breadcrumbs={[]}
          actions={
            <button
              disabled
              className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg opacity-60 cursor-not-allowed"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
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
                {filtered.map((client) => {
                  const activeJobs = getActiveJobsCount(client.id)
                  const badgeClass = industryBadge[client.industry] ?? 'bg-slate-100 text-slate-600'
                  return (
                    <tr
                      key={client.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <StatusDot lastActivityDate={client.lastContactDate} />
                          <span className="font-semibold text-slate-800 text-sm">{client.companyName}</span>
                        </div>
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

          {/* Summary footer */}
          <div className="mt-4 text-xs text-slate-400 text-right">
            Showing {filtered.length} of {clients.length} clients
          </div>
        </div>
      </div>
    </div>
  )
}
