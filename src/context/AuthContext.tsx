// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import {
  signInWithGoogle, signOut, onAuthChanged, saveUserProfile,
} from '../services/firebase'
import { requestPermission } from '../services/notifications'

interface AuthContextValue {
  user: FirebaseUser | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthChanged((u) => {
      setUser(u)
      setLoading(false)
      if (u) {
        // Run side effects in background — don't block navigation
        saveUserProfile(u).catch(console.error)
        requestPermission().catch(console.error)
      }
    })
    return unsub
  }, [])

  const login = async () => {
    await signInWithGoogle()
  }

  const logout = async () => {
    await signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
