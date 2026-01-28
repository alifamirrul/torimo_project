import React, { useEffect, useState, lazy, Suspense, useCallback, useRef } from 'react'
import BottomNav from './components/ui/BottomNav'
import { useAuth } from './hooks/useAuth'
import SignInPage from './pages/SignIn'
import NotesPage from './pages/Notes'
import ProfileEdit from './components/ProfileEdit'
import { supabase, SUPABASE_ENABLED } from './supabaseClient'

// Lazy-load views to avoid failing the whole app if a non-visible view has an import/runtime error
const SignupPage = lazy(() => import('./components/SignupPage'))
const MealManagement = lazy(() => import('./components/MealManagement'))
const AINutritionAssist = lazy(() => import('./components/AINutritionAssist'))
const HomeScreen = lazy(() => import('./components/HomeScreen2'))
const ProfileSettings = lazy(() => import('./components/ProfileSettings'))
const BodyDiagnosis = lazy(() => import('./components/BodyDiagnosis'))
const DiagnosisResult = lazy(() => import('./components/DiagnosisResult'))
const UpgradeModal = lazy(() => import('./components/UpgradeModal'))
const ExerciseAssist = lazy(() => import('./components/ExerciseAssist'))
const GoalsScreen = lazy(() => import('./components/GoalsScreen'))
const WeightHealth = lazy(() => import('./components/WeightHealth'))
const WeightCalendar = lazy(() => import('./components/WeightCalendar'))
const NutritionEducation = lazy(() => import('./components/NutritionEducation'))
const HelpSupport = lazy(() => import('./components/HelpSupport'))
const UpdatePasswordPage = lazy(() => import('./components/UpdatePasswordPage'))
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage'))
const EmailConfirmationPage = lazy(() => import('./components/EmailConfirmationPage'))
const SplashScreenWithCustomLogo = lazy(() => import('./components/SplashScreenWithCustomLogo'))

const DEFAULT_PROFILE_DATA = {
  name: '山田 太郎',
  age: 28,
  height: 170,
  weight: 70,
  goalWeight: 65,
  bodyType: '標準型',
  bmi: 24.2,
  message: '健康的に痩せたいです！',
  activityLevel: 'moderate',
  goalKey: 'maintain',
}

const GOAL_LABELS = {
  lose: '減量モード',
  maintain: '維持モード',
  gain: '筋量アップ',
}

const GOAL_MESSAGES = {
  lose: '余分な体脂肪を落とし、ヘルシーにシェイプアップしましょう。',
  maintain: '今のコンディションをキープできるようサポートします。',
  gain: '筋肉をつけて強くしなやかな身体を目指しましょう。',
}

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const metadataToProfileDraft = (metadata) => {
  if (!metadata || typeof metadata !== 'object') {
    return null
  }

  const sanitize = (value) => (typeof value === 'string' ? value.trim() : '')
  const draft = {
    username: sanitize(metadata.username || metadata.name || metadata.full_name || ''),
    profile: {
      age: toNumberOrNull(metadata.age),
      gender: sanitize(metadata.gender),
      height_cm: toNumberOrNull(metadata.height_cm),
      current_weight_kg: toNumberOrNull(metadata.current_weight_kg ?? metadata.weight),
      target_weight_kg: toNumberOrNull(metadata.target_weight_kg ?? metadata.goalWeight),
      goal: sanitize(metadata.goal),
      activity_level: sanitize(metadata.activity_level),
      agreed_to_terms: Boolean(metadata.agreed_to_terms),
    },
  }

  const hasProfileValues = Object.entries(draft.profile).some(([key, value]) => {
    if (key === 'agreed_to_terms') {
      return value === true
    }
    return value !== null && value !== ''
  })

  if (!draft.username && !hasProfileValues) {
    return null
  }

  return draft
}

const computeBmi = (heightCm, weightKg) => {
  if (!heightCm || !weightKg) {
    return DEFAULT_PROFILE_DATA.bmi
  }
  const meters = heightCm / 100
  if (!meters) {
    return DEFAULT_PROFILE_DATA.bmi
  }
  return Number((weightKg / (meters * meters)).toFixed(1))
}

const shapeProfileData = (profile, metadata = null) => {
  const metadataDraft = metadataToProfileDraft(metadata)
  const metadataProfile = metadataDraft
    ? { username: metadataDraft.username, ...metadataDraft.profile }
    : {}
  const merged = {
    ...metadataProfile,
    ...(profile || {}),
  }

  const name =
    (typeof merged.username === 'string' && merged.username.trim()) ||
    (typeof merged.name === 'string' && merged.name.trim()) ||
    (typeof merged.full_name === 'string' && merged.full_name.trim()) ||
    DEFAULT_PROFILE_DATA.name

  const age = toNumberOrNull(merged.age) ?? DEFAULT_PROFILE_DATA.age
  const height = toNumberOrNull(merged.height_cm) ?? DEFAULT_PROFILE_DATA.height
  const weight =
    toNumberOrNull(merged.current_weight_kg ?? merged.weight) ?? DEFAULT_PROFILE_DATA.weight
  const goalWeight =
    toNumberOrNull(merged.target_weight_kg ?? merged.goalWeight) ?? DEFAULT_PROFILE_DATA.goalWeight
  const goalKey = merged.goal || DEFAULT_PROFILE_DATA.goalKey
  const activityLevel = merged.activity_level || DEFAULT_PROFILE_DATA.activityLevel

  return {
    name,
    age,
    height,
    weight,
    goalWeight,
    bodyType: GOAL_LABELS[goalKey] || DEFAULT_PROFILE_DATA.bodyType,
    bmi: computeBmi(height, weight),
    message: GOAL_MESSAGES[goalKey] || DEFAULT_PROFILE_DATA.message,
    activityLevel,
    goalKey,
  }
}

console.log('App.jsx loaded')

export default function App(){
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = window.localStorage.getItem('torimo-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return 'light'
  })
  const [view, setView] = useState('home') // plus: 'exercise' | 'goals' | 'health' | 'education' | 'help'
  const [isPremium, setIsPremium] = useState(false)
  const [upgradeInFlight, setUpgradeInFlight] = useState(false)
  const [secureDestination, setSecureDestination] = useState(null)
  const [authMode, setAuthMode] = useState('signin')
  const [showWeightCalendar, setShowWeightCalendar] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const prevUserIdRef = useRef(null)
  // Temporary hard-coded user profile (replace with real user/auth later)
  const [userProfile] = useState({
    name: '田中太郎',
    gender: 'male',
    age: 28,
    height_cm: 175,
    weight_kg: 80,
    goal_calories: 2400,
    activity_level: 'moderate'
  })

  const [profileData, setProfileData] = useState(() => ({ ...DEFAULT_PROFILE_DATA }))

  const [profileImage, setProfileImage] = useState(null)

  const [diagnosisBodyType, setDiagnosisBodyType] = useState(null)
  const [diagnosisScore, setDiagnosisScore] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const {
    user: supabaseUser,
    signOut,
    fetchProfile,
    saveProfile,
    getPendingProfileDraft,
  } = useAuth()

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('torimo-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff')
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  console.log('Current view:', view)

  const isUpdatePasswordRoute = typeof window !== 'undefined' && window.location.pathname === '/update-password'
  const isEmailConfirmationRoute = typeof window !== 'undefined' && (() => {
    const pathname = window.location.pathname
    if (['/email-confirmed', '/confirm', '/auth/callback'].includes(pathname)) return true
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('type') === 'signup') return true
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
    return hashParams.get('type') === 'signup'
  })()

  if (isUpdatePasswordRoute) {
    return (
      <Suspense fallback={<div style={{ padding: 16 }}>読み込み中…</div>}>
        <UpdatePasswordPage onBack={() => window.location.assign('/')} />
      </Suspense>
    )
  }

  if (isEmailConfirmationRoute) {
    const handleConfirmationContinue = () => {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, '/')
      }
      if (supabaseUser) {
        setView('home')
      } else {
        setAuthMode('signin')
      }
    }

    return (
      <Suspense fallback={<div style={{ padding: 16 }}>読み込み中…</div>}>
        <EmailConfirmationPage theme={theme} onContinue={handleConfirmationContinue} />
      </Suspense>
    )
  }

  const requirePremiumView = (nextView) => {
    if (isPremium) {
      setView(nextView)
    } else {
      setShowUpgradeModal(true)
    }
  }

  const activeTabForView = (v) => {
    if (v === 'aiAssist') return 'meals'
    if (['home'].includes(v)) return 'home'
    if (['meals'].includes(v)) return 'meals'
    if (['exercise'].includes(v)) return 'exercise'
    if (['health'].includes(v)) return 'health'
    if (['goals'].includes(v)) return 'goals'
    if (['education'].includes(v)) return 'education'
    if (['help'].includes(v)) return 'help'
    if (['notes', 'supabaseSignIn'].includes(v)) return 'notes'
    return null
  }

  const ensureSupabaseAuth = (nextView) => {
    if (supabaseUser) {
      setView(nextView)
      return
    }
    setSecureDestination(nextView)
    setView('supabaseSignIn')
  }

  const handleNavigate = (key, meta = {}) => {
    setShowWeightCalendar(false)
    const requiresPremium = meta?.premium
    const requiresAuth = meta?.requiresAuth
    if (requiresPremium && !isPremium) {
      setShowUpgradeModal(true)
      return
    }
    if (requiresAuth) {
      ensureSupabaseAuth(key === 'notes' ? 'notes' : key)
      return
    }
    switch (key) {
      case 'home':
        setView('home'); break
      case 'meals':
        setView('meals'); break
      case 'exercise':
        setView('exercise'); break
      case 'health':
        setView('health'); break
      case 'goals':
        setView('goals'); break
      case 'education':
        setView('education'); break
      case 'help':
        setView('help'); break
      case 'notes':
        ensureSupabaseAuth('notes'); break
      default:
        break
    }
  }

  useEffect(() => {
    if (supabaseUser && secureDestination) {
      setView(secureDestination)
      setSecureDestination(null)
    }
  }, [supabaseUser, secureDestination])

  useEffect(() => {
    const previousUserId = prevUserIdRef.current
    const currentUserId = supabaseUser?.id || null

    if (!previousUserId && currentUserId) {
      setShowSplash(true)
    }

    if (previousUserId && !currentUserId) {
      setShowSplash(false)
    }

    prevUserIdRef.current = currentUserId
  }, [supabaseUser])

  useEffect(() => {
    let cancelled = false

    const syncPremiumStatus = async () => {
      if (!supabaseUser) {
        setIsPremium(false)
        return
      }
      if (!SUPABASE_ENABLED) {
        return
      }
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('plan_type, is_active')
        .eq('user_id', supabaseUser.id)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        console.warn('Failed to load premium status', error)
        setIsPremium(false)
        return
      }
      setIsPremium(Boolean(data?.is_active && data?.plan_type === 'premium'))
    }

    syncPremiumStatus()
    return () => {
      cancelled = true
    }
  }, [supabaseUser])

  const applyProfileFromServer = useCallback((profile) => {
    const metadata = supabaseUser?.user_metadata || null
    if (profile) {
      setProfileData(shapeProfileData(profile, metadata))
      return
    }

    if (metadataToProfileDraft(metadata)) {
      setProfileData(shapeProfileData(null, metadata))
      return
    }

    setProfileData({ ...DEFAULT_PROFILE_DATA })
  }, [supabaseUser])

  const restoreProfileFromDraft = useCallback(async () => {
    if (!supabaseUser) {
      return null
    }

    let draft = getPendingProfileDraft?.(supabaseUser.id) || null
    if (!draft) {
      draft = metadataToProfileDraft(supabaseUser.user_metadata)
    }

    if (!draft) {
      return null
    }

    const resolvedUsername =
      (draft.username || '').trim() ||
      (supabaseUser.user_metadata?.username || '').trim() ||
      (supabaseUser.email ? supabaseUser.email.split('@')[0] : '') ||
      DEFAULT_PROFILE_DATA.name

    try {
      await saveProfile({
        supabaseUserId: supabaseUser.id,
        username: resolvedUsername,
        profile: draft.profile || {},
      })
      const refreshed = await fetchProfile(supabaseUser.id)
      return refreshed
    } catch (err) {
      console.warn('Failed to restore pending profile draft', err)
      return null
    }
  }, [fetchProfile, getPendingProfileDraft, saveProfile, supabaseUser])

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      if (!supabaseUser) {
        if (active) {
          setProfileData({ ...DEFAULT_PROFILE_DATA })
        }
        return
      }

      try {
        const profile = await fetchProfile(supabaseUser.id)
        if (!active) {
          return
        }
        if (profile) {
          applyProfileFromServer(profile)
          return
        }
      } catch (err) {
        if (active) {
          console.warn('Failed to load profile', err)
        }
      }

      const restored = await restoreProfileFromDraft()
      if (!active) {
        return
      }
      if (restored) {
        applyProfileFromServer(restored)
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [supabaseUser, fetchProfile, applyProfileFromServer, restoreProfileFromDraft])

  const handleProfileSave = useCallback(async (updatedData) => {
    setProfileData(updatedData)
    setView('profile')

    if (!supabaseUser) {
      return
    }

    try {
      await saveProfile({
        supabaseUserId: supabaseUser.id,
        username: updatedData.name,
        profile: {
          age: updatedData.age,
          height_cm: updatedData.height,
          current_weight_kg: updatedData.weight,
          target_weight_kg: updatedData.goalWeight,
          activity_level: updatedData.activityLevel,
          goal: updatedData.goalKey,
        },
      })

      const refreshed = await fetchProfile(supabaseUser.id)
      applyProfileFromServer(refreshed)
    } catch (err) {
      console.warn('Failed to save profile', err)
    }
  }, [applyProfileFromServer, fetchProfile, saveProfile, supabaseUser])

  const handleSignupComplete = () => {
    setAuthMode('signin')
    setView('home')
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.warn('Failed to sign out', err)
    } finally {
      setIsPremium(false)
      setAuthMode('signin')
      setView('home')
      setShowSplash(false)
    }
  }

  const handleSignInSuccess = () => {
    setShowSplash(true)
    setView('home')
  }

  const handleUpgradeToPremium = useCallback(async () => {
    if (!supabaseUser) {
      setShowUpgradeModal(false)
      return
    }

    if (!SUPABASE_ENABLED) {
      setIsPremium(true)
      setShowUpgradeModal(false)
      return
    }

    setUpgradeInFlight(true)
    try {
      const payload = {
        user_id: supabaseUser.id,
        plan_type: 'premium',
        is_active: true,
        started_at: new Date().toISOString(),
        expires_at: null,
      }
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert(payload, { onConflict: 'user_id' })
      if (error) {
        throw error
      }
      setIsPremium(true)
      setShowUpgradeModal(false)
    } catch (error) {
      console.error('Failed to upgrade subscription', error)
    } finally {
      setUpgradeInFlight(false)
    }
  }, [supabaseUser])

  if (!supabaseUser) {
    return (
      <Suspense fallback={<div style={{ padding: 16 }}>読み込み中…</div>}>
        {authMode === 'signup' ? (
          <SignupPage
            onSignup={handleSignupComplete}
            onBackToLogin={() => setAuthMode('signin')}
          />
        ) : authMode === 'forgot' ? (
          <ForgotPasswordPage onBack={() => setAuthMode('signin')} />
        ) : (
          <SignInPage
            onSuccess={handleSignInSuccess}
            onCancel={() => setAuthMode('signin')}
            onShowSignup={() => setAuthMode('signup')}
            onForgotPassword={() => setAuthMode('forgot')}
          />
        )}
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<div style={{padding:16}}>読み込み中…</div>}>
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <SplashScreenWithCustomLogo
          isOpen={showSplash}
          onComplete={() => setShowSplash(false)}
        />
        {showWeightCalendar && (
          <WeightCalendar
            theme={theme}
            onBack={() => {
              setShowWeightCalendar(false)
              setView('health')
            }}
          />
        )}
        {!showWeightCalendar && view === 'exercise' && (
          <ExerciseAssist
            isPremium={isPremium}
            onUpgrade={() => setShowUpgradeModal(true)}
            onBack={() => setView('home')}
            theme={theme}
          />
        )}
        {!showWeightCalendar && view === 'health' && (
          <WeightHealth
            isPremium={isPremium}
            onUpgrade={() => setShowUpgradeModal(true)}
            onNavigateToCalendar={() => setShowWeightCalendar(true)}
            onBack={() => setView('home')}
            profileData={profileData}
            userProfile={userProfile}
            theme={theme}
          />
        )}
        {view === 'goals' && (
          <GoalsScreen
            isPremium={isPremium}
            onUpgrade={() => setShowUpgradeModal(true)}
            profileData={profileData}
            userProfile={userProfile}
            theme={theme}
          />
        )}
        {view === 'education' && (
          <NutritionEducation
            onBack={() => setView('home')}
            isPremium={isPremium}
            onUpgrade={() => setShowUpgradeModal(true)}
            theme={theme}
          />
        )}
        {view === 'help' && (
          <HelpSupport
            isPremium={isPremium}
            theme={theme}
            onUpgrade={() => setShowUpgradeModal(true)}
            onBack={() => setView('profile')}
          />
        )}
        {view === 'meals' && (
          <MealManagement
            isPremium={isPremium}
            onUpgrade={() => setShowUpgradeModal(true)}
            onOpenAIAssist={() => setView('aiAssist')}
          />
        )}
        {view === 'aiAssist' && (
          <AINutritionAssist onBack={() => setView('meals')} userProfile={userProfile} />
        )}
        {view === 'home' && (
          <HomeScreen
            onGoToMeals={() => requirePremiumView('meals')}
            onGoToProfile={() => setView('profile')}
            onGoToNutrition={() => setView('education')}
            onGoToExercise={() => requirePremiumView('exercise')}
            onGoToHealth={() => requirePremiumView('health')}
            onGoToGoals={() => requirePremiumView('goals')}
            isPremium={isPremium}
            onUpgradeClick={() => setShowUpgradeModal(true)}
            theme={theme}
          />
        )}
        {view === 'profile' && (
          <ProfileSettings
            onLogout={handleLogout}
            isPremium={isPremium}
            theme={theme}
            onToggleTheme={toggleTheme}
            onEditProfile={() => setView('profileEdit')}
            profileImage={profileImage}
            profileData={profileData}
            onStartDiagnosis={() => setView('bodyDiagnosis')}
            onHelpSupport={() => setView('help')}
          />
        )}
        {view === 'profileEdit' && (
          <ProfileEdit
            onBack={() => setView('profile')}
            theme={theme}
            initialData={profileData}
            onSave={handleProfileSave}
            profileImage={profileImage}
            onImageChange={(img) => setProfileImage(img)}
          />
        )}
        {view === 'bodyDiagnosis' && (
          <BodyDiagnosis
            onBack={() => setView('profile')}
            theme={theme}
            onComplete={(bodyType, score) => {
              setDiagnosisBodyType(bodyType)
              setDiagnosisScore(score)
              setProfileData((prev) => ({ ...prev, bodyType }))
              setView('diagnosisResult')
            }}
          />
        )}
        {view === 'diagnosisResult' && diagnosisBodyType && diagnosisScore !== null && (
          <DiagnosisResult
            bodyType={diagnosisBodyType}
            score={diagnosisScore}
            onBack={() => {
              setView('bodyDiagnosis')
            }}
            onReturnToProfile={() => setView('profile')}
            theme={theme}
          />
        )}
        {view === 'notes' && (
          <NotesPage onBack={() => setView('home')} />
        )}

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgradeToPremium}
          isProcessing={upgradeInFlight}
          theme={theme}
        />

        <BottomNav
          active={activeTabForView(view)}
          onNavigate={handleNavigate}
          isPremium={isPremium}
          theme={theme}
        />
      </div>
    </Suspense>
  )
}
