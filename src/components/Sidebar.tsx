import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { navSections, type NavItem } from '../config/navConfig'

const COLLAPSED_KEY = 'rs_sidebar_collapsed'
const SECTIONS_KEY  = 'rs_sidebar_sections'

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}

function isItemActive(to: string, pathname: string): boolean {
  if (to === '/dashboard') return pathname === '/dashboard'
  if (to === '/clients')   return pathname === '/clients'   || pathname.startsWith('/clients/')
  if (to === '/jobs')      return pathname === '/jobs'      || (pathname.startsWith('/jobs/') && !pathname.includes('/pipeline'))
  if (to === '/pipeline')  return pathname === '/pipeline'
  if (to === '/cv')        return pathname === '/cv'
  if (to === '/cv/upload') return pathname === '/cv/upload'
  if (to === '/cv/history')         return pathname === '/cv/history'
  if (to === '/cv/templates/manage') return pathname === '/cv/templates/manage' || pathname === '/cv/templates'
  if (to === '/workspace') return pathname === '/workspace' || pathname.startsWith('/workspace/')
  if (to === '/activity')  return pathname === '/activity'
  return pathname.startsWith(to)
}

// ── Tooltip (shown in collapsed mode) ─────────────────────────────────────────
function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative w-full" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[9999] pointer-events-none">
          <div className="bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
            {label}
          </div>
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-800" />
        </div>
      )}
    </div>
  )
}

// ── Single nav item ────────────────────────────────────────────────────────────
function NavItemEl({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon

  const inner = (
    <span
      className={[
        'flex items-center gap-3 rounded-lg transition-all duration-150 select-none relative',
        collapsed ? 'justify-center w-9 h-9 mx-auto' : 'px-3 py-2 w-full',
        item.disabled
          ? 'opacity-40 cursor-not-allowed'
          : active
          ? 'bg-primary/8 text-primary font-semibold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 cursor-pointer',
      ].join(' ')}
    >
      <Icon
        size={16}
        className={[
          'flex-shrink-0 transition-colors',
          active ? 'text-primary' : 'text-slate-500',
        ].join(' ')}
        strokeWidth={active ? 2.2 : 1.8}
      />
      {!collapsed && (
        <>
          <span className="flex-1 text-sm leading-none">{item.label}</span>
          {item.badge !== undefined && (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none">
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge !== undefined && (
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full leading-none">
          {item.badge}
        </span>
      )}
    </span>
  )

  if (item.disabled) {
    return collapsed ? <Tooltip label={`${item.label} (coming soon)`}>{inner}</Tooltip> : inner
  }

  if (!item.to) return inner

  const content = (
    <Link to={item.to} className="block w-full">
      {inner}
    </Link>
  )

  return collapsed ? <Tooltip label={item.label}>{content}</Tooltip> : content
}

// ── Section ────────────────────────────────────────────────────────────────────
function SectionEl({
  sectionId,
  title,
  items,
  collapsed,
  sectionOpen,
  onToggle,
  pathname,
}: {
  sectionId: string
  title: string
  items: NavItem[]
  collapsed: boolean
  sectionOpen: boolean
  onToggle: () => void
  pathname: string
}) {
  const hasActive = items.some((i) => i.to && isItemActive(i.to, pathname))

  return (
    <div className="mb-1">
      {/* Section header */}
      {!collapsed ? (
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-3 py-1.5 group"
        >
          <span className={[
            'text-[10px] font-bold uppercase tracking-widest transition-colors',
            hasActive && !sectionOpen ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500',
          ].join(' ')}>
            {title}
          </span>
          {sectionOpen
            ? <ChevronUp size={11} className="text-slate-300 group-hover:text-slate-400" />
            : <ChevronDown size={11} className={hasActive ? 'text-primary' : 'text-slate-300 group-hover:text-slate-400'} />
          }
        </button>
      ) : (
        /* Divider in collapsed mode */
        <div className="h-px bg-slate-100 mx-2 my-2" />
      )}

      {/* Items */}
      {(sectionOpen || collapsed) && (
        <div className={collapsed ? 'flex flex-col items-center gap-0.5 py-0.5' : 'space-y-0.5'}>
          {items.map((item) => (
            <NavItemEl
              key={item.label}
              item={item}
              active={!!(item.to && isItemActive(item.to, pathname))}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Sidebar ───────────────────────────────────────────────────────────────
export default function Sidebar() {
  const location = useLocation()

  const [collapsed, setCollapsed] = useState<boolean>(() => load(COLLAPSED_KEY, false))
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    load(SECTIONS_KEY, Object.fromEntries(navSections.map((s) => [s.id, true])))
  )

  useEffect(() => { localStorage.setItem(COLLAPSED_KEY, JSON.stringify(collapsed)) }, [collapsed])
  useEffect(() => { localStorage.setItem(SECTIONS_KEY,  JSON.stringify(openSections)) }, [openSections])

  function toggleSection(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside
      className={[
        'flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen transition-all duration-200 ease-in-out',
        collapsed ? 'w-[60px]' : 'w-60',
      ].join(' ')}
    >
      {/* Logo */}
      <div className={[
        'flex items-center border-b border-slate-100 flex-shrink-0',
        collapsed ? 'justify-center py-4 px-2 h-[57px]' : 'px-4 py-4 gap-3 h-[57px]',
      ].join(' ')}>
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={14} className="text-white" fill="white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-slate-900 text-sm leading-tight tracking-tight">RecruitSync</div>
            <div className="text-[10px] text-slate-400 leading-tight">International CRM</div>
          </div>
        )}
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={[
            'flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors',
            collapsed ? 'hidden' : 'ml-auto',
          ].join(' ')}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 mb-1 w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Navigation */}
      <nav className={[
        'flex-1 overflow-y-auto overflow-x-hidden py-3',
        collapsed ? 'px-1' : 'px-3',
      ].join(' ')}>
        {navSections.map((section) => (
          <SectionEl
            key={section.id}
            sectionId={section.id}
            title={section.title}
            items={section.items}
            collapsed={collapsed}
            sectionOpen={openSections[section.id] ?? true}
            onToggle={() => toggleSection(section.id)}
            pathname={location.pathname}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className={[
        'border-t border-slate-100 flex-shrink-0',
        collapsed ? 'py-3 flex justify-center' : 'px-4 py-3',
      ].join(' ')}>
        {collapsed ? (
          <Tooltip label="Y. Tanaka — Senior Recruiter">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center cursor-default">
              <span className="text-[10px] font-bold text-primary">YT</span>
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-primary">YT</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-700 leading-tight truncate">Y. Tanaka</div>
              <div className="text-[10px] text-slate-400 leading-tight">Senior Recruiter</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
