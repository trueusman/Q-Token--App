// src/screens/user/CompanyUserScreen.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, Clock, Award, Upload, XCircle } from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import {
  Navbar, StatCard, Badge, Button, Modal, Progress,
  Spinner, Toast,
} from '../../components/ui'
import {
  subscribeToCompany, subscribeToCompanyTokens,
  createToken, cancelToken, uploadPatientPhoto, db,
} from '../../services/firebase'
import { updateDoc, doc } from 'firebase/firestore'
import { scheduleTokenAlert, clearScheduledAlert } from '../../services/notifications'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import type { Company, Token } from '../../types'
import { useToast } from '../../hooks/useToast'

export default function CompanyUserScreen() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const { user } = useAuth()
  const { myTokens } = useApp()
  const { toast, show: showToast, hide: hideToast } = useToast()

  const [company, setCompany] = useState<Company | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [patientFile, setPatientFile] = useState<File | null>(null)
  const [patientPreview, setPatientPreview] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [booking, setBooking] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const myToken = myTokens.find(t => t.companyId === id && !t.cancelled)

  useEffect(() => {
    if (!id) return
    const u1 = subscribeToCompany(id, setCompany)
    const u2 = subscribeToCompanyTokens(id, setTokens)
    return () => { u1(); u2() }
  }, [id])

  // Reschedule notification on company/token update
  useEffect(() => {
    if (myToken && company) {
      scheduleTokenAlert(
        myToken.tokenNumber,
        company.currentToken || 1,
        company.estimatedMinPerToken || 5,
        company.name,
      )
    }
  }, [myToken?.tokenNumber, company?.currentToken])

  if (!company) return (
    <div className="app-shell items-center justify-center"><Spinner className="w-8 h-8" /></div>
  )

  const active = tokens.filter(t => !t.cancelled)
  const sold = active.length
  const tokensAhead = myToken ? Math.max(0, myToken.tokenNumber - (company.currentToken || 1)) : null
  const estWait = tokensAhead !== null ? tokensAhead * (company.estimatedMinPerToken || 5) : null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setPatientFile(f)
    setPatientPreview(URL.createObjectURL(f))
    setShowModal(true)
  }

  const confirmBook = async () => {
    if (!user || !company || !id) return
    if (!company.allowTokens) return showToast('Queue is closed today', 'error')
    if (!company.totalTokens) return showToast('Company hasn\'t set a limit yet', 'error')
    if (sold >= company.totalTokens) return showToast('All tokens sold out for today', 'error')
    if (myToken) return showToast('You already have an active token', 'error')

    setBooking(true)
    try {
      const tokenNumber = sold + 1
      // Create token immediately — don't wait for photo upload
      const newToken = await createToken({
        companyId: id,
        userId: user.uid,
        userName: user.displayName || 'User',
        userEmail: user.email || '',
        tokenNumber,
        date: new Date().toDateString(),
        patientPhotoUrl: null,
        estimatedWaitMin: tokenNumber * (company.estimatedMinPerToken || 5),
      })
      scheduleTokenAlert(tokenNumber, company.currentToken || 1, company.estimatedMinPerToken || 5, company.name)
      setShowModal(false)
      setPatientFile(null)
      setPatientPreview(null)
      showToast(`Token #${tokenNumber} booked! 🎉`)
      // Upload photo in background after token is created
      if (patientFile) {
        uploadPatientPhoto(patientFile, newToken.id)
          .then(url => updateDoc(doc(db, 'tokens', newToken.id), { patientPhotoUrl: url }))
          .catch(console.error)
      }
    } catch {
      showToast('Failed to book token', 'error')
    } finally {
      setBooking(false)
    }
  }

  const handleCancel = async () => {
    if (!myToken) return
    if (!window.confirm('Cancel your token? This cannot be undone.')) return
    await cancelToken(myToken.id)
    clearScheduledAlert()
    showToast('Token cancelled')
  }

  return (
    <div className="app-shell">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Navbar title={company.name} onBack={() => nav('/search')} />

      <div className="flex-1 overflow-y-auto p-4 pb-10 flex flex-col gap-3">

        {/* Company info */}
        <div className="card animate-fade-up">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl font-display flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
            >
              {company.name[0]}
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-100">{company.name}</h2>
              <p className="text-xs text-slate-400">Est. {company.since}</p>
              <Badge color={company.allowTokens ? 'green' : 'red'} className="mt-1.5">
                {company.allowTokens ? '● Open Today' : '● Closed Today'}
              </Badge>
            </div>
          </div>
          <div className="h-px bg-slate-border mb-3" />
          <div className="flex items-start gap-2 text-sm text-slate-300 mb-2">
            <Clock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <span>{company.timings}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-300 mb-3">
            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <span>{company.address}</span>
          </div>
          {company.certUrls?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <p className="section-label mb-0">Certificates</p>
              </div>
              <div className="flex gap-2">
                {company.certUrls.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-border" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="map-container animate-fade-up animate-delay-100">
          {company.lat && company.lng ? (
            <MapContainer
              center={[company.lat, company.lng]} zoom={15}
              className="w-full h-full" zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="© CartoDB"
              />
              <Marker position={[company.lat, company.lng]} />
            </MapContainer>
          ) : (
            <div className="w-full h-full bg-bg-3 flex flex-col items-center justify-center gap-2">
              <MapPin className="w-6 h-6 text-slate-500" />
              <p className="text-xs text-slate-400">{company.address}</p>
              <p className="text-xs text-slate-500">Foursquare API</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5 animate-fade-up animate-delay-200">
          <StatCard label="Total Tokens" value={company.totalTokens || '—'} color="text-accent" />
          <StatCard label="Now Serving" value={company.currentToken || '—'} color="text-emerald-token" />
          <StatCard label="Booked" value={sold} color="text-amber-token" />
          <StatCard label="Remaining" value={Math.max(0, company.totalTokens - sold)} color="text-slate-300" />
        </div>

        {/* Progress */}
        {company.totalTokens > 0 && (
          <div className="card animate-fade-up animate-delay-300">
            <Progress value={company.currentToken - 1} max={company.totalTokens} />
            <div className="flex justify-between text-xs text-slate-500 mt-1.5">
              <span>Token 1</span><span>of {company.totalTokens}</span>
            </div>
          </div>
        )}

        {/* My token / book section */}
        {myToken ? (
          <div className="card border-accent/40 animate-fade-up animate-delay-400">
            <p className="section-label text-accent">Your Token</p>
            <div className="flex items-center gap-5 mb-4">
              {/* Token ring */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-accent animate-pulse-ring"
                style={{ background: 'rgba(79,142,247,0.1)' }}
              >
                <div className="text-center">
                  <div className="font-display font-bold text-xl text-accent leading-none">
                    #{myToken.tokenNumber}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">token</div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400">Estimated wait</p>
                <p className="font-display font-bold text-2xl text-amber-token mt-0.5">
                  {estWait === 0 ? 'Your turn!' : `~${estWait} min`}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {tokensAhead === 0 ? 'You\'re next!' : `${tokensAhead} people ahead`}
                </p>
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  🔔 Alert 10 min before your turn
                </p>
              </div>
            </div>
            <Button variant="danger" onClick={handleCancel}>
              <XCircle className="w-4 h-4" /> Cancel Token
            </Button>
          </div>
        ) : (
          <div className="card animate-fade-up animate-delay-400">
            <p className="font-display font-semibold text-slate-100 mb-1">Book a Token</p>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Upload a photo of the patient to secure your spot in the queue
            </p>
            <input
              ref={fileRef} type="file" accept="image/*"
              className="hidden" onChange={handleFileChange}
            />
            <label
              onClick={() => fileRef.current?.click()}
              className="upload-zone cursor-pointer"
            >
              {patientPreview ? (
                <img src={patientPreview} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-accent" />
              ) : (
                <Upload className="w-8 h-8 text-slate-500" />
              )}
              <p className="text-sm font-semibold text-slate-300">
                {patientPreview ? 'Photo selected — Tap to change' : 'Upload Patient Photo'}
              </p>
              <p className="text-xs text-slate-500">Tap to select image</p>
            </label>
            <button
              onClick={() => patientFile ? setShowModal(true) : fileRef.current?.click()}
              disabled={!company.allowTokens}
              className="mt-3 w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4F8EF7, #7C3AED)', boxShadow: '0 4px 20px rgba(79,142,247,0.3)' }}
            >
              {!company.allowTokens ? 'Queue Closed Today' : 'Get My Token'}
            </button>
          </div>
        )}
      </div>

      {/* Booking confirmation modal */}
      <Modal open={showModal} onClose={() => !booking && setShowModal(false)}>
        <div className="text-center">
          <p className="font-display font-bold text-xl text-slate-100 mb-5">Confirm Booking</p>
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-accent bg-bg-3 flex items-center justify-center">
            {patientPreview
              ? <img src={patientPreview} alt="" className="w-full h-full object-cover" />
              : <span className="text-4xl">👤</span>
            }
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Patient photo uploaded.<br />Your token number will be assigned.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={confirmBook} loading={booking} className="flex-1">Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
