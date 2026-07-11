import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { WsFolder, WsFile, WsActivity, ActivityType } from '../types/workspace'
import { initialFolders, initialFiles, initialActivities } from '../data/workspaceMockData'

const FOLDERS_KEY  = 'rs_ws_folders'
const FILES_KEY    = 'rs_ws_files'
const ACTIVITY_KEY = 'rs_ws_activity'

interface WorkspaceContextValue {
  folders: WsFolder[]
  files: WsFile[]
  activities: WsActivity[]

  // Folder operations
  createFolder: (workspaceId: string, name: string, parentId?: string | null) => WsFolder
  renameFolder: (id: string, newName: string) => void
  deleteFolder: (id: string) => void
  moveFolder: (id: string, newParentId: string | null) => void
  updateFolderNotes: (id: string, notes: string) => void

  // File operations
  uploadFile: (file: Omit<WsFile, 'id'>) => WsFile
  renameFile: (id: string, newName: string) => void
  deleteFile: (id: string) => void
  moveFile: (id: string, newFolderId: string) => void

  // Queries
  getFoldersByWorkspace: (workspaceId: string, parentId?: string | null) => WsFolder[]
  getFilesByFolder: (folderId: string) => WsFile[]
  getActivitiesByWorkspace: (workspaceId: string) => WsActivity[]
  search: (workspaceId: string, query: string) => { folders: WsFolder[]; files: WsFile[] }
  countFiles: (folderId: string) => number
  folderStorageUsed: (workspaceId: string) => number
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch { return fallback }
}

let actCounter = 1000

function makeActivity(workspaceId: string, type: ActivityType, description: string, performedBy: string, folderId?: string): WsActivity {
  return {
    id: `act-${Date.now()}-${actCounter++}`,
    workspaceId,
    folderId,
    type,
    description,
    performedBy,
    timestamp: new Date().toISOString(),
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [folders,    setFolders]    = useState<WsFolder[]>   (() => load(FOLDERS_KEY,  initialFolders))
  const [files,      setFiles]      = useState<WsFile[]>      (() => load(FILES_KEY,    initialFiles))
  const [activities, setActivities] = useState<WsActivity[]>  (() => load(ACTIVITY_KEY, initialActivities))

  useEffect(() => { localStorage.setItem(FOLDERS_KEY,  JSON.stringify(folders))    }, [folders])
  useEffect(() => { localStorage.setItem(FILES_KEY,    JSON.stringify(files))      }, [files])
  useEffect(() => { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities)) }, [activities])

  function addActivity(act: WsActivity) {
    setActivities((prev) => [act, ...prev])
  }

  function createFolder(workspaceId: string, name: string, parentId: string | null = null): WsFolder {
    const folder: WsFolder = {
      id: `fld-${Date.now()}`,
      workspaceId,
      parentId,
      name,
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy: 'Y. Tanaka',
      updatedAt: new Date().toISOString().slice(0, 10),
      notes: '',
    }
    setFolders((prev) => [...prev, folder])
    addActivity(makeActivity(workspaceId, 'create_folder', `Folder "${name}" created`, 'Y. Tanaka', folder.id))
    return folder
  }

  function renameFolder(id: string, newName: string) {
    const folder = folders.find((f) => f.id === id)
    setFolders((prev) => prev.map((f) => f.id === id ? { ...f, name: newName, updatedAt: new Date().toISOString().slice(0, 10) } : f))
    if (folder) addActivity(makeActivity(folder.workspaceId, 'rename', `Folder renamed to "${newName}"`, 'Y. Tanaka', id))
  }

  function deleteFolder(id: string) {
    const folder = folders.find((f) => f.id === id)
    setFolders((prev) => prev.filter((f) => f.id !== id))
    setFiles((prev) => prev.filter((f) => f.folderId !== id))
    if (folder) addActivity(makeActivity(folder.workspaceId, 'delete_folder', `Folder "${folder.name}" deleted`, 'Y. Tanaka'))
  }

  function moveFolder(id: string, newParentId: string | null) {
    const folder = folders.find((f) => f.id === id)
    setFolders((prev) => prev.map((f) => f.id === id ? { ...f, parentId: newParentId } : f))
    if (folder) addActivity(makeActivity(folder.workspaceId, 'move', `Folder "${folder.name}" moved`, 'Y. Tanaka', id))
  }

  function updateFolderNotes(id: string, notes: string) {
    const folder = folders.find((f) => f.id === id)
    setFolders((prev) => prev.map((f) => f.id === id ? { ...f, notes, updatedAt: new Date().toISOString().slice(0, 10) } : f))
    if (folder) addActivity(makeActivity(folder.workspaceId, 'note_update', `Notes updated in "${folder.name}"`, 'Y. Tanaka', id))
  }

  function uploadFile(file: Omit<WsFile, 'id'>): WsFile {
    const newFile: WsFile = { ...file, id: `fil-${Date.now()}` }
    setFiles((prev) => [...prev, newFile])
    addActivity(makeActivity(file.workspaceId, 'upload', `${file.name} uploaded`, 'Y. Tanaka', file.folderId))
    return newFile
  }

  function renameFile(id: string, newName: string) {
    const file = files.find((f) => f.id === id)
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, name: newName } : f))
    if (file) addActivity(makeActivity(file.workspaceId, 'rename', `File renamed to "${newName}"`, 'Y. Tanaka', file.folderId))
  }

  function deleteFile(id: string) {
    const file = files.find((f) => f.id === id)
    setFiles((prev) => prev.filter((f) => f.id !== id))
    if (file) addActivity(makeActivity(file.workspaceId, 'delete', `${file.name} deleted`, 'Y. Tanaka', file.folderId))
  }

  function moveFile(id: string, newFolderId: string) {
    const file  = files.find((f) => f.id === id)
    const dest  = folders.find((f) => f.id === newFolderId)
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, folderId: newFolderId } : f))
    if (file) addActivity(makeActivity(file.workspaceId, 'move', `${file.name} moved to "${dest?.name ?? newFolderId}"`, 'Y. Tanaka', newFolderId))
  }

  function getFoldersByWorkspace(workspaceId: string, parentId: string | null = null): WsFolder[] {
    return folders.filter((f) => f.workspaceId === workspaceId && f.parentId === parentId)
  }

  function getFilesByFolder(folderId: string): WsFile[] {
    return files.filter((f) => f.folderId === folderId)
  }

  function getActivitiesByWorkspace(workspaceId: string): WsActivity[] {
    return activities.filter((a) => a.workspaceId === workspaceId)
  }

  function countFiles(folderId: string): number {
    return files.filter((f) => f.folderId === folderId).length
  }

  function folderStorageUsed(workspaceId: string): number {
    return files.filter((f) => f.workspaceId === workspaceId).reduce((sum, f) => sum + f.size, 0)
  }

  function search(workspaceId: string, query: string) {
    const q = query.toLowerCase()
    return {
      folders: folders.filter((f) => f.workspaceId === workspaceId && f.name.toLowerCase().includes(q)),
      files:   files.filter((f) => f.workspaceId === workspaceId && (
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      )),
    }
  }

  return (
    <WorkspaceContext.Provider value={{
      folders, files, activities,
      createFolder, renameFolder, deleteFolder, moveFolder, updateFolderNotes,
      uploadFile, renameFile, deleteFile, moveFile,
      getFoldersByWorkspace, getFilesByFolder, getActivitiesByWorkspace,
      search, countFiles, folderStorageUsed,
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return ctx
}
