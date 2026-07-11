import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import { clients } from '../data/mockData'

interface FileItem {
  id: string
  name: string
  type: 'pdf' | 'docx' | 'xlsx'
  size: string
  uploadedBy: string
  uploadedAt: string
  category: 'CV' | 'Contract' | 'JD' | 'Report'
}

interface ClientFolder {
  clientId: string
  files: FileItem[]
}

const fileData: ClientFolder[] = [
  {
    clientId: 'c1',
    files: [
      { id: 'f1', name: 'CV_Kim_Jae-won.pdf',           type: 'pdf',  size: '88 KB',  uploadedBy: 'Y. Tanaka',   uploadedAt: '2026-06-20', category: 'CV' },
      { id: 'f2', name: 'CV_Aung_Aung.pdf',             type: 'pdf',  size: '102 KB', uploadedBy: 'J. Park',     uploadedAt: '2026-06-22', category: 'CV' },
      { id: 'f3', name: 'JD_Senior_Java_Engineer.docx', type: 'docx', size: '38 KB',  uploadedBy: 'H. Yamamoto', uploadedAt: '2026-06-01', category: 'JD' },
      { id: 'f4', name: 'Contract_Chen_Li_Placed.pdf',  type: 'pdf',  size: '230 KB', uploadedBy: 'Y. Tanaka',   uploadedAt: '2026-06-12', category: 'Contract' },
    ],
  },
  {
    clientId: 'c2',
    files: [
      { id: 'f5', name: 'CV_Zhou_Xuan.pdf',             type: 'pdf',  size: '115 KB', uploadedBy: 'J. Park',     uploadedAt: '2026-06-25', category: 'CV' },
      { id: 'f6', name: 'CV_Wang_Fang.pdf',             type: 'pdf',  size: '88 KB',  uploadedBy: 'Y. Tanaka',   uploadedAt: '2026-06-28', category: 'CV' },
      { id: 'f7', name: 'JD_Risk_Manager_v2.docx',      type: 'docx', size: '45 KB',  uploadedBy: 'H. Yamamoto', uploadedAt: '2026-06-05', category: 'JD' },
      { id: 'f8', name: 'Offer_Letter_Wang_Fang.pdf',   type: 'pdf',  size: '185 KB', uploadedBy: 'Y. Tanaka',   uploadedAt: '2026-06-28', category: 'Contract' },
    ],
  },
  {
    clientId: 'c3',
    files: [
      { id: 'f9',  name: 'CV_Yoshida_Sota.pdf',         type: 'pdf',  size: '145 KB', uploadedBy: 'Y. Tanaka',   uploadedAt: '2026-06-20', category: 'CV' },
      { id: 'f10', name: 'CV_David_Kim.pdf',            type: 'pdf',  size: '99 KB',  uploadedBy: 'H. Yamamoto', uploadedAt: '2026-06-25', category: 'CV' },
      { id: 'f11', name: 'JD_Cloud_Infra_Engineer.docx', type: 'docx', size: '44 KB', uploadedBy: 'H. Yamamoto', uploadedAt: '2026-05-15', category: 'JD' },
    ],
  },
  {
    clientId: 'c4',
    files: [
      { id: 'f12', name: 'CV_Chen_Yang.pdf',            type: 'pdf',  size: '105 KB', uploadedBy: 'H. Yamamoto', uploadedAt: '2026-06-22', category: 'CV' },
      { id: 'f13', name: 'JD_Business_Analyst.docx',    type: 'docx', size: '39 KB',  uploadedBy: 'Y. Tanaka',   uploadedAt: '2026-06-01', category: 'JD' },
      { id: 'f14', name: 'Offer_Letter_Chen_Yang.pdf',  type: 'pdf',  size: '178 KB', uploadedBy: 'H. Yamamoto', uploadedAt: '2026-06-29', category: 'Contract' },
    ],
  },
  {
    clientId: 'c5',
    files: [
      { id: 'f15', name: 'CV_Isabella_Costa.pdf',       type: 'pdf',  size: '132 KB', uploadedBy: 'J. Park',     uploadedAt: '2026-06-20', category: 'CV' },
      { id: 'f16', name: 'CV_Chloe_Vanderbilt.pdf',     type: 'pdf',  size: '118 KB', uploadedBy: 'H. Yamamoto', uploadedAt: '2026-06-18', category: 'CV' },
      { id: 'f17', name: 'JD_AI_Engineer.docx',         type: 'docx', size: '58 KB',  uploadedBy: 'Y. Tanaka',   uploadedAt: '2026-05-20', category: 'JD' },
      { id: 'f18', name: 'SoftBank_Q2_Pipeline.xlsx',   type: 'xlsx', size: '74 KB',  uploadedBy: 'Y. Tanaka',   uploadedAt: '2026-07-01', category: 'Report' },
    ],
  },
]

const fileTypeIcon: Record<string, string> = { pdf: 'picture_as_pdf', docx: 'description', xlsx: 'table_chart' }
const fileTypeColor: Record<string, string> = { pdf: 'text-red-500', docx: 'text-blue-500', xlsx: 'text-green-600' }
const categoryBadge: Record<string, string> = {
  CV:       'bg-blue-50 text-blue-700',
  Contract: 'bg-green-50 text-green-700',
  JD:       'bg-purple-50 text-purple-700',
  Report:   'bg-amber-50 text-amber-700',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function FileWorkspacePage() {
  const navigate = useNavigate()
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [search, setSearch] = useState('')

  const currentFolder = fileData.find((f) => f.clientId === selectedClient)
  const currentClient = clients.find((c) => c.id === selectedClient)

  const visibleFiles = (currentFolder?.files ?? []).filter((f) => {
    const q = search.toLowerCase()
    return (
      (categoryFilter === 'All' || f.category === categoryFilter) &&
      f.name.toLowerCase().includes(q)
    )
  })

  const totalFiles = fileData.reduce((sum, f) => sum + f.files.length, 0)

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="File Workspace"
          subtitle={`${totalFiles} files across ${clients.length} clients`}
          actions={
            <button disabled className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg opacity-60 cursor-not-allowed">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
              Upload File
            </button>
          }
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Client folder list */}
          <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Folders</div>
            </div>
            <div className="p-2">
              {clients.map((client) => {
                const folder = fileData.find((f) => f.clientId === client.id)
                const count  = folder?.files.length ?? 0
                const active = selectedClient === client.id
                return (
                  <button
                    key={client.id}
                    onClick={() => { setSelectedClient(client.id); setSearch(''); setCategoryFilter('All') }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left mb-0.5 transition-colors ${
                      active ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`material-symbols-outlined ${active ? 'text-primary' : 'text-slate-300'}`} style={{ fontSize: '20px' }}>
                      {active ? 'folder_open' : 'folder'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold truncate ${active ? 'text-primary' : 'text-slate-700'}`}>
                        {client.companyName}
                      </div>
                      <div className="text-xs text-slate-400">{count} files</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: File list */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedClient ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <span className="material-symbols-outlined text-6xl text-slate-200">folder_open</span>
                <p className="text-sm">Select a client folder to view files</p>
              </div>
            ) : (
              <>
                {/* Toolbar */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '16px' }}>folder</span>
                    <span className="font-medium text-slate-700">{currentClient?.companyName}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }}>search</span>
                      <input type="text" placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-44" />
                    </div>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {['All', 'CV', 'JD', 'Contract', 'Report'].map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <button onClick={() => navigate(`/clients/${selectedClient}`)} className="text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg">
                      Client Detail
                    </button>
                  </div>
                </div>

                {/* Files */}
                <div className="flex-1 overflow-y-auto p-5">
                  {visibleFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm gap-2">
                      <span className="material-symbols-outlined text-4xl text-slate-200">search_off</span>
                      No files found
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">File</th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Category</th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Size</th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Uploaded By</th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Date</th>
                            <th className="px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody>
                          {visibleFiles.map((file) => (
                            <tr key={file.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2.5">
                                  <span className={`material-symbols-outlined ${fileTypeColor[file.type]}`} style={{ fontSize: '20px' }}>
                                    {fileTypeIcon[file.type]}
                                  </span>
                                  <span className="font-medium text-slate-700 text-xs">{file.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryBadge[file.category]}`}>
                                  {file.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500 font-mono">{file.size}</td>
                              <td className="px-4 py-3 text-xs text-slate-500">{file.uploadedBy}</td>
                              <td className="px-4 py-3 text-xs text-slate-500">{formatDate(file.uploadedAt)}</td>
                              <td className="px-4 py-3">
                                <button disabled className="text-xs font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-lg opacity-50 cursor-not-allowed">
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
