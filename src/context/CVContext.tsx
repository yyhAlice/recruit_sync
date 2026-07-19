import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { UploadSession, GeneratedCV, ParsedCandidate, FieldMapping } from '../types/cv'
import { generatedCVHistory, exampleParsedCandidate, defaultFieldMappings, CATEGORY_TO_PLACEHOLDER } from '../data/cvMockData'

const STORAGE_KEY = 'recruitsync_cv_session'
const HISTORY_KEY = 'recruitsync_cv_history'

const EMPTY_SESSION: UploadSession = {
  candidateName: '',
  candidateEmail: '',
  inputLanguage: 'auto',
  files: [],
  parsedData: null,
  fieldMappings: [],
  selectedTemplateId: '',
  outputFormat: 'pdf',
  jobId: '',
  recruiterId: '',
  candidateSaved: false,
  candidateId: '',
}

interface CVContextValue {
  session: UploadSession
  setSession: (s: UploadSession) => void
  updateSession: (patch: Partial<UploadSession>) => void
  resetSession: () => void

  history: GeneratedCV[]
  addToHistory: (cv: GeneratedCV) => void

  simulateParse: (candidateName?: string, candidateEmail?: string) => Promise<ParsedCandidate>
  simulateAutoMap: (placeholders: string[]) => FieldMapping[]
}

const CVContext = createContext<CVContextValue | null>(null)

export function CVProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<UploadSession>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : EMPTY_SESSION
    } catch {
      return EMPTY_SESSION
    }
  })

  const [history, setHistory] = useState<GeneratedCV[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      return stored ? JSON.parse(stored) : generatedCVHistory
    } catch {
      return generatedCVHistory
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [session])

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }, [history])

  function setSession(s: UploadSession) {
    setSessionState(s)
  }

  function updateSession(patch: Partial<UploadSession>) {
    setSessionState((prev) => ({ ...prev, ...patch }))
  }

  function resetSession() {
    setSessionState(EMPTY_SESSION)
  }

  function addToHistory(cv: GeneratedCV) {
    setHistory((prev) => [cv, ...prev])
  }

  async function simulateParse(candidateName?: string, candidateEmail?: string): Promise<ParsedCandidate> {
    await new Promise((res) => setTimeout(res, 2000))
    const parsed: ParsedCandidate = {
      ...exampleParsedCandidate,
      id: `parsed-${Date.now()}`,
      fullName:      candidateName  || exampleParsedCandidate.fullName,
      email:         candidateEmail || exampleParsedCandidate.email,
    }
    return parsed
  }

  function simulateAutoMap(placeholders: string[]): FieldMapping[] {
    return defaultFieldMappings.map((m) => {
      const token = CATEGORY_TO_PLACEHOLDER[m.destination]
      return { ...m, destination: token && placeholders.includes(token) ? token : '' }
    })
  }

  return (
    <CVContext.Provider value={{ session, setSession, updateSession, resetSession, history, addToHistory, simulateParse, simulateAutoMap }}>
      {children}
    </CVContext.Provider>
  )
}

export function useCVContext() {
  const ctx = useContext(CVContext)
  if (!ctx) throw new Error('useCVContext must be used inside CVProvider')
  return ctx
}
