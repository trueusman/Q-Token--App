// src/screens/user/UserSearchScreen.tsx
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { Navbar, Badge, Spinner } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import type { Company } from '../../types'

export default function UserSearchScreen() {
  const nav = useNavigate()
  const { allCompanies, myTokens, companiesLoading } = useApp()
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => allCompanies.filter(c => c.name.toLowerCase().includes(query.toLowerCase())),
    [allCompanies, query],
  )

  const getMyToken = (cId: string) =>
    myTokens.find(t => t.companyId === cId && !t.cancelled)

  const activeToken = myTokens.find(t => !t.cancelled)
  const activeTokenCompany = activeToken
    ? allCompanies.find(c => c.id === activeToken.companyId)
    : null

  return (
    <div className="app-shell">
      <Navbar title="Find a Service" onBack={() => nav('/')} />

      <div className="flex-1 overflow-y-auto pb-10">
        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-bg-3 border border-slate-border rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              className="flex-1 bg-transparent outline-none text-slate-100 text-sm placeholder-slate-500"
              placeholder="Search clinics, banks, offices..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        {/* Active token banner */}
        {activeToken && activeTokenCompany && (
          <ActiveTokenBanner
            token={activeToken}
            company={activeTokenCompany}
            onClick={() => nav(`/search/${activeTokenCompany.id}`)}
          />
        )}

        <div className="px-4 flex flex-col gap-2.5">
          {companiesLoading ? (
            <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center pt-14 text-center">
              <div className="text-5xl mb-4">🏥</div>
              <p className="font-display font-semibold text-slate-200">
                {query ? `No results for "${query}"` : 'No companies yet'}
              </p>
              <p className="text-sm text-slate-400 mt-1">Pull to refresh or try another search</p>
            </div>
          ) : (
            filtered.map((c, i) => (
              <CompanySearchCard
                key={c.id} company={c}
                myTokenNumber={getMyToken(c.id)?.tokenNumber}
                onClick={() => nav(`/search/${c.id}`)}
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ActiveTokenBanner({ token, company, onClick }: {
  token: import('../../types').Token
  company: Company
  onClick: () => void
}) {
  const ahead = Math.max(0, token.tokenNumber - (company.currentToken || 1))
  const wait = ahead * (company.estimatedMinPerToken || 5)
  return (
    <button
      onClick={onClick}
      className="mx-4 my-2 p-4 rounded-2xl border border-accent/30 bg-accent/10 w-[calc(100%-2rem)] text-left transition-all hover:border-accent/50 animate-fade-up"
    >
      <p className="section-label text-accent mb-2">Active Token</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-100">{company.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">Token #{token.tokenNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-display font-bold text-amber-token">
            {wait > 0 ? `~${wait} min` : 'Soon!'}
          </p>
          <p className="text-xs text-slate-400">est. wait</p>
        </div>
      </div>
    </button>
  )
}

function CompanySearchCard({ company: c, myTokenNumber, onClick, style }: {
  company: Company; myTokenNumber?: number; onClick: () => void; style?: React.CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      className="list-item w-full text-left animate-fade-up"
      style={style}
    >
      <div
        className="w-12 h-12 rounded-[14px] flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
        style={{ background: c.allowTokens ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#991b1b,#EF4444)' }}
      >
        {c.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-100 truncate">{c.name}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">📍 {c.address}</p>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          <Badge color={c.allowTokens ? 'green' : 'red'}>
            {c.allowTokens ? '● Open' : '● Closed'}
          </Badge>
          <Badge color="amber">Now: #{c.currentToken || '—'}</Badge>
          {myTokenNumber && <Badge color="blue">My: #{myTokenNumber}</Badge>}
        </div>
      </div>
      <span className="text-slate-500 text-lg">›</span>
    </button>
  )
}
