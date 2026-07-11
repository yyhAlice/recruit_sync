import { useState, useMemo } from 'react'
import {
  Search, Upload, FolderPlus, ChevronRight,
  Building2, Briefcase, User, Clock, FolderOpen,
  Trash2, ArrowDownAZ, History,
  FileText, type LucideIcon,
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import FolderCard from '../../components/workspace/FolderCard'
import FileTable from '../../components/workspace/FileTable'
import WsBreadcrumb from '../../components/workspace/WsBreadcrumb'
import UploadDialog from '../../components/workspace/UploadDialog'
import FolderDialog from '../../components/workspace/FolderDialog'
import MoveDialog from '../../components/workspace/MoveDialog'
import ConfirmDialog from '../../components/workspace/ConfirmDialog'
import EmptyState from '../../components/workspace/EmptyState'
import { useWorkspace } from '../../context/WorkspaceContext'
import { clients, jobs, candidates } from '../../data/mockData'
import { clientWsId, jobWsId, candidateWsId } from '../../data/workspaceMockData'
import type { WsFolder, WsFile, WsFileType } from '../../types/workspace'

// ─── Types ──────────────────────────────────────────────────────────────────────
type Category = 'clients' | 'jobs' | 'candidates' | 'recent'
type SortBy   = 'name' | 'updated'
type RenameTarget = { kind: 'file'; item: WsFile } | { kind: 'folder'; item: WsFolder }
type DeleteTarget = { kind: 'file'; item: WsFile } | { kind: 'folder'; item: WsFolder }
type MoveTarget   = { kind: 'file'; item: WsFile } | { kind: 'folder'; item: WsFolder }

// ─── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(diff / 86400000)
  if (days === 1) return 'yesterday'
  if (days < 7)  return `${days}d ago`
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Workspace Left Nav ─────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Category; label: string; icon: LucideIcon; count?: number }[] = [
  { id: 'clients',    label: 'Clients',    icon: Building2 },
  { id: 'jobs',       label: 'Jobs',       icon: Briefcase },
  { id: 'candidates', label: 'Candidates', icon: User },
]
const NAV_EXTRA: { id: Category; label: string; icon: LucideIcon }[] = [
  { id: 'recent', label: 'Recent',  icon: Clock },
]
const FUTURE_ITEMS = ['Trash', 'Shared Folders', 'Permissions']

function WsLeftNav({
  selected, onChange, counts,
}: { selected: Category; onChange: (c: Category) => void; counts: Record<string, number> }) {
  return (
    <div className="w-44 flex-shrink-0 flex flex-col border-r border-slate-100 bg-slate-50/80 overflow-y-auto">
      <div className="px-4 pt-5 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Workspaces</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => onChange(id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${selected === id ? 'bg-white text-primary font-semibold shadow-sm border border-slate-100' : 'text-slate-600 hover:bg-white hover:text-slate-800'}`}>
              <Icon size={14} className={selected === id ? 'text-primary' : 'text-slate-400'} />
              <span className="flex-1 text-left">{label}</span>
              <span className={`text-xs font-semibold ${selected === id ? 'text-primary' : 'text-slate-400'}`}>{counts[id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-slate-100">
        <div className="space-y-0.5">
          {NAV_EXTRA.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => onChange(id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${selected === id ? 'bg-white text-primary font-semibold shadow-sm border border-slate-100' : 'text-slate-600 hover:bg-white hover:text-slate-800'}`}>
              <Icon size={14} className={selected === id ? 'text-primary' : 'text-slate-400'} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-slate-100 mt-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">Coming Soon</p>
        <div className="space-y-0.5">
          {FUTURE_ITEMS.map((label) => (
            <div key={label} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg opacity-40 cursor-not-allowed">
              <Trash2 size={13} className="text-slate-400" />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Center Panel ───────────────────────────────────────────────────────────────
interface EntityRow { id: string; name: string; subtitle: string; lastUpdated: string; icon: LucideIcon }

function CenterPanel({
  category, rows, selectedId, onSelect, search, onSearch, sortBy, onSort,
}: {
  category: Category
  rows: EntityRow[]
  selectedId: string | null
  onSelect: (id: string) => void
  search: string
  onSearch: (q: string) => void
  sortBy: SortBy
  onSort: (s: SortBy) => void
}) {
  const title = category === 'clients' ? 'Clients' : category === 'jobs' ? 'Jobs' : category === 'candidates' ? 'Candidates' : 'Recent Files'

  return (
    <div className="w-64 flex-shrink-0 flex flex-col border-r border-slate-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full font-medium">{rows.length}</span>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 mb-2">
          <Search size={12} className="text-slate-400 flex-shrink-0" />
          <input type="text" value={search} onChange={(e) => onSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}…`}
            className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400 min-w-0" />
          {search && (
            <button onClick={() => onSearch('')} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>
        {/* Sort */}
        <div className="flex gap-1">
          {([['name', 'A–Z', ArrowDownAZ], ['updated', 'Recent', History]] as const).map(([val, lbl, Icon]) => (
            <button key={val} onClick={() => onSort(val)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${sortBy === val ? 'bg-primary/8 text-primary' : 'text-slate-400 hover:bg-slate-100'}`}>
              <Icon size={11} />
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Entity list */}
      <div className="flex-1 overflow-y-auto py-1">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <FolderOpen size={28} className="text-slate-200 mb-2" />
            <p className="text-xs text-slate-400">No results found</p>
          </div>
        ) : (
          rows.map((row) => (
            <button key={row.id} onClick={() => onSelect(row.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-50 last:border-0 group ${selectedId === row.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-slate-50 border-l-2 border-l-transparent'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedId === row.id ? 'bg-primary/10' : 'bg-slate-100'}`}>
                <row.icon size={14} className={selectedId === row.id ? 'text-primary' : 'text-slate-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${selectedId === row.id ? 'text-primary' : 'text-slate-700'}`}>{row.name}</p>
                <p className="text-xs text-slate-400 truncate">{row.subtitle}</p>
              </div>
              <ChevronRight size={12} className={`flex-shrink-0 transition-colors ${selectedId === row.id ? 'text-primary' : 'text-slate-300 group-hover:text-slate-400'}`} />
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Recent Files Widget ─────────────────────────────────────────────────────────
function RecentFilesWidget({ files, allFolders }: { files: { file: WsFile; entityName: string }[]; allFolders: WsFolder[] }) {
  if (files.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Clock size={40} className="text-slate-200 mb-3" />
      <p className="text-sm font-medium text-slate-500">No recent files</p>
      <p className="text-xs text-slate-400 mt-1">Files you upload will appear here</p>
    </div>
  )
  return (
    <div className="p-6">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Clock size={14} className="text-slate-400" />
        Recent Files
      </h3>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['File', 'Workspace', 'Uploaded', 'Size'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {files.map(({ file, entityName }) => (
              <tr key={file.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-700 truncate max-w-48">{file.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500 truncate max-w-32">{entityName}</td>
                <td className="px-4 py-2.5 text-xs text-slate-400 whitespace-nowrap">{timeAgo(file.uploadedAt)}</td>
                <td className="px-4 py-2.5 text-xs text-slate-400 whitespace-nowrap">{formatSize(file.size)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── No Selection Placeholder ────────────────────────────────────────────────────
function NoSelection({ category }: { category: Category }) {
  const label = category === 'clients' ? 'client' : category === 'jobs' ? 'job' : category === 'candidates' ? 'candidate' : 'workspace'
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
        <FolderOpen size={28} className="text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-slate-500">Select a {label}</p>
      <p className="text-xs text-slate-400 mt-1 max-w-48">Click any {label} in the list to explore its workspace files and folders</p>
    </div>
  )
}

// ─── Right Panel (Workspace Content) ────────────────────────────────────────────
interface RightPanelProps {
  entity: { name: string; subtitle: string; icon: LucideIcon }
  workspaceId: string
  currentFolderId: string | null
  onFolderOpen: (id: string) => void
  onFolderClose: () => void
  onUpload: () => void
  onNewFolder: () => void
  onRenameFolder: (f: WsFolder) => void
  onDeleteFolder: (f: WsFolder) => void
  onMoveFolder: (f: WsFolder) => void
  onRenameFile: (f: WsFile) => void
  onDeleteFile: (f: WsFile) => void
  onMoveFile: (f: WsFile) => void
  onDownload: (f: WsFile) => void
  contentSearch: string
  onContentSearch: (q: string) => void
}

function RightPanel({
  entity, workspaceId, currentFolderId,
  onFolderOpen, onFolderClose,
  onUpload, onNewFolder,
  onRenameFolder, onDeleteFolder, onMoveFolder,
  onRenameFile, onDeleteFile, onMoveFile, onDownload,
  contentSearch, onContentSearch,
}: RightPanelProps) {
  const { getFoldersByWorkspace, getFilesByFolder, countFiles, folders: allFolders } = useWorkspace()

  const rootFolders   = getFoldersByWorkspace(workspaceId, null)
  const currentFolder = allFolders.find((f) => f.id === currentFolderId) ?? null
  const currentFiles  = currentFolderId ? getFilesByFolder(currentFolderId) : []

  // Content search
  const { search } = useWorkspace()
  const searchResults = useMemo(() => {
    if (!contentSearch.trim()) return null
    return search(workspaceId, contentSearch)
  }, [contentSearch, workspaceId, search])

  // Last updated
  const lastUpdatedStr = useMemo(() => {
    const ws_folders = allFolders.filter((f) => f.workspaceId === workspaceId)
    const dates = ws_folders.map((f) => new Date(f.updatedAt).getTime())
    if (!dates.length) return 'never'
    return timeAgo(new Date(Math.max(...dates)).toISOString())
  }, [allFolders, workspaceId])

  const folderPath: WsFolder[] = currentFolder ? [currentFolder] : []

  const displayFolders = contentSearch.trim() ? (searchResults?.folders ?? []) : rootFolders
  const displayFiles   = contentSearch.trim()
    ? (searchResults?.files ?? [])
    : (currentFolderId ? currentFiles : [])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Workspace header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
          <entity.icon size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-slate-900 truncate">{entity.name}</h2>
          <p className="text-xs text-slate-400">
            {entity.subtitle && <><span>{entity.subtitle}</span><span className="mx-1.5">·</span></>}
            Updated {lastUpdatedStr}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Content search */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 w-44">
            <Search size={12} className="text-slate-400 flex-shrink-0" />
            <input type="text" value={contentSearch} onChange={(e) => onContentSearch(e.target.value)}
              placeholder="Search files…"
              className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400 min-w-0" />
            {contentSearch && (
              <button onClick={() => onContentSearch('')} className="text-slate-400 hover:text-slate-600">
                <span className="text-xs">✕</span>
              </button>
            )}
          </div>
          <button onClick={onNewFolder}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <FolderPlus size={13} className="text-amber-500" />
            New Folder
          </button>
          <button onClick={onUpload}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors">
            <Upload size={13} />
            Upload
          </button>
        </div>
      </div>

      {/* Breadcrumb bar */}
      <div className="px-6 py-2.5 border-b border-slate-50 bg-white flex items-center gap-2 flex-shrink-0">
        <WsBreadcrumb
          entityName={entity.name}
          entityIcon="folder_open"
          folderPath={folderPath}
          onRoot={onFolderClose}
          onFolder={(f) => onFolderOpen(f.id)}
        />
        {currentFolder && (
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
            <span>{currentFiles.length} files</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-surface">
        {contentSearch.trim() ? (
          /* Search results */
          <div className="space-y-5">
            {displayFolders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Folders ({displayFolders.length})</p>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {displayFolders.map((f) => (
                    <FolderCard key={f.id} folder={f} fileCount={countFiles(f.id)} compact
                      onOpen={() => { onContentSearch(''); onFolderOpen(f.id) }}
                      onRename={() => onRenameFolder(f)}
                      onDelete={() => onDeleteFolder(f)}
                      onMove={() => onMoveFolder(f)}
                    />
                  ))}
                </div>
              </div>
            )}
            {displayFiles.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Files ({displayFiles.length})</p>
                <FileTable files={displayFiles}
                  onRename={onRenameFile} onDelete={onDeleteFile} onMove={onMoveFile} onDownload={onDownload} />
              </div>
            )}
            {displayFolders.length === 0 && displayFiles.length === 0 && (
              <EmptyState icon="search_off" title="No results" subtitle={`Nothing matching "${contentSearch}" in this workspace`} />
            )}
          </div>

        ) : currentFolderId === null ? (
          /* Root: folder grid */
          rootFolders.length === 0 ? (
            <EmptyState icon="folder_open" title="No folders yet"
              subtitle="Create your first folder to start organising files"
              action={{ label: 'New Folder', onClick: onNewFolder }} />
          ) : (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Folders</p>
              <div className="grid grid-cols-4 gap-3">
                {rootFolders.map((f) => (
                  <FolderCard key={f.id} folder={f} fileCount={countFiles(f.id)}
                    onOpen={() => { onFolderOpen(f.id) }}
                    onRename={() => onRenameFolder(f)}
                    onDelete={() => onDeleteFolder(f)}
                    onMove={() => onMoveFolder(f)}
                  />
                ))}
              </div>
            </div>
          )

        ) : (
          /* Inside folder: file table */
          <div>
            {currentFiles.length === 0 ? (
              <EmptyState icon="upload_file" title="No files in this folder"
                subtitle="Upload files to get started"
                action={{ label: 'Upload File', onClick: onUpload }} />
            ) : (
              <>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {currentFolder?.name} · {currentFiles.length} files
                </p>
                <FileTable files={currentFiles}
                  onRename={onRenameFile} onDelete={onDeleteFile} onMove={onMoveFile} onDownload={onDownload} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Explorer Page ──────────────────────────────────────────────────────────
export default function WorkspaceHomePage() {
  const {
    folders: allFolders, files: allFiles,
    createFolder, renameFolder, deleteFolder, moveFolder,
    uploadFile, renameFile, deleteFile, moveFile,
  } = useWorkspace()

  // ── State ────────────────────────────────────────────────────────────────────
  const [category,         setCategory]         = useState<Category>('clients')
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [currentFolderId,  setCurrentFolderId]  = useState<string | null>(null)
  const [listSearch,       setListSearch]       = useState('')
  const [contentSearch,    setContentSearch]    = useState('')
  const [sortBy,           setSortBy]           = useState<SortBy>('name')

  // Dialogs
  const [showUpload,   setShowUpload]   = useState(false)
  const [folderDlg,    setFolderDlg]   = useState<{ mode: 'create' | 'rename'; folder?: WsFolder } | null>(null)
  const [moveTarget,   setMoveTarget]  = useState<MoveTarget | null>(null)
  const [deleteTarget, setDeleteTarget]= useState<DeleteTarget | null>(null)
  const [renameTarget, setRenameTarget]= useState<RenameTarget | null>(null)
  const [renameValue,  setRenameValue] = useState('')

  // ── Workspace ID ─────────────────────────────────────────────────────────────
  const workspaceId = useMemo(() => {
    if (!selectedEntityId) return null
    if (category === 'clients')    return clientWsId(selectedEntityId)
    if (category === 'jobs')       return jobWsId(selectedEntityId)
    if (category === 'candidates') return candidateWsId(selectedEntityId)
    return null
  }, [category, selectedEntityId])

  // ── Entity info ──────────────────────────────────────────────────────────────
  const entityInfo = useMemo(() => {
    if (!selectedEntityId) return null
    if (category === 'clients') {
      const c = clients.find((x) => x.id === selectedEntityId)
      return { name: c?.companyName ?? '', subtitle: c?.industry ?? '', icon: Building2 }
    }
    if (category === 'jobs') {
      const j = jobs.find((x) => x.id === selectedEntityId)
      const cl = clients.find((x) => x.id === j?.clientId)
      return { name: j?.title ?? '', subtitle: cl?.companyName ?? '', icon: Briefcase }
    }
    const ca = candidates.find((x) => x.id === selectedEntityId)
    return { name: ca?.name ?? '', subtitle: ca?.location ?? '', icon: User }
  }, [category, selectedEntityId])

  // ── Center panel entity rows ─────────────────────────────────────────────────
  const wsAllFolders = allFolders.filter((f) => workspaceId && f.workspaceId === workspaceId)

  function wsLastUpdated(wsId: string) {
    const fds = allFolders.filter((f) => f.workspaceId === wsId)
    if (!fds.length) return ''
    const max = Math.max(...fds.map((f) => new Date(f.updatedAt).getTime()))
    return new Date(max).toISOString()
  }

  const entityRows: EntityRow[] = useMemo(() => {
    const q = listSearch.toLowerCase()
    let rows: EntityRow[] = []

    if (category === 'clients') {
      rows = clients
        .filter((c) => c.companyName.toLowerCase().includes(q))
        .map((c) => ({ id: c.id, name: c.companyName, subtitle: c.industry, lastUpdated: wsLastUpdated(clientWsId(c.id)), icon: Building2 }))
    } else if (category === 'jobs') {
      rows = jobs
        .filter((j) => j.title.toLowerCase().includes(q) || clients.find((c) => c.id === j.clientId)?.companyName.toLowerCase().includes(q))
        .map((j) => {
          const cl = clients.find((c) => c.id === j.clientId)
          return { id: j.id, name: j.title, subtitle: cl?.companyName ?? '', lastUpdated: wsLastUpdated(jobWsId(j.id)), icon: Briefcase }
        })
    } else if (category === 'candidates') {
      rows = candidates
        .filter((c) => c.name.toLowerCase().includes(q))
        .map((c) => ({ id: c.id, name: c.name, subtitle: c.location, lastUpdated: wsLastUpdated(candidateWsId(c.id)), icon: User }))
    }

    if (sortBy === 'name')    rows = [...rows].sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'updated') rows = [...rows].sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''))
    return rows
  }, [category, listSearch, sortBy, allFolders])

  // ── Recent files ─────────────────────────────────────────────────────────────
  const recentFiles = useMemo(() => {
    const sorted = [...allFiles].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 15)
    return sorted.map((f) => {
      const wsId = f.workspaceId
      let entityName = wsId
      if (wsId.startsWith('cl-')) { const c = clients.find((x) => clientWsId(x.id) === wsId); entityName = c?.companyName ?? wsId }
      else if (wsId.startsWith('jo-')) { const j = jobs.find((x) => jobWsId(x.id) === wsId); entityName = j?.title ?? wsId }
      else if (wsId.startsWith('ca-')) { const ca = candidates.find((x) => candidateWsId(x.id) === wsId); entityName = ca?.name ?? wsId }
      return { file: f, entityName }
    })
  }, [allFiles])

  // ── Category counts ──────────────────────────────────────────────────────────
  const counts = { clients: clients.length, jobs: jobs.length, candidates: candidates.length }

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handleSelectCategory(cat: Category) {
    setCategory(cat)
    setSelectedEntityId(null)
    setCurrentFolderId(null)
    setContentSearch('')
    setListSearch('')
  }

  function handleSelectEntity(id: string) {
    setSelectedEntityId(id)
    setCurrentFolderId(null)
    setContentSearch('')
  }

  function handleFolderCreate(name: string, parentId: string | null) {
    if (workspaceId) createFolder(workspaceId, name, parentId)
    setFolderDlg(null)
  }

  function handleFolderRename(name: string) {
    if (folderDlg?.folder) renameFolder(folderDlg.folder.id, name)
    setFolderDlg(null)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    if (deleteTarget.kind === 'file')   deleteFile(deleteTarget.item.id)
    else {
      deleteFolder(deleteTarget.item.id)
      if ((deleteTarget.item as WsFolder).id === currentFolderId) setCurrentFolderId(null)
    }
    setDeleteTarget(null)
  }

  function handleMove(destFolderId: string | null) {
    if (!moveTarget) return
    if (moveTarget.kind === 'file' && destFolderId) moveFile(moveTarget.item.id, destFolderId)
    else if (moveTarget.kind === 'folder') moveFolder(moveTarget.item.id, destFolderId)
    setMoveTarget(null)
  }

  function handleRenameSubmit() {
    if (!renameTarget) return
    if (renameTarget.kind === 'file')   renameFile(renameTarget.item.id, renameValue)
    else renameFolder(renameTarget.item.id, renameValue)
    setRenameTarget(null)
  }

  function handleDownload(file: WsFile) {
    const text = `RecruitSync File\n\nName: ${file.name}\nDescription: ${file.description}\nUploaded By: ${file.uploadedBy}\nDate: ${file.uploadedAt}\n`
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = file.name; a.click()
    URL.revokeObjectURL(url)
  }

  function handleUpload(data: { name: string; fileType: WsFileType; size: number; description: string; tags: string[]; folderId: string }) {
    if (workspaceId) uploadFile({ ...data, workspaceId, uploadedBy: 'Y. Tanaka', uploadedAt: new Date().toISOString().slice(0, 10) })
    setShowUpload(false)
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />

      {/* Three-panel workspace explorer */}
      <div className="flex flex-1 overflow-hidden">

        {/* Panel 1: WS Left Nav */}
        <WsLeftNav selected={category} onChange={handleSelectCategory} counts={counts} />

        {/* Panel 2: Entity list (hidden for 'recent' category) */}
        {category !== 'recent' && (
          <CenterPanel
            category={category}
            rows={entityRows}
            selectedId={selectedEntityId}
            onSelect={handleSelectEntity}
            search={listSearch}
            onSearch={setListSearch}
            sortBy={sortBy}
            onSort={setSortBy}
          />
        )}

        {/* Panel 3: Right content */}
        <div className="flex flex-1 overflow-hidden">
          {category === 'recent' ? (
            <div className="flex-1 overflow-y-auto bg-surface">
              <RecentFilesWidget files={recentFiles} allFolders={allFolders} />
            </div>
          ) : !selectedEntityId || !workspaceId || !entityInfo ? (
            <div className="flex-1 bg-surface">
              <NoSelection category={category} />
            </div>
          ) : (
            <RightPanel
              entity={entityInfo}
              workspaceId={workspaceId}
              currentFolderId={currentFolderId}
              onFolderOpen={(id) => setCurrentFolderId(id)}
              onFolderClose={() => setCurrentFolderId(null)}
              onUpload={() => setShowUpload(true)}
              onNewFolder={() => setFolderDlg({ mode: 'create' })}
              onRenameFolder={(f) => setFolderDlg({ mode: 'rename', folder: f })}
              onDeleteFolder={(f) => setDeleteTarget({ kind: 'folder', item: f })}
              onMoveFolder={(f) => setMoveTarget({ kind: 'folder', item: f })}
              onRenameFile={(f) => { setRenameTarget({ kind: 'file', item: f }); setRenameValue(f.name) }}
              onDeleteFile={(f) => setDeleteTarget({ kind: 'file', item: f })}
              onMoveFile={(f) => setMoveTarget({ kind: 'file', item: f })}
              onDownload={handleDownload}
              contentSearch={contentSearch}
              onContentSearch={setContentSearch}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      {showUpload && workspaceId && (
        <UploadDialog
          workspaceId={workspaceId}
          folders={wsAllFolders}
          currentFolderId={currentFolderId}
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
        />
      )}

      {folderDlg && (
        <FolderDialog
          mode={folderDlg.mode}
          currentName={folderDlg.folder?.name}
          folders={wsAllFolders}
          onConfirm={folderDlg.mode === 'create' ? handleFolderCreate : (name) => handleFolderRename(name)}
          onClose={() => setFolderDlg(null)}
        />
      )}

      {moveTarget && (
        <MoveDialog
          itemName={moveTarget.item.name}
          itemId={moveTarget.item.id}
          folders={wsAllFolders}
          currentFolderId={
            moveTarget.kind === 'file'
              ? (moveTarget.item as WsFile).folderId
              : (moveTarget.item as WsFolder).parentId
          }
          onMove={handleMove}
          onClose={() => setMoveTarget(null)}
        />
      )}

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-80 p-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4">
              Rename {renameTarget.kind === 'file' ? 'File' : 'Folder'}
            </h2>
            <input autoFocus type="text" value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRenameTarget(null)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button onClick={handleRenameSubmit} className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark">Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${deleteTarget.kind === 'folder' ? 'Folder' : 'File'}`}
          message={`"${deleteTarget.item.name}" will be permanently deleted.${deleteTarget.kind === 'folder' ? ' All files inside will also be deleted.' : ''}`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
