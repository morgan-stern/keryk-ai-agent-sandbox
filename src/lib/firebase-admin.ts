import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin
function initAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const clientId = process.env.FIREBASE_CLIENT_ID || '109852634523617686174'
    
    if (privateKey && clientEmail && projectId) {
      try {
        // Create service account object
        const serviceAccount = {
          type: 'service_account',
          project_id: projectId,
          private_key_id: privateKeyId || 'default',
          private_key: privateKey.replace(/\\n/g, '\n'),
          client_email: clientEmail,
          client_id: clientId,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`
        }
        
        initializeApp({
          credential: cert(serviceAccount as any),
          projectId: projectId
        })
        console.log('Firebase Admin initialized with service account')
      } catch (error) {
        console.error('Error initializing Firebase Admin:', error)
        throw error
      }
    } else {
      // Fallback to projectId only (limited functionality)
      console.warn('Firebase Admin SDK initialized without full credentials - some features may not work')
      console.log('Using projectId:', projectId)
      initializeApp({
        projectId: projectId,
      })
    }
  }
}

initAdmin()

export const adminAuth = getAuth()
export const adminDb = getFirestore()