import type { WorkExperience, Education, CVLanguage, Certification, OutputFormat, CVStatus } from './cv'

export type PipelineStage = 'sourced' | 'screening' | 'interview' | 'offered' | 'placed' | 'rejected'
export type JobStatus = 'active' | 'on-hold' | 'closed'
export type EmploymentType = 'Full-time' | 'Contract' | 'Part-time'

export interface Client {
  id: string
  companyName: string
  contactPerson: string
  industry: string
  email: string
  phone: string
  address: string
  website: string
  notes: string
  lastContactDate: string // ISO date string YYYY-MM-DD
}

export interface Job {
  id: string
  clientId: string
  title: string
  employmentType: EmploymentType
  location: string
  salaryMin: number
  salaryMax: number
  status: JobStatus
  closingDate: string
  requiredSkills: string[]
  experienceYears: number
  japaneseLevel: string
  englishLevel: string
  notes: string
}

export interface Candidate {
  id: string
  jobId: string
  name: string
  skills: string[]
  experienceYears: number
  location: string
  email: string
  stage: PipelineStage
  recruiterId: string
  appliedDate: string
  lastActivityDate: string // ISO date, used for status dot
  nextReminderDate: string | null // ISO date
  reminderOverdue: boolean
  photoUrl?: string
  // CV-derived fields (optional — only populated for candidates added via CV upload)
  phone?: string
  address?: string
  dateOfBirth?: string
  currentJobTitle?: string
  desiredRole?: string
  availability?: string
  workExperience?: WorkExperience[]
  education?: Education[]
  languages?: CVLanguage[]
  certifications?: Certification[]
  // Generated CV metadata (only populated for candidates created via the CV upload wizard)
  cvTemplateName?: string
  cvOutputFormat?: OutputFormat
  cvGeneratedAt?: string
  cvStatus?: CVStatus
}

export interface Recruiter {
  id: string
  name: string
}

export interface ActivityLog {
  id: string
  targetId: string
  type: 'Call' | 'Email' | 'Meeting' | 'Chat'
  summary: string
  nextAction: string
  author: string
  date: string
}
