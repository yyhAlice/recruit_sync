export type EntityType = 'client' | 'job' | 'candidate'
export type WsFileType = 'pdf' | 'docx' | 'xlsx' | 'png' | 'jpg' | 'zip' | 'txt' | 'csv'
export type ActivityType = 'upload' | 'delete' | 'rename' | 'move' | 'create_folder' | 'delete_folder' | 'note_update'

export interface WsFolder {
  id: string
  workspaceId: string
  parentId: string | null
  name: string
  createdAt: string
  createdBy: string
  updatedAt: string
  notes: string
}

export interface WsFile {
  id: string
  folderId: string
  workspaceId: string
  name: string
  description: string
  fileType: WsFileType
  size: number
  tags: string[]
  uploadedBy: string
  uploadedAt: string
}

export interface WsActivity {
  id: string
  workspaceId: string
  folderId?: string
  type: ActivityType
  description: string
  performedBy: string
  timestamp: string
}
