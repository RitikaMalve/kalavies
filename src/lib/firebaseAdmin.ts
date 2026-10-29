import { getApps, initializeApp, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kalavies'
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined

let adminApp: App | null = null

if (!getApps().length) {
  try {
    if (clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      })
    }
  } catch (error) {
    console.warn('Firebase admin initialization notice:', error)
  }
} else {
  adminApp = getApps()[0]
}

export const adminAuth = adminApp ? getAuth(adminApp) : null
export const adminStorage = adminApp ? getStorage(adminApp) : null
export const adminDb = adminApp ? getFirestore(adminApp) : null
export default adminApp
