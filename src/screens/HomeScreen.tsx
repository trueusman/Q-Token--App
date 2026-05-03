// src/screens/HomeScreen.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react'

export default function HomeScreen() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center gap-3">
        <Avatar name={user?.displayName || 'U'} photoURL={user?.photoURL} size="md" />
        <div className="flex-1">
          <p className="text-xs text-slate-400">Welcome back</p>
          <p className="font-semibold text-slate-100 text-sm">{user?.displayName || 'User'}</p>
        </div>
        <button
          onClick={logout}
          className="w-9 h-9 rounded-full bg-bg-3 border border-slate-border flex items-center justify-center text-slate-400 hover:text-rose-token transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-10 gap-4 mt-4">
        <div className="mb-2">
          <h2 className="font-display font-bold text-2xl text-slate-50 mb-1">What are you here for?</h2>
          <p className="text-slate-400 text-sm">Choose your role to continue</p>
        </div>

        {/* Company card */}
        <RoleCard
          gradient="linear-gradient(135deg, #0f1e3d 0%, #162048 100%)"
          borderColor="rgba(79,142,247,0.25)"
          emoji="🏢"
          title="Are you a Company?"
          desc="Manage your service queue, issue tokens, track customers & set daily limits"
          ctaColor="text-accent"
          cta="Manage Queue →"
          watermark="🏢"
          onClick={() => nav('/company')}
        />

        {/* User card */}
        <RoleCard
          gradient="linear-gradient(135deg, #0a1f14 0%, #0e2b1b 100%)"
          borderColor="rgba(16,185,129,0.25)"
          emoji="🎟️"
          title="Finding / Waiting for a Token?"
          desc="Search companies, book your spot, get real-time alerts when your turn is near"
          ctaColor="text-emerald-token"
          cta="Find Service →"
          watermark="🎟️"
          onClick={() => nav('/search')}
        />
      </div>
    </div>
  )
}

interface RoleCardProps {
  gradient: string; borderColor: string; emoji: string
  title: string; desc: string; ctaColor: string; cta: string
  watermark: string; onClick: () => void
}

function RoleCard({ gradient, borderColor, emoji, title, desc, ctaColor, cta, watermark, onClick }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden rounded-3xl p-6 text-left w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border"
      style={{ background: gradient, borderColor }}
    >
      <span className="absolute right-[-16px] bottom-[-16px] text-[80px] opacity-[0.07] select-none pointer-events-none">
        {watermark}
      </span>
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="font-display font-bold text-lg text-slate-50 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-4">{desc}</p>
      <span className={`text-sm font-bold ${ctaColor}`}>{cta}</span>
    </button>
  )
}
