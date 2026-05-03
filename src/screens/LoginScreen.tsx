// src/screens/LoginScreen.tsx
import React, { useState } from 'react'
import { Button, Toast } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await login()
    } catch {
      setError('Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      {/* Background blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4F8EF7, transparent)' }} />
      <div className="absolute bottom-24 left-[-80px] w-56 h-56 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-7 relative">
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-accent-lg animate-fade-up"
          style={{ background: 'linear-gradient(135deg, #4F8EF7, #7C3AED)' }}>
          🪙
        </div>

        <h1 className="font-display font-bold text-4xl text-slate-50 tracking-tight mb-2 animate-fade-up animate-delay-100">
          TokenQ
        </h1>
        <p className="text-slate-400 text-center text-sm leading-relaxed mb-10 animate-fade-up animate-delay-200">
          Smart queue management for<br />clinics, banks & service centers
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-up animate-delay-300">
          {['📍 Location search', '🔔 Live alerts', '🎟️ Easy booking'].map((f) => (
            <span key={f} className="px-3 py-1.5 rounded-full bg-bg-3 border border-slate-border text-xs text-slate-300 font-medium">
              {f}
            </span>
          ))}
        </div>

        {/* Google Sign-In */}
        <div className="w-full animate-fade-up animate-delay-400">
          <Button
            onClick={handleLogin}
            loading={loading}
            className="py-4 rounded-2xl text-base"
            style={{
              background: 'linear-gradient(135deg, #4285F4, #34A853)',
              boxShadow: '0 4px 24px rgba(66,133,244,0.35)',
            } as React.CSSProperties}
          >
            {!loading && (
              <>
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-bold text-blue-600">G</span>
                Continue with Google
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-5 leading-relaxed animate-fade-up animate-delay-400">
          By continuing, you agree to our{' '}
          <span className="text-accent">Terms</span> &{' '}
          <span className="text-accent">Privacy Policy</span>
          <br />Your data is secured via Firebase
        </p>
      </div>

      <div className="pb-8 flex items-center justify-center gap-2 text-xs text-slate-500">
        <span className="w-2 h-2 rounded-full bg-emerald-token" />
        Firebase Secured
      </div>
    </div>
  )
}
