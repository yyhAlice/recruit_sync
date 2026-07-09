import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  label: string
  icon: string
  to?: string
  badge?: string
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Clients', icon: 'business', to: '/clients' },
      { label: 'Jobs', icon: 'work', to: '/jobs' },
      { label: 'Candidates', icon: 'person_search', to: '/candidates' },
    ],
  },
  {
    title: 'Pipeline',
    items: [
      { label: 'Pipeline', icon: 'view_kanban', to: '/jobs' },
      { label: 'Activity Logs', icon: 'history', to: '/activity' },
      { label: 'Reminders', icon: 'notifications', badge: '3', to: '/reminders' },
    ],
  },
  {
    title: 'Files & CV',
    items: [
      { label: 'File Workspace', icon: 'folder_open', to: '/files' },
      { label: 'Upload CV', icon: 'upload_file', to: '/files' },
    ],
  },
]

function isActive(to: string | undefined, pathname: string): boolean {
  if (!to) return false
  if (to === '/dashboard') return pathname === '/dashboard'
  if (to === '/clients') return pathname === '/clients' || pathname.startsWith('/clients/')
  if (to === '/jobs') return pathname === '/jobs' || pathname.startsWith('/jobs/')
  return pathname.startsWith(to)
}

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>bolt</span>
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm leading-tight">RecruitSync</div>
            <div className="text-xs text-slate-400 leading-tight">International CRM</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section) => (
          <div key={section.title} className="mb-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
              {section.title}
            </div>
            {section.items.map((item) => {
              const active = isActive(item.to, location.pathname)
              const baseClasses = 'flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-sm transition-colors relative'
              const activeClasses = 'bg-primary/5 text-primary font-medium border-l-2 border-primary pl-1.5'
              const inactiveClasses = 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'

              const inner = (
                <span className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-danger text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                      {item.badge}
                    </span>
                  )}
                </span>
              )

              if (item.to) {
                return (
                  <Link key={item.label} to={item.to} className="block mb-0.5">
                    {inner}
                  </Link>
                )
              }

              return (
                <button key={item.label} className="block w-full mb-0.5 text-left">
                  {inner}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">YT</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-700 truncate">Y. Tanaka</div>
            <div className="text-xs text-slate-400">Senior Recruiter</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
