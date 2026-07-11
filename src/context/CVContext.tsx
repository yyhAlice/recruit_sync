import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { UploadSession, GeneratedCV, ParsedCandidate, FieldMapping } from '../types/cv'
import { generatedCVHistory, exampleParsedCandidate, defaultFieldMappings } from '../data/cvMockData'

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
}

interface CVContextValue {
  session: UploadSession
  setSession: (s: UploadSession) => void
  updateSession: (patch: Partial<UploadSession>) => void
  resetSession: () => void

  history: GeneratedCV[]
  addToHistory: (cv: GeneratedCV) => void
  deleteFromHistory: (id: string) => void

  // Simulate parsing — populates session.parsedData from the example candidate
  simulateParse: (candidateName?: string, candidateEmail?: string) => Promise<ParsedCandidate>
  // Simulate auto-mapping
  simulateAutoMap: () => FieldMapping[]
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

  // Persist session to localStorage
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

  function deleteFromHistory(id: string) {
    setHistory((prev) => prev.filter((cv) => cv.id !== id))
  }

  // Simulate async parsing (2 second delay) — returns a copy of the example with the given name/email
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

  // Simulate auto field mapping
  function simulateAutoMap(): FieldMapping[] {
    return defaultFieldMappings
  }

  return (
    <CVContext.Provider value={{ session, setSession, updateSession, resetSession, history, addToHistory, deleteFromHistory, simulateParse, simulateAutoMap }}>
      {children}
    </CVContext.Provider>
  )
}

export function useCVContext() {
  const ctx = useContext(CVContext)
  if (!ctx) throw new Error('useCVContext must be used inside CVProvider')
  return ctx
}
