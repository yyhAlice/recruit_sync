import type { WsFolder } from '../../types/workspace'

interface Props {
  entityName: string
  entityIcon: string
  folderPath: WsFolder[]
  onRoot: () => void
  onFolder: (folder: WsFolder) => void
}

export default function WsBreadcrumb({ entityName, entityIcon, folderPath, onRoot, onFolder }: Props) {
  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500 flex-wrap min-w-0">
      <button onClick={onRoot} className="flex items-center gap-1.5 hover:text-primary font-medium transition-colors min-w-0">
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{entityIcon}</span>
        <span className="truncate max-w-40">{entityName}</span>
      </button>
      {folderPath.map((folder, i) => (
        <span key={folder.id} className="flex items-center gap-1 min-w-0">
          <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '14px' }}>chevron_right</span>
          {i < folderPath.length - 1 ? (
            <button onClick={() => onFolder(folder)} className="hover:text-primary font-medium transition-colors truncate max-w-32">
              {folder.name}
            </button>
          ) : (
            <span className="font-semibold text-slate-800 truncate max-w-32">{folder.name}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
