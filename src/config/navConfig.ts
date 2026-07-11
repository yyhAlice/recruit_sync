import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Kanban,
  Sparkles,
  Upload,
  FileOutput,
  LayoutTemplate,
  FolderOpen,
  History,
  Bell,
  UserCog,
  Settings,
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
    ],
  },
  {
    id: 'cv',
    title: 'CV Management',
    items: [
      { label: 'CV Dashboard',  icon: Sparkles,       to: '/cv' },
      { label: 'Upload & Parse', icon: Upload,         to: '/cv/upload' },
      { label: 'Generated CVs', icon: FileOutput,      to: '/cv/history' },
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
  {
    id: 'admin',
    title: 'Administration',
    items: [
      { label: 'Users',    icon: UserCog, disabled: true },
      { label: 'Settings', icon: Settings, disabled: true },
    ],
  },
]
