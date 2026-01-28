import { createClient } from '@supabase/supabase-js'

// Support both Vite-style (import.meta.env) and CRA-style (process.env.REACT_APP_*) vars
const viteUrl = import.meta.env?.VITE_SUPABASE_URL
const viteAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY
const legacyUrl = typeof process !== 'undefined' ? process.env?.REACT_APP_SUPABASE_URL : undefined
const legacyAnonKey = typeof process !== 'undefined' ? process.env?.REACT_APP_SUPABASE_ANON_KEY : undefined
const legacySiteUrl = typeof process !== 'undefined' ? process.env?.REACT_APP_SITE_URL : undefined

const supabaseUrl = legacyUrl || viteUrl
const supabaseAnonKey = legacyAnonKey || viteAnonKey

const resolveSiteUrl = () => {
  const viteSiteUrl =
    import.meta.env?.VITE_SITE_URL ||
    import.meta.env?.VITE_PUBLIC_SITE_URL ||
    import.meta.env?.VITE_APP_URL
  const raw = legacySiteUrl || viteSiteUrl
  if (raw) {
    return raw.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'http://localhost:5173'
}

let supabase
let SUPABASE_ENABLED = true

if (!supabaseUrl || !supabaseAnonKey) {
  SUPABASE_ENABLED = false
  const error = new Error('Supabase is not configured. Set VITE_SUPABASE_* (frontend) and related backend env vars to enable cloud notes/auth.')
  console.warn(error.message)

  const disabledResult = { data: { session: null }, error }
  const noopSubscription = {
    data: {
      subscription: {
        unsubscribe() {}
      }
    }
  }

  supabase = {
    auth: {
      async getSession() {
        return disabledResult
      },
      onAuthStateChange() {
        return noopSubscription
      },
      async signInWithPassword() {
        return { data: null, error }
      },
      async signInWithOAuth() {
        return { data: null, error }
      },
      async signUp() {
        return { data: null, error }
      },
      async signOut() {
        return { error }
      }
    }
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase, SUPABASE_ENABLED }
export { resolveSiteUrl }
