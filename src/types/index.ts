// src/types/index.ts

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface Certificate {
  url: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  since: string;
  timings: string;
  address: string;
  lat: number | null;
  lng: number | null;
  ownerId: string;
  certUrls: string[];
  certCount: number;
  totalTokens: number;
  currentToken: number;
  allowTokens: boolean;
  estimatedMinPerToken: number;
  lastResetDate: string;
  createdAt?: unknown;
}

export interface Token {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  tokenNumber: number;
  date: string;
  patientPhotoUrl: string | null;
  cancelled: boolean;
  done: boolean;
  estimatedWaitMin: number;
  createdAt?: unknown;
}

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  fullAddress: string;
  lat: number | null;
  lng: number | null;
}

export interface CompanyFormData {
  name: string;
  since: string;
  timings: string;
  address: string;
  lat: number | null;
  lng: number | null;
  certs: File[];
}

export type Screen =
  | 'login'
  | 'home'
  | 'company-list'
  | 'company-detail-admin'
  | 'add-company'
  | 'user-search'
  | 'company-detail-user';
