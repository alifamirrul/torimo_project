import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { resolveSiteUrl, supabase } from '../supabaseClient'

function resolveApiBase() {
  const envBase = import.meta?.env?.VITE_API_BASE
  if (envBase) {
    return envBase.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location
    if (port && port !== '8000' && port !== '80' && port !== '443') {
      return `${protocol}//${hostname}:8000`
    }
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`
  }
  return 'http://127.0.0.1:8000'
}

const API_BASE = resolveApiBase()
const PENDING_PROFILE_STORAGE_KEY = 'torimo_pending_profiles_v1'

const readPendingProfileDrafts = () => {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const raw = window.localStorage.getItem(PENDING_PROFILE_STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (err) {
    console.warn('Failed to parse pending profile drafts', err)
    return {}
  }
}

const writePendingProfileDrafts = (drafts) => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(PENDING_PROFILE_STORAGE_KEY, JSON.stringify(drafts))
  } catch (err) {
    console.warn('Failed to persist pending profile drafts', err)
  }
}

const storePendingProfileDraft = (userId, draft) => {
  if (!userId || typeof draft !== 'object' || draft === null) {
    return
  }
  const drafts = readPendingProfileDrafts()
  drafts[userId] = { ...draft, storedAt: Date.now() }
  writePendingProfileDrafts(drafts)
}

const retrievePendingProfileDraft = (userId) => {
  if (!userId) {
    return null
  }
  const drafts = readPendingProfileDrafts()
  const draft = drafts[userId]
  if (!draft) {
    return null
  }
  return {
    username: draft.username || '',
    profile: draft.profile || {},
    storedAt: draft.storedAt || null,
  }
}

const deletePendingProfileDraft = (userId) => {
  if (!userId) {
    return
  }
  const drafts = readPendingProfileDrafts()
  if (!(userId in drafts)) {
    return
  }
  delete drafts[userId]
  writePendingProfileDrafts(drafts)
}

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const buildProfilePayload = (supabaseUserId, username, profile = {}) => {
  if (!supabaseUserId) {
    throw new Error('Supabase user ID is required.')
  }

  return {
    supabase_user_id: supabaseUserId,
    username: (username || '').trim(),
    age: toNumberOrNull(profile.age),
    gender: typeof profile.gender === 'string' ? profile.gender.trim() : profile.gender || '',
    height_cm: toNumberOrNull(profile.height_cm),
    current_weight_kg: toNumberOrNull(profile.current_weight_kg),
    target_weight_kg: toNumberOrNull(profile.target_weight_kg),
    goal: typeof profile.goal === 'string' ? profile.goal.trim() : profile.goal || '',
    activity_level: typeof profile.activity_level === 'string' ? profile.activity_level.trim() : profile.activity_level || '',
    agreed_to_terms: Boolean(profile.agreed_to_terms),
  }
}

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) return
      if (sessionError) {
        setError(sessionError.message)
      }
      setSession(data?.session ?? null)
      setUser(data?.session?.user ?? null)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription?.subscription.unsubscribe()
    }
  }, [])

  const getAccessToken = useCallback(() => session?.access_token ?? null, [session])

  const buildAuthHeaders = useCallback((extraHeaders = {}, tokenOverride = null) => {
    const token = tokenOverride ?? getAccessToken()
    if (!token) {
      throw new Error('Supabaseセッションが見つかりません。再度サインインしてください。')
    }
    return {
      ...extraHeaders,
      Authorization: `Bearer ${token}`,
    }
  }, [getAccessToken])

  const signInWithPassword = useCallback(async ({ email, password }) => {
    setError(null)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      throw signInError
    }
    return data
  }, [])

  const signInWithOAuth = useCallback(async (provider = 'github') => {
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider })
    if (oauthError) {
      setError(oauthError.message)
      throw oauthError
    }
  }, [])

  const registerUser = useCallback(async ({ email, password, username, profile = {} }) => {
    setError(null)
    const sanitizedUsername = (username || '').trim() || (email.includes('@') ? email.split('@')[0] : email)
    const profileMetadata = {
      username: sanitizedUsername,
      age: toNumberOrNull(profile.age),
      gender: typeof profile.gender === 'string' ? profile.gender.trim() : profile.gender || '',
      height_cm: toNumberOrNull(profile.height_cm),
      current_weight_kg: toNumberOrNull(profile.current_weight_kg),
      target_weight_kg: toNumberOrNull(profile.target_weight_kg),
      goal: typeof profile.goal === 'string' ? profile.goal.trim() : profile.goal || '',
      activity_level: typeof profile.activity_level === 'string' ? profile.activity_level.trim() : profile.activity_level || '',
      agreed_to_terms: Boolean(profile.agreed_to_terms),
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profileMetadata,
        emailRedirectTo: `${resolveSiteUrl()}/email-confirmed`,
      },
    })
    if (signUpError) {
      setError(signUpError.message)
      throw signUpError
    }

    const supabaseUserId = data?.user?.id
    if (!supabaseUserId) {
      const missingIdError = new Error('Unable to determine Supabase user ID.')
      setError(missingIdError.message)
      throw missingIdError
    }

    const payload = buildProfilePayload(supabaseUserId, sanitizedUsername, profile)
    const { supabase_user_id: _ignored, username: _ignoredName, ...profileFields } = payload
    const pendingDraft = {
      username: sanitizedUsername,
      profile: profileFields,
    }

    let accessToken = data?.session?.access_token ?? null
    if (!accessToken) {
      accessToken = getAccessToken()
    }
    if (!accessToken) {
      const { data: latestSession } = await supabase.auth.getSession()
      accessToken = latestSession?.session?.access_token ?? null
    }

    if (!accessToken) {
      storePendingProfileDraft(supabaseUserId, pendingDraft)
      return {
        user: data.user,
        profile: null,
        created: false,
        pendingProfileDraft: true,
      }
    }

    const response = await fetch(`${API_BASE}/api/user-profiles/`, {
      method: 'POST',
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }, accessToken),
      body: JSON.stringify(payload),
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = body?.detail || body?.error || 'Unable to create user profile.'
      const apiError = new Error(message)
      setError(apiError.message)
      throw apiError
    }

    deletePendingProfileDraft(supabaseUserId)

    return {
      user: data.user,
      profile: body?.profile ?? body,
      created: body?.created ?? true,
      pendingProfileDraft: false,
    }
  }, [buildAuthHeaders, getAccessToken])

  const signOut = useCallback(async () => {
    setError(null)
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
      throw signOutError
    }
  }, [])

  const saveProfile = useCallback(async ({ supabaseUserId, username, profile = {} }) => {
    setError(null)
    const payload = buildProfilePayload(supabaseUserId, username, profile)

    const response = await fetch(`${API_BASE}/api/user-profiles/`, {
      method: 'POST',
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = body?.detail || body?.error || 'Unable to update user profile.'
      throw new Error(message)
    }

    deletePendingProfileDraft(supabaseUserId)

    return body?.profile ?? body
  }, [buildAuthHeaders])

  const fetchProfile = useCallback(async (supabaseUserId) => {
    if (!supabaseUserId) {
      return null
    }

    const url = new URL(`${API_BASE}/api/user-profiles/`)
    url.searchParams.set('supabase_user_id', supabaseUserId)

    const response = await fetch(url.toString(), {
      headers: buildAuthHeaders(),
    })
    if (response.status === 404) {
      return null
    }

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = body?.detail || body?.error || 'Unable to load user profile.'
      throw new Error(message)
    }

    return body?.profile ?? body
  }, [buildAuthHeaders])

  const getPendingProfileDraftMemo = useCallback(
    (supabaseUserId) => retrievePendingProfileDraft(supabaseUserId),
    [],
  )
  const clearPendingProfileDraftMemo = useCallback(
    (supabaseUserId) => deletePendingProfileDraft(supabaseUserId),
    [],
  )

  const value = useMemo(() => ({
    user,
    session,
    loading,
    error,
    signInWithPassword,
    signInWithOAuth,
    registerUser,
    signOut,
    saveProfile,
    fetchProfile,
    getAccessToken,
    getPendingProfileDraft: getPendingProfileDraftMemo,
    clearPendingProfileDraft: clearPendingProfileDraftMemo,
  }), [
    user,
    session,
    loading,
    error,
    signInWithPassword,
    signInWithOAuth,
    registerUser,
    signOut,
    saveProfile,
    fetchProfile,
    getAccessToken,
    getPendingProfileDraftMemo,
    clearPendingProfileDraftMemo,
  ])

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
