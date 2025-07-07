import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate Firebase config
function validateFirebaseConfig() {
  const requiredKeys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]
  const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig])

  if (missingKeys.length > 0) {
    console.warn(`Missing Firebase config keys: ${missingKeys.join(", ")}`)
    return false
  }
  return true
}

let app: FirebaseApp | null = null
let auth: Auth | null = null

// Initialize Firebase with error handling
export function initializeFirebase(): { app: FirebaseApp | null; auth: Auth | null } {
  // Only initialize on client side
  if (typeof window === "undefined") {
    return { app: null, auth: null }
  }

  // Return existing instances if already initialized
  if (app && auth) {
    return { app, auth }
  }

  try {
    // Validate config before initialization
    if (!validateFirebaseConfig()) {
      console.error("Firebase config is invalid or incomplete")
      return { app: null, auth: null }
    }

    // Initialize Firebase app
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApp()
    }

    // Initialize Auth
    if (app) {
      auth = getAuth(app)
    }

    return { app, auth }
  } catch (error) {
    console.error("Firebase initialization failed:", error)
    return { app: null, auth: null }
  }
}

// Export getter functions instead of direct instances
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null

  const { auth } = initializeFirebase()
  return auth
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null

  const { app } = initializeFirebase()
  return app
}
