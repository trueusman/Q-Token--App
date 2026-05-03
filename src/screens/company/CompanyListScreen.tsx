// src/screens/company/CompanyListScreen.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Navbar, Badge, Spinner } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import type { Company } from '../../types'

export default function CompanyListScreen() {
  const nav = useNavigate()
  const { myCompanies, companiesLoading } = useApp()

  return (
    <div className="app-shell">
      <Navbar
        title="My Companies"
        onBack={() => nav('/')}
        action={
          <button
            onClick={() => nav('/company/add')}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-accent"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 pb-10">
        {companiesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="w-8 h-8" />
          </div>
        ) : myCompanies.length === 0 ? (
          <EmptyState onAdd={() => nav('/company/add')} />
        ) : (
          <div className="flex flex-col gap-3">
            {myCompanies.map((c, i) => (
              <CompanyCard
                key={c.id}
                company={c}
                onClick={() => nav(`/company/${c.id}`)}
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CompanyCard({
  company: c, onClick, style,
}: { company: Company; onClick: () => void; style?: React.CSSProperties }) {
  const booked = c.totalTokens > 0 ? `${c.currentToken - 1}/${c.totalTokens}` : '—'
  return (
    <button
      onClick={onClick}
      className="list-item w-full text-left animate-fade-up"
      style={style}
    >
      <div className="avatar w-12 h-12 rounded-[14px] text-lg flex-shrink-0">
        {c.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-100 truncate">{c.name}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">Since {c.since} · {c.timings}</p>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          <Badge color={c.allowTokens ? 'green' : 'red'}>
            {c.allowTokens ? '● Open' : '● Closed'}
          </Badge>
          <Badge color="blue">{booked} tokens</Badge>
        </div>
      </div>
      <span className="text-slate-500 text-lg">›</span>
    </button>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center pt-20 px-6 text-center animate-fade-up">
      <div className="text-6xl mb-5">🏢</div>
      <h3 className="font-display font-bold text-xl text-slate-100 mb-2">No Companies Yet</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-8">
        Add your first company to start managing tokens and queues for your customers
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-gradient-to-br from-accent to-accent-2 text-white font-semibold px-6 py-3 rounded-xl shadow-accent"
      >
        <Plus className="w-4 h-4" /> Add Company
      </button>
    </div>
  )
}
