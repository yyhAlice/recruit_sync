import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Kanban,
  LayoutTemplate,
  FolderOpen,
  History,
  Bell,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  icon: LucideIcon
  to?: string
  badge?: number
  disabled?: boolean
}

export interface NavSection {
  id: string
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    ],
  },
  {
    id: 'recruitment',
    title: 'Recruitment',
    items: [
      { label: 'Clients',    icon: Building2, to: '/clients' },
      { label: 'Jobs',       icon: Briefcase, to: '/jobs' },
      { label: 'Candidates', icon: Users,     to: '/candidates' },
      { label: 'Pipeline',   icon: Kanban,    to: '/pipeline' },
      { label: 'Templates',     icon: LayoutTemplate,  to: '/cv/templates/manage' },
    ],
  },
  {
    id: 'workspace',
    title: 'Workspace',
    items: [
      { label: 'File Workspace', icon: FolderOpen, to: '/workspace' },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      { label: 'Activity Logs', icon: History, to: '/activity' },
      { label: 'Reminders',     icon: Bell,    to: '/reminders', badge: 3 },
    ],
  },
]
