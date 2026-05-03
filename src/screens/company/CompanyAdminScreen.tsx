// src/screens/company/CompanyAdminScreen.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import {
  Navbar, StatCard, Toggle, Button, Progress,
  Spinner, Toast, SectionLabel,
} from '../../components/ui'
import {
  subscribeToCompany, subscribeToCompanyTokens,
  updateCompany, markTokenDone,
} from '../../services/firebase'
import type { Company, Token } from '../../types'
import { useToast } from '../../hooks/useToast'

export default function CompanyAdminScreen() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const { toast, show: showToast, hide: hideToast } = useToast()

  const [company, setCompany] = useState<Company | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [totalInput, setTotalInput] = useState('')
  const [estInput, setEstInput] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!id) return
    const u1 = subscribeToCompany(id, (c) => {
      if (c) {
        setCompany(c)
        setTotalInput(c.totalTokens ? String(c.totalTokens) : '')
        setEstInput(c.estimatedMinPerToken ? String(c.estimatedMinPerToken) : '')
      }
    })
    const u2 = subscribeToCompanyTokens(id, setTokens)
    return () => { u1(); u2() }
  }, [id])

  if (!company) return (
    <div className="app-shell items-center justify-center"><Spinner className="w-8 h-8" /></div>
  )

  const active = tokens.filter(t => !t.cancelled)
  const sold = active.length
  const remaining = Math.max(0, company.totalTokens - sold)

  const setTotal = async () => {
    const v = parseInt(totalInput)
    if (!v || v < 1) return showToast('Enter a valid number', 'error')
    await updateCompany(company.id, { totalTokens: v, currentToken: company.currentToken || 1 })
    showToast(`Limit set to ${v} tokens`)
  }

  const setEst = async () => {
    const v = parseInt(estInput)
    if (!v || v < 1) return showToast('Enter valid minutes', 'error')
    await updateCompany(company.id, { estimatedMinPerToken: v })
    showToast(`Estimated time updated to ${v} min/token`)
  }

  const handleDone = async () => {
    if (!company.totalTokens) return showToast('Set total tokens first', 'error')
    const cur = company.currentToken || 1
    const doneToken = active.find(t => t.tokenNumber === cur)
    setProcessing(true)
    try {
      if (doneToken) {
        await markTokenDone(doneToken.id, company.id, Math.min(cur + 1, company.totalTokens))
      } else {
        await updateCompany(company.id, { currentToken: Math.min(cur + 1, company.totalTokens) })
      }
      showToast(`Token #${cur} completed ✓`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="app-shell">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Navbar title={company.name} onBack={() => nav('/company')} />

      <div className="flex-1 overflow-y-auto p-4 pb-10 flex flex-col gap-3">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Total Tokens" value={company.totalTokens || 0} color="text-accent" />
          <StatCard label="Now Serving" value={company.currentToken || '—'} color="text-emerald-token" />
          <StatCard label="Booked" value={sold} color="text-amber-token" />
          <StatCard label="Remaining" value={remaining} color="text-slate-300" />
        </div>

        {/* Allow toggle */}
        <div className="card">
          <Toggle
            checked={company.allowTokens}
            onChange={v => updateCompany(company.id, { allowTokens: v })}
            label="Accept Tokens Today"
            sublabel="Toggle to open or close queue"
          />
        </div>

        {/* Daily limit */}
        <div className="card flex flex-col gap-3">
          <SectionLabel>Daily Token Limit</SectionLabel>
          <div className="flex gap-2">
            <input
              type="number" min={1}
              value={totalInput}
              onChange={e => setTotalInput(e.target.value)}
              placeholder="e.g. 50"
              className="field-input flex-1 font-display font-bold text-xl"
            />
            <button
              onClick={setTotal}
              className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold shadow-accent whitespace-nowrap"
            >Set</button>
          </div>
        </div>

        {/* Current token + progress */}
        <div className="card flex flex-col gap-3">
          <SectionLabel>Current Queue Position</SectionLabel>
          <div
            className="font-display font-bold text-7xl text-center py-2"
            style={{
              background: 'linear-gradient(135deg, #4F8EF7, #7C3AED)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            {company.currentToken || '—'}
          </div>
          <Progress value={company.currentToken - 1} max={company.totalTokens || 1} />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Token 1</span>
            <span>of {company.totalTokens || 0}</span>
          </div>
          <Button variant="success" onClick={handleDone} loading={processing}>
            <CheckCircle className="w-4 h-4" /> Done — Next Token
          </Button>
        </div>

        {/* Est time */}
        <div className="card flex flex-col gap-3">
          <SectionLabel>Estimated Time per Token</SectionLabel>
          <div className="flex items-center gap-2">
            <input
              type="number" min={1}
              value={estInput}
              onChange={e => setEstInput(e.target.value)}
              placeholder="Minutes"
              className="field-input flex-1"
            />
            <span className="text-sm text-slate-400 whitespace-nowrap">min/token</span>
            <button
              onClick={setEst}
              className="px-4 py-2 rounded-xl border border-accent text-accent text-sm font-semibold whitespace-nowrap"
            >Save</button>
          </div>
        </div>

        {/* Token holders */}
        <div className="card">
          <SectionLabel>Token Holders ({sold})</SectionLabel>
          {active.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-5">No tokens booked yet</p>
          ) : (
            <div>
              {active.map(t => (
                <TokenRow key={t.id} token={t} currentToken={company.currentToken} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TokenRow({ token: t, currentToken }: { token: Token; currentToken: number }) {
  const isDone = t.done
  const isCurrent = t.tokenNumber === currentToken
  const status = isDone ? 'Done' : isCurrent ? 'Now' : 'Waiting'
  const statusCls = isDone
    ? 'bg-emerald-muted text-emerald-400'
    : isCurrent
      ? 'bg-amber-muted text-amber-400'
      : 'bg-accent-muted text-accent'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-border last:border-0">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        #{t.tokenNumber}
      </div>
      {t.patientPhotoUrl ? (
        <img src={t.patientPhotoUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="avatar w-9 h-9 rounded-full text-sm flex-shrink-0">{t.userName[0]}</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100 truncate">{t.userName}</p>
        <p className="text-xs text-slate-400 truncate">{t.userEmail}</p>
      </div>
      <span className={`badge ${statusCls}`}>{status}</span>
    </div>
  )
}
