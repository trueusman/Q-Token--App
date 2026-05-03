// src/context/AppContext.tsx
import React, {
  createContext, useContext, useEffect, useState,
  useCallback, type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import {
  subscribeToOwnerCompanies, subscribeToAllCompanies,
  subscribeToUserTokens, checkAndResetDaily,
} from '../services/firebase'
import type { Company, Token } from '../types'

interface AppContextValue {
  myCompanies: Company[]
  allCompanies: Company[]
  myTokens: Token[]
  companiesLoading: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [myCompanies, setMyCompanies] = useState<Company[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [myTokens, setMyTokens] = useState<Token[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setMyCompanies([])
      setAllCompanies([])
      setMyTokens([])
      setCompaniesLoading(false)
      return
    }

    const unsubOwned = subscribeToOwnerCompanies(user.uid, async (companies) => {
      // Check daily reset for each owned company
      for (const c of companies) {
        await checkAndResetDaily(c)
      }
      setMyCompanies(companies)
      setCompaniesLoading(false)
    })

    const unsubAll = subscribeToAllCompanies(setAllCompanies)
    const unsubTokens = subscribeToUserTokens(user.uid, setMyTokens)

    return () => {
      unsubOwned()
      unsubAll()
      unsubTokens()
    }
  }, [user])

  return (
    <AppContext.Provider value={{ myCompanies, allCompanies, myTokens, companiesLoading }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
