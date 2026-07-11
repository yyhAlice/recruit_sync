export type CVStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type OutputFormat = 'docx' | 'pdf' | 'both'
export type InputLanguage = 'english' | 'japanese' | 'myanmar' | 'auto'
export type FileRole = 'resume' | 'work_history' | 'other'
export type TemplateLanguage = 'en' | 'ja' | 'bilingual'

export interface CVFile {
  id: string
  name: string
  size: number
  type: string
  role: FileRole
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
  responsibilities: string
  technologies: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  major: string
  graduationYear: string
}

export interface CVLanguage {
  id: string
  language: string
  level: 'native' | 'fluent' | 'business' | 'conversational' | 'basic'
}

export interface Certification {
  id: string
  name: string
  organization: string
  date: string
}

export interface ParseConflict {
  field: keyof ParsedCandidate
  label: string
  file1Value: string
  file2Value: string
  selected: 'file1' | 'file2' | null
}

export interface ParsedCandidate {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  currentLocation: string
  dateOfBirth: string
  totalExperienceYears: number
  currentJobTitle: string
  desiredRole: string
  availability: string
  skills: string[]
  workExperience: WorkExperience[]
  education: Education[]
  languages: CVLanguage[]
  certifications: Certification[]
  conflicts: ParseConflict[]
}

export interface FieldMapping {
  id: string
  sourceField: string
  sampleValue: string
  destination: string
  confidence: number
}

export interface MappingTemplate {
  id: string
  name: string
  clientId?: string
  mappings: FieldMapping[]
  createdAt: string
}

export interface CVTemplate {
  id: string
  name: string
  language: TemplateLanguage
  description: string
  clientId?: string
  clientName?: string
  thumbnailColor: string
  lastUpdated: string
  createdBy: string
  isActive: boolean
  fileType: 'docx' | 'pdf'
  placeholders: string[]
}

export interface GeneratedCV {
  id: string
  candidateName: string
  candidateEmail: string
  sourceFiles: string[]
  templateId: string
  templateName: string
  outputFormat: OutputFormat
  generatedBy: string
  generatedAt: string
  status: CVStatus
}

export interface UploadSession {
  candidateName: string
  candidateEmail: string
  inputLanguage: InputLanguage
  files: CVFile[]
  parsedData: ParsedCandidate | null
  fieldMappings: FieldMapping[]
  selectedTemplateId: string
  outputFormat: OutputFormat
}
