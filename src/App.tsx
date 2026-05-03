// src/App.tsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Spinner } from './components/ui'

import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import CompanyListScreen from './screens/company/CompanyListScreen'
import CompanyAdminScreen from './screens/company/CompanyAdminScreen'
import AddCompanyScreen from './screens/company/AddCompanyScreen'
import UserSearchScreen from './screens/user/UserSearchScreen'
import CompanyUserScreen from './screens/user/CompanyUserScreen'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="app-shell items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    )
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-shell items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginScreen />} />
      <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
      <Route path="/company" element={<ProtectedRoute><CompanyListScreen /></ProtectedRoute>} />
      <Route path="/company/add" element={<ProtectedRoute><AddCompanyScreen /></ProtectedRoute>} />
      <Route path="/company/:id" element={<ProtectedRoute><CompanyAdminScreen /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><UserSearchScreen /></ProtectedRoute>} />
      <Route path="/search/:id" element={<ProtectedRoute><CompanyUserScreen /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
