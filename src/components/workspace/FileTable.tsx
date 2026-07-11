import type { WsFile, WsFileType } from '../../types/workspace'

interface Props {
  files: WsFile[]
  onRename: (file: WsFile) => void
  onDelete: (file: WsFile) => void
  onMove: (file: WsFile) => void
  onDownload: (file: WsFile) => void
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const FILE_ICON: Record<WsFileType, { icon: string; cls: string }> = {
  pdf:  { icon: 'picture_as_pdf', cls: 'text-red-500' },
  docx: { icon: 'description',    cls: 'text-blue-500' },
  xlsx: { icon: 'table_chart',    cls: 'text-green-600' },
  png:  { icon: 'image',          cls: 'text-indigo-400' },
  jpg:  { icon: 'image',          cls: 'text-indigo-400' },
  zip:  { icon: 'folder_zip',     cls: 'text-amber-600' },
  txt:  { icon: 'article',        cls: 'text-slate-400' },
  csv:  { icon: 'grid_on',        cls: 'text-teal-600' },
}

export default function FileTable({ files, onRename, onDelete, onMove, onDownload }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {['Name', 'Description', 'Uploaded By', 'Date', 'Size', 'Actions'].map((h) => (
              <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const { icon, cls } = FILE_ICON[file.fileType] ?? { icon: 'insert_drive_file', cls: 'text-slate-400' }
            return (
              <tr key={file.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`material-symbols-outlined ${cls}`} style={{ fontSize: '20px' }}>{icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{file.name}</p>
                      {file.tags.length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {file.tags.slice(0, 2).map((t) => (
                            <span key={t} className="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-medium">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">
                  <p className="truncate">{file.description || '—'}</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{file.uploadedBy}</td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(file.uploadedAt)}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatSize(file.size)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDownload(file)} title="Download"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-success transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>download</span>
                    </button>
                    <button onClick={() => onRename(file)} title="Rename"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                    </button>
                    <button onClick={() => onMove(file)} title="Move"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-primary transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>drive_file_move</span>
                    </button>
                    <button onClick={() => onDelete(file)} title="Delete"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-danger transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
