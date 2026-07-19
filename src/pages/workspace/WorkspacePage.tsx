import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import PageHeader from '../../components/PageHeader'
import WsBreadcrumb from '../../components/workspace/WsBreadcrumb'
import FolderCard from '../../components/workspace/FolderCard'
import FileTable from '../../components/workspace/FileTable'
import UploadDialog from '../../components/workspace/UploadDialog'
import FolderDialog from '../../components/workspace/FolderDialog'
import MoveDialog from '../../components/workspace/MoveDialog'
import NotesPanel from '../../components/workspace/NotesPanel'
import ActivityTimeline from '../../components/workspace/ActivityTimeline'
import ConfirmDialog from '../../components/workspace/ConfirmDialog'
import EmptyState from '../../components/workspace/EmptyState'
import { useWorkspace } from '../../context/WorkspaceContext'
import { clients, jobs, candidates } from '../../data/mockData'
import { clientWsId, jobWsId, candidateWsId } from '../../data/workspaceMockData'
import type { WsFolder, WsFile, EntityType, WsFileType } from '../../types/workspace'

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type RenameTarget = { kind: 'file'; item: WsFile } | { kind: 'folder'; item: WsFolder }
type DeleteTarget = { kind: 'file'; item: WsFile } | { kind: 'folder'; item: WsFolder }
type MoveTarget   = { kind: 'file'; item: WsFile } | { kind: 'folder'; item: WsFolder }

export default function WorkspacePage({ entityType }: { entityType: EntityType }) {
  const params = useParams()
  const entityId = params.clientId ?? params.jobId ?? params.candidateId ?? ''

  const wsId = entityType === 'client'
    ? clientWsId(entityId)
    : entityType === 'job'
    ? jobWsId(entityId)
    : candidateWsId(entityId)

  const entity = useMemo(() => {
    if (entityType === 'client') {
      const c = clients.find((x) => x.id === entityId)
      return { name: c?.companyName ?? entityId, subtitle: c?.industry, icon: 'business' }
    }
    if (entityType === 'job') {
      const j = jobs.find((x) => x.id === entityId)
      const cl = clients.find((x) => x.id === j?.clientId)
      return { name: j?.title ?? entityId, subtitle: cl?.companyName, icon: 'work' }
    }
    const ca = candidates.find((x) => x.id === entityId)
    return { name: ca?.name ?? entityId, subtitle: ca?.location, icon: 'person' }
  }, [entityType, entityId])

  const ws = useWorkspace()
  const {
    getFoldersByWorkspace, getFilesByFolder, getActivitiesByWorkspace,
    createFolder, renameFolder, deleteFolder, moveFolder, updateFolderNotes,
    uploadFile, renameFile, deleteFile, moveFile,
    countFiles, folderStorageUsed, search, folders: allFolders,
  } = ws

  // ── State ─────────────────────────────────────────────────────────────────────
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [rightTab, setRightTab]               = useState<'notes' | 'activity'>('activity')
  const [searchQuery, setSearchQuery]         = useState('')
  const [isSearching, setIsSearching]         = useState(false)

  // Dialogs
  const [showUpload,     setShowUpload]     = useState(false)
  const [folderDialog,   setFolderDialog]   = useState<{ mode: 'create' | 'rename'; folder?: WsFolder } | null>(null)
  const [moveTarget,     setMoveTarget]     = useState<MoveTarget | null>(null)
  const [renameTarget,   setRenameTarget]   = useState<RenameTarget | null>(null)
  const [deleteTarget,   setDeleteTarget]   = useState<DeleteTarget | null>(null)
  const [renameValue,    setRenameValue]    = useState('')

  // ── Derived data ──────────────────────────────────────────────────────────────
  const rootFolders    = getFoldersByWorkspace(wsId, null)
  const currentFolder  = allFolders.find((f) => f.id === currentFolderId) ?? null
  const currentFiles   = currentFolderId ? getFilesByFolder(currentFolderId) : []
  const activities     = getActivitiesByWorkspace(wsId)
  const allWsFolders   = allFolders.filter((f) => f.workspaceId === wsId)

  const totalFiles   = allFolders.filter((f) => f.workspaceId === wsId).reduce((s, f) => s + countFiles(f.id), 0)
  const storageUsed  = folderStorageUsed(wsId)

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    return search(wsId, searchQuery)
  }, [searchQuery, wsId])

  // Folder path breadcrumb (flat workspaces only go 1 level, but support nested)
  const folderPath: WsFolder[] = []
  if (currentFolder) folderPath.push(currentFolder)

  // ── Handlers ──────────────────────────────────────────────────────────────────
  function handleCreateFolder(name: string, parentId: string | null) {
    createFolder(wsId, name, parentId)
    setFolderDialog(null)
  }

  function handleRenameFolder(name: string) {
    if (!folderDialog?.folder) return
    renameFolder(folderDialog.folder.id, name)
    setFolderDialog(null)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    if (deleteTarget.kind === 'file') deleteFile(deleteTarget.item.id)
    else deleteFolder(deleteTarget.item.id)
    if (deleteTarget.kind === 'folder' && deleteTarget.item.id === currentFolderId) setCurrentFolderId(null)
    setDeleteTarget(null)
  }

  function handleMove(destFolderId: string | null) {
    if (!moveTarget) return
    if (moveTarget.kind === 'file') {
      if (destFolderId) moveFile(moveTarget.item.id, destFolderId)
    } else {
      moveFolder(moveTarget.item.id, destFolderId)
    }
    setMoveTarget(null)
  }

  function handleRenameFile() {
    if (!renameTarget || renameTarget.kind !== 'file') return
    renameFile(renameTarget.item.id, renameValue)
    setRenameTarget(null)
  }

  function handleRenameFolder2() {
    if (!renameTarget || renameTarget.kind !== 'folder') return
    renameFolder(renameTarget.item.id, renameValue)
    setRenameTarget(null)
  }

  function handleDownload(file: WsFile) {
    const text = `RecruitSync File\n\nName: ${file.name}\nDescription: ${file.description}\nUploaded By: ${file.uploadedBy}\nDate: ${file.uploadedAt}\nTags: ${file.tags.join(', ')}\n`
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = file.name; a.click()
    URL.revokeObjectURL(url)
  }

  function handleUpload(data: { name: string; fileType: WsFileType; size: number; description: string; tags: string[]; folderId: string }) {
    uploadFile({ ...data, workspaceId: wsId, uploadedBy: 'Y. Tanaka', uploadedAt: new Date().toISOString().slice(0, 10) })
    setShowUpload(false)
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title={entity.name}
          subtitle={entity.subtitle ?? `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Workspace`}
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '14px' }}>folder</span>
                {rootFolders.length} folders
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>description</span>
                {totalFiles} files
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>storage</span>
                {formatSize(storageUsed)}
              </div>
            </div>
          }
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-100 bg-white">
              <WsBreadcrumb
                entityName={entity.name}
                entityIcon={entity.icon}
                folderPath={folderPath}
                onRoot={() => setCurrentFolderId(null)}
                onFolder={(f) => setCurrentFolderId(f.id)}
              />
              <div className="ml-auto flex items-center gap-2">
                {/* Search */}
                <div className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 transition-all ${isSearching ? 'border-primary/40 w-56' : 'border-slate-200 w-32'}`}>
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearching(true)}
                    onBlur={() => { if (!searchQuery) setIsSearching(false) }}
                    placeholder="Search…"
                    className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setIsSearching(false) }} className="text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setFolderDialog({ mode: 'create' })}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '16px' }}>create_new_folder</span>
                  New Folder
                </button>
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
                  Upload
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Search results */}
              {searchQuery.trim() && searchResults ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Folders ({searchResults.folders.length})
                    </p>
                    {searchResults.folders.length === 0 ? (
                      <p className="text-xs text-slate-300">No folders found</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-3">
                        {searchResults.folders.map((f) => (
                          <FolderCard key={f.id} folder={f} fileCount={countFiles(f.id)}
                            onOpen={() => setCurrentFolderId(f.id)}
                            onRename={() => setFolderDialog({ mode: 'rename', folder: f })}
                            onDelete={() => setDeleteTarget({ kind: 'folder', item: f })}
                            onMove={() => setMoveTarget({ kind: 'folder', item: f })}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Files ({searchResults.files.length})
                    </p>
                    {searchResults.files.length === 0 ? (
                      <p className="text-xs text-slate-300">No files found</p>
                    ) : (
                      <FileTable files={searchResults.files}
                        onRename={(f) => { setRenameTarget({ kind: 'file', item: f }); setRenameValue(f.name) }}
                        onDelete={(f) => setDeleteTarget({ kind: 'file', item: f })}
                        onMove={(f)   => setMoveTarget({ kind: 'file', item: f })}
                        onDownload={handleDownload}
                      />
                    )}
                  </div>
                </div>

              ) : currentFolderId === null ? (
                /* Root folder grid */
                rootFolders.length === 0 ? (
                  <EmptyState icon="folder_open" title="No folders yet"
                    subtitle="Create your first folder to start organising files"
                    action={{ label: 'New Folder', onClick: () => setFolderDialog({ mode: 'create' }) }}
                  />
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {rootFolders.map((f) => (
                      <FolderCard key={f.id} folder={f} fileCount={countFiles(f.id)}
                        onOpen={() => { setCurrentFolderId(f.id); setRightTab('notes') }}
                        onRename={() => setFolderDialog({ mode: 'rename', folder: f })}
                        onDelete={() => setDeleteTarget({ kind: 'folder', item: f })}
                        onMove={() => setMoveTarget({ kind: 'folder', item: f })}
                      />
                    ))}
                  </div>
                )

              ) : (
                /* File list inside folder */
                currentFiles.length === 0 ? (
                  <EmptyState icon="upload_file" title="No files in this folder"
                    subtitle="Upload your first file to get started"
                    action={{ label: 'Upload File', onClick: () => setShowUpload(true) }}
                  />
                ) : (
                  <FileTable files={currentFiles}
                    onRename={(f) => { setRenameTarget({ kind: 'file', item: f }); setRenameValue(f.name) }}
                    onDelete={(f) => setDeleteTarget({ kind: 'file', item: f })}
                    onMove={(f)   => setMoveTarget({ kind: 'file', item: f })}
                    onDownload={handleDownload}
                  />
                )
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="w-72 flex-shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
            {/* Tab toggle */}
            <div className="flex border-b border-slate-100">
              {(['notes', 'activity'] as const).map((tab) => (
                <button key={tab} onClick={() => setRightTab(tab)}
                  className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${rightTab === tab ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab === 'notes' ? 'Notes' : 'Activity'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden p-4">
              {rightTab === 'notes' ? (
                currentFolder ? (
                  <NotesPanel folder={currentFolder} onSave={(notes) => updateFolderNotes(currentFolder.id, notes)} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <span className="material-symbols-outlined text-slate-200 text-4xl mb-2">edit_note</span>
                    <p className="text-xs text-slate-400">Open a folder to view and edit its notes</p>
                  </div>
                )
              ) : (
                <ActivityTimeline activities={activities} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showUpload && (
        <UploadDialog
          workspaceId={wsId}
          folders={allWsFolders}
          currentFolderId={currentFolderId}
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
        />
      )}

      {folderDialog && (
        <FolderDialog
          mode={folderDialog.mode}
          currentName={folderDialog.folder?.name}
          folders={allWsFolders}
          onConfirm={folderDialog.mode === 'create' ? handleCreateFolder : (name) => handleRenameFolder(name)}
          onClose={() => setFolderDialog(null)}
        />
      )}

      {moveTarget && (
        <MoveDialog
          itemName={moveTarget.item.name}
          itemId={moveTarget.item.id}
          folders={allWsFolders}
          currentFolderId={moveTarget.kind === 'file' ? (moveTarget.item as WsFile).folderId : (moveTarget.item as WsFolder).parentId}
          onMove={handleMove}
          onClose={() => setMoveTarget(null)}
        />
      )}

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-80 p-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Rename {renameTarget.kind === 'file' ? 'File' : 'Folder'}</h2>
            <input autoFocus type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') renameTarget.kind === 'file' ? handleRenameFile() : handleRenameFolder2() }}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRenameTarget(null)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button onClick={renameTarget.kind === 'file' ? handleRenameFile : handleRenameFolder2}
                className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark">Save</button>
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
