// src/screens/company/AddCompanyScreen.tsx
import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, MapPin, Upload, Image as ImgIcon } from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { Navbar, Button, Input, Toast } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { createCompany, uploadCertificate, updateCompany } from '../../services/firebase'
import { searchPlaces } from '../../services/foursquare'
import type { PlaceResult, CompanyFormData } from '../../types'
import { useToast } from '../../hooks/useToast'

export default function AddCompanyScreen() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { toast, show: showToast, hide: hideToast } = useToast()
  const debounce = useRef<ReturnType<typeof setTimeout>>()

  const [form, setForm] = useState<CompanyFormData>({
    name: '', since: '', timings: '', address: '', lat: null, lng: null, certs: [],
  })
  const [addrQuery, setAddrQuery] = useState('')
  const [places, setPlaces] = useState<PlaceResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [certPreviews, setCertPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyFormData, string>>>({})

  const set = <K extends keyof CompanyFormData>(key: K, val: CompanyFormData[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleAddrChange = (val: string) => {
    setAddrQuery(val)
    set('address', val)
    clearTimeout(debounce.current)
    if (val.length < 3) { setPlaces([]); return }
    debounce.current = setTimeout(async () => {
      setSearchLoading(true)
      const results = await searchPlaces(val)
      setPlaces(results)
      setSearchLoading(false)
    }, 400)
  }

  const selectPlace = (p: PlaceResult) => {
    setAddrQuery(p.fullAddress)
    set('address', p.fullAddress)
    set('lat', p.lat)
    set('lng', p.lng)
    setPlaces([])
  }

  const handleCerts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3 - form.certs.length)
    const newCerts = [...form.certs, ...files].slice(0, 3)
    set('certs', newCerts)
    const previews = newCerts.map(f => URL.createObjectURL(f))
    setCertPreviews(previews)
    if (newCerts.length === 3) showToast('Maximum 3 certificates added')
  }

  const removeCert = (i: number) => {
    const newCerts = form.certs.filter((_, idx) => idx !== i)
    set('certs', newCerts)
    setCertPreviews(newCerts.map(f => URL.createObjectURL(f)))
  }

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.since.trim()) e.since = 'Required'
    if (!form.timings.trim()) e.timings = 'Required'
    if (!form.address.trim()) e.address = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate() || !user) return
    setSaving(true)
    try {
      const company = await createCompany({
        name: form.name.trim(), since: form.since.trim(),
        timings: form.timings.trim(), address: form.address.trim(),
        lat: form.lat, lng: form.lng,
        ownerId: user.uid,
        certUrls: [], certCount: form.certs.length,
      })
      // Upload certs in parallel
      if (form.certs.length > 0) {
        const urls = await Promise.all(
          form.certs.map((f, i) => uploadCertificate(f, company.id, i))
        )
        await updateCompany(company.id, { certUrls: urls })
      }
      showToast(`"${form.name}" created!`, 'success')
      setTimeout(() => nav('/company'), 800)
    } catch (err) {
      showToast('Failed to create company', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app-shell">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Navbar title="Add Company" onBack={() => nav('/company')} />

      <div className="flex-1 overflow-y-auto p-4 pb-16">
        <div className="flex flex-col gap-4">

          <Input label="Company Name *" placeholder="e.g. City Medical Center"
            value={form.name} onChange={e => set('name', e.target.value)}
            error={errors.name} />

          <Input label="Established Since *" placeholder="e.g. 2010" type="number"
            value={form.since} onChange={e => set('since', e.target.value)}
            error={errors.since} />

          <Input label="Working Hours *" placeholder="e.g. 9:00 AM – 5:00 PM"
            value={form.timings} onChange={e => set('timings', e.target.value)}
            error={errors.timings} />

          {/* Address search */}
          <div className="flex flex-col gap-1.5">
            <label className="section-label">Address * (Foursquare Search)</label>
            <div className="relative">
              <div className="flex items-center gap-2 field-input pr-3">
                <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <input
                  className="flex-1 bg-transparent outline-none text-slate-100 text-sm placeholder-slate-500"
                  placeholder="Search address..."
                  value={addrQuery}
                  onChange={e => handleAddrChange(e.target.value)}
                />
                {searchLoading && (
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              {places.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-slate-border rounded-xl overflow-hidden z-20 shadow-card">
                  {places.map(p => (
                    <button key={p.id} onClick={() => selectPlace(p)}
                      className="w-full text-left px-4 py-3 border-b border-slate-border last:border-0 hover:bg-bg-3 transition-colors">
                      <p className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />{p.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 ml-5">{p.fullAddress}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map preview */}
            <div className="map-container mt-2">
              {form.lat && form.lng ? (
                <MapContainer
                  center={[form.lat, form.lng]} zoom={15}
                  className="w-full h-full" zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution="© CartoDB"
                  />
                  <Marker position={[form.lat, form.lng]} />
                </MapContainer>
              ) : (
                <div className="w-full h-full bg-bg-3 flex flex-col items-center justify-center gap-2">
                  <MapPin className="w-6 h-6 text-slate-500" />
                  <p className="text-xs text-slate-500">Map preview after selecting address</p>
                </div>
              )}
            </div>
          </div>

          {/* Certificates */}
          <div className="flex flex-col gap-2">
            <label className="section-label">Certificates ({form.certs.length}/3)</label>
            <label className="upload-zone">
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={handleCerts} disabled={form.certs.length >= 3} />
              <ImgIcon className="w-8 h-8 text-slate-500" />
              <p className="text-sm font-semibold text-slate-300">
                {form.certs.length > 0 ? `${form.certs.length} selected` : 'Upload Certificates'}
              </p>
              <p className="text-xs text-slate-500">Max 3 images</p>
            </label>
            {certPreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-1">
                {certPreviews.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-border" />
                    <button
                      onClick={() => removeCert(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-token text-white text-xs flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button onClick={save} loading={saving} className="mt-2">
            Save Company
          </Button>
        </div>
      </div>
    </div>
  )
}
