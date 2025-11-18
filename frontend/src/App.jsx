import React, { useState, lazy, Suspense } from 'react'

// Lazy-load views to avoid failing the whole app if a non-visible view has an import/runtime error
const LoginPage = lazy(() => import('./components/LoginPage'))
const SignupPage = lazy(() => import('./components/SignupPage'))
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage'))
const MealManagement = lazy(() => import('./components/MealManagement'))
const AINutritionAssist = lazy(() => import('./components/AINutritionAssist'))
const HomeScreen = lazy(() => import('./components/HomeScreen'))

console.log('App.jsx loaded')

export default function App(){
  const [view, setView] = useState('login') // 'login' | 'signup' | 'forgot' | 'home' | 'meals' | 'aiAssist'
  const [isPremium, setIsPremium] = useState(false)
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

  console.log('Current view:', view)

  const handleLogin = () => {
    setView('home')
  }

  const handleSignup = () => {
    alert('Signed up (placeholder)')
    setView('login')
  }

  return (
    <Suspense fallback={<div style={{padding:16}}>読み込み中…</div>}>
      <div>
        {view === 'login' && (
          <LoginPage
            onLogin={handleLogin}
            onSignupClick={() => setView('signup')}
            onForgotPasswordClick={() => setView('forgot')}
          />
        )}
        {view === 'signup' && (
          <SignupPage onSignup={handleSignup} onBackToLogin={() => setView('login')} />
        )}
        {view === 'forgot' && (
          <ForgotPasswordPage onBack={() => setView('login')} />
        )}
        {view === 'meals' && (
          <MealManagement isPremium={isPremium} onUpgrade={() => setIsPremium(true)} onOpenAIAssist={() => setView('aiAssist')} />
        )}
        {view === 'aiAssist' && (
          <AINutritionAssist onBack={() => setView('meals')} userProfile={userProfile} />
        )}
        {view === 'home' && (
          <HomeScreen onGoToMeals={() => setView('meals')} />
        )}
      </div>
    </Suspense>
  )
}
