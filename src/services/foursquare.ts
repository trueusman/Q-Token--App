// src/services/foursquare.ts
// Replace with your Foursquare API key from developer.foursquare.com
const API_KEY = 'YOUR_FOURSQUARE_API_KEY'
const BASE = 'https://api.foursquare.com/v3'

import type { PlaceResult } from '../types'

interface FsqPlace {
  fsq_id: string
  name: string
  location?: {
    formatted_address?: string
    address?: string
    locality?: string
    country?: string
  }
  geocodes?: {
    main?: { latitude: number; longitude: number }
  }
}

const format = (p: FsqPlace): PlaceResult => ({
  id: p.fsq_id,
  name: p.name,
  address: p.location?.address || p.location?.formatted_address || '',
  fullAddress: [p.location?.address, p.location?.locality, p.location?.country]
    .filter(Boolean).join(', '),
  lat: p.geocodes?.main?.latitude ?? null,
  lng: p.geocodes?.main?.longitude ?? null,
})

export const searchPlaces = async (
  query: string,
  near?: { lat: number; lng: number },
): Promise<PlaceResult[]> => {
  try {
    let url = `${BASE}/places/search?query=${encodeURIComponent(query)}&limit=8`
    if (near) url += `&ll=${near.lat},${near.lng}&radius=15000`
    const res = await fetch(url, {
      headers: { Accept: 'application/json', Authorization: API_KEY },
    })
    const data = await res.json() as { results?: FsqPlace[] }
    return (data.results ?? []).map(format)
  } catch {
    return []
  }
}
