// src/services/firebase.ts
// ─────────────────────────────────────────────────────────────────────────────
// SETUP:
//  1. Create a Firebase project at https://console.firebase.google.com
//  2. Add a Web App → copy the config below
//  3. Enable: Authentication → Google, Firestore, Storage
//  4. Replace firebaseConfig values with your project's config
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  onAuthStateChanged, signOut as fbSignOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import {
  getFirestore, doc, setDoc, getDoc, collection,
  query, where, orderBy, onSnapshot, addDoc,
  updateDoc, serverTimestamp, writeBatch,
  getDocs, type Unsubscribe,
} from 'firebase/firestore'
import {
  getStorage, ref, uploadBytes, getDownloadURL,
} from 'firebase/storage'
import type { Company, Token, User } from '../types'

// ── Config ──────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAzOfJbA7kTRJCsTUV2D7wvdHBzjfS_z_g",
  authDomain: "token-app-1411e.firebaseapp.com",
  projectId: "token-app-1411e",
  storageBucket: "token-app-1411e.firebasestorage.app",
  messagingSenderId: "276697680985",
  appId: "1:276697680985:web:3693679c8ff25b44c93548",
  measurementId: "G-ZX85C61316"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// ── Collections ──────────────────────────────────────────────────────────────
export const USERS = 'users'
export const COMPANIES = 'companies'
export const TOKENS = 'tokens'

// ── Auth ─────────────────────────────────────────────────────────────────────
export const signInWithGoogle = async (): Promise<void> => {
  const provider = new GoogleAuthProvider()
  await signInWithPopup(auth, provider)
}

export const signOut = (): Promise<void> => fbSignOut(auth)

export const onAuthChanged = (cb: (u: FirebaseUser | null) => void): Unsubscribe =>
  onAuthStateChanged(auth, cb)

export const saveUserProfile = async (user: FirebaseUser): Promise<void> => {
  const ref = doc(db, USERS, user.uid)
  await setDoc(ref, {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// ── Companies ────────────────────────────────────────────────────────────────
export const createCompany = async (
  data: Omit<Company, 'id' | 'totalTokens' | 'currentToken' | 'allowTokens' | 'estimatedMinPerToken' | 'lastResetDate' | 'createdAt'>,
): Promise<Company> => {
  const ref = doc(collection(db, COMPANIES))
  const company: Company = {
    ...data,
    id: ref.id,
    totalTokens: 0,
    currentToken: 1,
    allowTokens: false,
    estimatedMinPerToken: 5,
    lastResetDate: new Date().toDateString(),
  }
  await setDoc(ref, { ...company, createdAt: serverTimestamp() })
  return company
}

export const updateCompany = async (
  companyId: string,
  updates: Partial<Company>,
): Promise<void> => {
  await updateDoc(doc(db, COMPANIES, companyId), updates as Record<string, unknown>)
}

export const subscribeToCompany = (
  companyId: string,
  cb: (c: Company | null) => void,
): Unsubscribe =>
  onSnapshot(doc(db, COMPANIES, companyId), (snap) =>
    cb(snap.exists() ? (snap.data() as Company) : null))

export const subscribeToOwnerCompanies = (
  ownerId: string,
  cb: (list: Company[]) => void,
): Unsubscribe => {
  const q = query(collection(db, COMPANIES), where('ownerId', '==', ownerId))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as Company)))
}

export const subscribeToAllCompanies = (cb: (list: Company[]) => void): Unsubscribe => {
  return onSnapshot(collection(db, COMPANIES), (snap) =>
    cb(snap.docs.map((d) => d.data() as Company)))
}

export const checkAndResetDaily = async (company: Company): Promise<void> => {
  const today = new Date().toDateString()
  if (company.lastResetDate !== today) {
    await updateCompany(company.id, {
      currentToken: 1,
      totalTokens: 0,
      allowTokens: false,
      lastResetDate: today,
    })
  }
}

// ── Tokens ───────────────────────────────────────────────────────────────────
export const createToken = async (
  data: Omit<Token, 'id' | 'cancelled' | 'done' | 'createdAt'>,
): Promise<Token> => {
  const ref = doc(collection(db, TOKENS))
  const token: Token = { ...data, id: ref.id, cancelled: false, done: false }
  await setDoc(ref, { ...token, createdAt: serverTimestamp() })
  return token
}

export const cancelToken = async (tokenId: string): Promise<void> => {
  await updateDoc(doc(db, TOKENS, tokenId), { cancelled: true })
}

export const markTokenDone = async (
  tokenId: string,
  companyId: string,
  nextToken: number,
): Promise<void> => {
  const batch = writeBatch(db)
  batch.update(doc(db, TOKENS, tokenId), { done: true })
  batch.update(doc(db, COMPANIES, companyId), { currentToken: nextToken })
  await batch.commit()
}

export const subscribeToCompanyTokens = (
  companyId: string,
  cb: (tokens: Token[]) => void,
): Unsubscribe => {
  const today = new Date().toDateString()
  const q = query(
    collection(db, TOKENS),
    where('companyId', '==', companyId),
    where('date', '==', today),
    orderBy('tokenNumber', 'asc'),
  )
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as Token)))
}

export const subscribeToUserTokens = (
  userId: string,
  cb: (tokens: Token[]) => void,
): Unsubscribe => {
  const today = new Date().toDateString()
  const q = query(
    collection(db, TOKENS),
    where('userId', '==', userId),
    where('date', '==', today),
    where('cancelled', '==', false),
  )
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as Token)))
}

// ── Storage ───────────────────────────────────────────────────────────────────
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export const uploadPatientPhoto = (file: File, tokenId: string): Promise<string> =>
  uploadFile(file, `patient_photos/${tokenId}.jpg`)

export const uploadCertificate = (file: File, companyId: string, i: number): Promise<string> =>
  uploadFile(file, `certificates/${companyId}/cert_${i}.jpg`)
