import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import type { Candidate } from '../types'
import { candidates as baseCandidates } from '../data/mockData'

const STORAGE_KEY = 'recruitsync_candidates_added'

interface CandidateContextValue {
  candidates: Candidate[]
  addCandidate: (c: Candidate) => void
}

const CandidateContext = createContext<CandidateContextValue | null>(null)

export function CandidateProvider({ children }: { children: ReactNode }) {
  const [addedCandidates, setAddedCandidates] = useState<Candidate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addedCandidates))
  }, [addedCandidates])

  function addCandidate(c: Candidate) {
    setAddedCandidates((prev) => [c, ...prev])
  }

  const candidates = useMemo(() => [...addedCandidates, ...baseCandidates], [addedCandidates])

  return (
    <CandidateContext.Provider value={{ candidates, addCandidate }}>
      {children}
    </CandidateContext.Provider>
  )
}

export function useCandidateContext() {
  const ctx = useContext(CandidateContext)
  if (!ctx) throw new Error('useCandidateContext must be used inside CandidateProvider')
  return ctx
}
