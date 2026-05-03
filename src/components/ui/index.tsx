// src/components/ui/index.tsx
import React, { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

// ── Button ────────────────────────────────────────────────────────────────────
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'success' | 'outline'
  loading?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', loading, children, className, disabled, ...props }: BtnProps) {
  const base = 'w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-gradient-to-br from-accent to-accent-2 text-white shadow-accent',
    ghost: 'bg-bg-3 border border-slate-border text-slate-300',
    danger: 'bg-gradient-to-br from-red-700 to-rose-token text-white',
    success: 'bg-gradient-to-br from-green-700 to-emerald-token text-white',
    outline: 'border border-accent text-accent bg-transparent',
  }
  return (
    <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="section-label">{label}</label>}
      <input
        className={clsx('field-input', error && 'border-rose-token', className)}
        {...props}
      />
      {error && <p className="text-xs text-rose-token">{error}</p>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeColor = 'green' | 'red' | 'blue' | 'amber' | 'purple'
interface BadgeProps { color: BadgeColor; children: ReactNode; className?: string }

const BADGE_COLORS: Record<BadgeColor, string> = {
  green: 'bg-emerald-muted text-emerald-400',
  red: 'bg-rose-muted text-rose-400',
  blue: 'bg-accent-muted text-accent',
  amber: 'bg-amber-muted text-amber-400',
  purple: 'bg-purple-500/15 text-purple-400',
}

export function Badge({ color, children, className }: BadgeProps) {
  return (
    <span className={clsx('badge', BADGE_COLORS[color], className)}>{children}</span>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
interface AvatarProps {
  name: string
  photoURL?: string | null
  size?: 'sm' | 'md' | 'lg'
  rounded?: string
}

export function Avatar({ name, photoURL, size = 'md', rounded = 'rounded-2xl' }: AvatarProps) {
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' }
  if (photoURL) {
    return (
      <img
        src={photoURL} alt={name}
        className={clsx('object-cover flex-shrink-0', sizes[size], rounded)}
      />
    )
  }
  return (
    <div className={clsx('avatar flex-shrink-0', sizes[size], rounded)}>
      {name[0]?.toUpperCase()}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('card', className)}>{children}</div>
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="stat-card flex-1">
      <div className={clsx('font-display font-bold text-3xl leading-none', color)}>{value}</div>
      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mt-1">{label}</div>
    </div>
  )
}

// ── Toggle / Switch ────────────────────────────────────────────────────────────
interface ToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
  sublabel?: string
}
export function Toggle({ checked, onChange, label, sublabel }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-semibold text-slate-100">{label}</div>
        {sublabel && <div className="text-xs text-slate-400 mt-0.5">{sublabel}</div>}
      </div>
      <button
        role="switch" aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'switch-track w-12 h-6 rounded-full transition-colors border',
          checked
            ? 'bg-emerald-token border-emerald-token'
            : 'bg-bg-3 border-slate-border',
        )}
      >
        <span className={clsx(
          'switch-thumb block w-5 h-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-0.5',
        )} />
      </button>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx('animate-spin text-accent', className || 'w-6 h-6')} />
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }: {
  message: string; type?: 'success' | 'error' | 'info'; onClose: () => void
}) {
  const colors = {
    success: 'bg-emerald-token/90',
    error: 'bg-rose-token/90',
    info: 'bg-accent/90',
  }
  return (
    <div
      className={clsx(
        'fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg animate-fade-up cursor-pointer max-w-xs text-center',
        colors[type],
      )}
      onClick={onClose}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {message}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        {children}
      </div>
    </div>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export function Navbar({ title, onBack, action }: {
  title: string; onBack?: () => void; action?: ReactNode
}) {
  return (
    <div className="navbar">
      {onBack && (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-bg-3 border border-slate-border flex items-center justify-center text-slate-300 hover:bg-bg-2 transition-colors"
        >
          ←
        </button>
      )}
      <span className="font-display font-semibold text-base text-slate-100 flex-1">{title}</span>
      {action}
    </div>
  )
}

// ── Progress ──────────────────────────────────────────────────────────────────
export function Progress({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label">{children}</p>
}
