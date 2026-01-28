// 目標とモチベーション画面
import { useEffect, useMemo, useState } from 'react'
import { Target, Trophy, TrendingUp, Star, Lock } from 'lucide-react'
import { Card } from './ui/card'
import Progress from './ui/Progress.jsx'
import Button from './ui/button.js'
import { supabase, SUPABASE_ENABLED } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'

const resolveApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE
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

export default function GoalsScreen({ isPremium, onUpgrade, profileData, userProfile, theme = 'light' }) {
  const { user: supabaseUser, getAccessToken } = useAuth()
  const [calorieStats, setCalorieStats] = useState({ consumed: 0, target: 0 })
  const [exerciseCount, setExerciseCount] = useState(0)
  const [weeklyLoginCount, setWeeklyLoginCount] = useState(0)
  const [quizCompletions, setQuizCompletions] = useState(0)

  const goalCalories =
    Number(userProfile?.goal_calories || profileData?.goal_calories || profileData?.goalCalories) || 2000

  const weightRecords = useMemo(() => {
    try {
      const stored = localStorage.getItem('weightRecords')
      if (stored) return JSON.parse(stored)
    } catch (err) {
      // ignore
    }
    return []
  }, [])

  const latestWeight = useMemo(() => {
    if (weightRecords.length) {
      const sorted = [...weightRecords].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      return sorted[0]?.weight ?? profileData?.weight ?? 0
    }
    return profileData?.weight ?? 0
  }, [weightRecords, profileData])

  const initialWeight = useMemo(() => {
    if (weightRecords.length) {
      const sorted = [...weightRecords].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      return sorted[0]?.weight ?? latestWeight
    }
    return latestWeight
  }, [weightRecords, latestWeight])

  const targetWeight = Number(profileData?.goalWeight ?? profileData?.target_weight_kg ?? 65)

  const weightProgress = useMemo(() => {
    const total = initialWeight - targetWeight
    if (!total) return 0
    const current = initialWeight - latestWeight
    return Math.max(0, Math.min(100, Math.round((current / total) * 100)))
  }, [initialWeight, latestWeight, targetWeight])

  const weeklyGoal = useMemo(() => ({ current: weeklyLoginCount, total: 7 }), [weeklyLoginCount])
  const monthlyGoal = useMemo(
    () => ({ current: Math.min(100, Math.round((calorieStats.consumed / Math.max(1, goalCalories)) * 100)), total: 100 }),
    [calorieStats, goalCalories]
  )

  useEffect(() => {
    const stored = localStorage.getItem('nutritionQuizCompletions')
    if (stored) {
      const parsed = Number(stored)
      setQuizCompletions(Number.isFinite(parsed) ? parsed : 0)
    }
  }, [])

  useEffect(() => {
    const loadTodayCalories = async () => {
      setCalorieStats((prev) => ({ ...prev, target: goalCalories }))
      if (!getAccessToken) return
      try {
        const token = await getAccessToken()
        const today = new Date().toISOString().split('T')[0]
        const res = await fetch(`${API_BASE}/api/meals/?date=${today}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) return
        const data = await res.json()
        const totalCalories = (data || []).reduce((sum, meal) => sum + (meal.calories || 0), 0)
        setCalorieStats({ consumed: Math.round(totalCalories), target: goalCalories })
      } catch (err) {
        // ignore
      }
    }
    loadTodayCalories()
  }, [getAccessToken, goalCalories])

  useEffect(() => {
    const loadExerciseCount = async () => {
      if (!SUPABASE_ENABLED || !supabaseUser) return
      const since = new Date()
      since.setDate(since.getDate() - 30)
      const { count } = await supabase
        .from('exercise_history')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', supabaseUser.id)
        .gte('completed_at', since.toISOString())
      if (count != null) {
        setExerciseCount(count)
      }
    }
    loadExerciseCount()
  }, [supabaseUser])

  useEffect(() => {
    const dayLabels = ['月', '火', '水', '木', '金', '土', '日']
    const today = new Date()
    const mondayIndex = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(today.getDate() - mondayIndex)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const mondayISO = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
    const sundayISO = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`

    const useLocalStorage = () => {
      const weekKey = mondayISO
      const storageKey = 'torimo_weekly_login_v1'
      let stored = {}
      try {
        stored = JSON.parse(localStorage.getItem(storageKey) || '{}')
      } catch (err) {
        stored = {}
      }
      if (!stored[weekKey]) {
        stored[weekKey] = []
      }
      setWeeklyLoginCount(stored[weekKey].length)
    }

    const useSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('user_daily_logins')
          .select('login_date')
          .eq('user_id', supabaseUser.id)
          .gte('login_date', mondayISO)
          .lte('login_date', sundayISO)
        if (error) throw error
        setWeeklyLoginCount((data || []).length)
      } catch (err) {
        useLocalStorage()
      }
    }

    if (SUPABASE_ENABLED && supabaseUser?.id) {
      useSupabase()
    } else {
      useLocalStorage()
    }
  }, [supabaseUser])

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 p-6 transition-colors">
        <div className="max-w-2xl mx-auto pt-6">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 transition-colors">
              <Lock className="w-10 h-10 text-gray-400 dark:text-zinc-500" />
            </div>
            <h2 className="text-gray-900 dark:text-white mb-3">プレミアム機能</h2>
            <p className="text-gray-500 dark:text-zinc-400 text-center mb-8 max-w-sm">
              目標設定とモチベーション機能を利用するには、プレミアムプランへのアップグレードが必要です
            </p>
            <Button
              onClick={onUpgrade}
              className="bg-[#34C759] hover:bg-[#2fb350] dark:bg-[#00ff41] dark:hover:bg-[#00e63a] dark:text-zinc-950 text-white px-8 py-6 rounded-2xl transition-colors"
            >
              プレミアムにアップグレード
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const badges = [
    { id: 1, name: '7日連続ログイン', icon: '🔥', unlocked: weeklyLoginCount >= 7 },
    { id: 2, name: '初回クイズ達成', icon: '🏃', unlocked: quizCompletions >= 1 },
    { id: 3, name: '目標体重達成', icon: '🎯', unlocked: latestWeight > 0 && latestWeight <= targetWeight },
    { id: 4, name: '運動5回達成', icon: '💪', unlocked: exerciseCount >= 5 },
    { id: 5, name: '運動20回達成', icon: '⭐', unlocked: exerciseCount >= 20 },
    { id: 6, name: '継続の達人', icon: '👑', unlocked: weeklyLoginCount >= 5 && exerciseCount >= 10 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 pb-24 transition-colors">
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-6 py-4 transition-colors">
        <h1 className="text-gray-900 dark:text-white">目標とモチベーション</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">あなたの進捗を確認しましょう</p>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#34C759]/10 dark:bg-[#00ff41]/10 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-[#34C759] dark:text-[#00ff41]" />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white">目標体重</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">あと{Math.max(0, (latestWeight - targetWeight).toFixed(1))}kg</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-zinc-400">現在: {latestWeight.toFixed(1)}kg</span>
              <span className="text-[#34C759] dark:text-[#00ff41]">目標: {targetWeight.toFixed(1)}kg</span>
            </div>
            <Progress value={weightProgress} className="h-3 bg-gray-100 dark:bg-zinc-800" />
            <p className="text-xs text-gray-500 dark:text-zinc-400 text-right">{weightProgress}% 達成</p>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 dark:text-white">カロリー目標</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">今日の摂取状況</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-zinc-400">目標 {goalCalories}kcal</p>
              <p className="text-xl text-gray-900 dark:text-white">{calorieStats.consumed}kcal</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress
              value={Math.min(100, Math.round((calorieStats.consumed / Math.max(1, goalCalories)) * 100))}
              className="h-3 bg-gray-100 dark:bg-zinc-800"
            />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 bg-gradient-to-br from-[#5AC8FA]/10 to-[#5AC8FA]/5 dark:from-[#5AC8FA]/20 dark:to-[#5AC8FA]/10 rounded-2xl border border-[#5AC8FA]/20 dark:border-[#5AC8FA]/30 transition-colors">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#e5e7eb"
                    className="dark:stroke-zinc-800"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#5AC8FA"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(weeklyGoal.current / weeklyGoal.total) * 175.93} 175.93`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#5AC8FA]">{weeklyGoal.current}/{weeklyGoal.total}</span>
                </div>
              </div>
              <h4 className="text-gray-700 dark:text-zinc-300 mb-1">週間目標</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400">ログイン日数</p>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-[#FF9500]/10 to-[#FF9500]/5 dark:from-[#FF9500]/20 dark:to-[#FF9500]/10 rounded-2xl border border-[#FF9500]/20 dark:border-[#FF9500]/30 transition-colors">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#e5e7eb"
                    className="dark:stroke-zinc-800"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#FF9500"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(monthlyGoal.current / monthlyGoal.total) * 175.93} 175.93`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#FF9500]">{monthlyGoal.current}%</span>
                </div>
              </div>
              <h4 className="text-gray-700 dark:text-zinc-300 mb-1">月間目標</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400">摂取カロリー</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-[#FFD700]" />
            <h3 className="text-gray-900 dark:text-white">獲得した称号</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`relative p-4 rounded-2xl text-center transition-all ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-[#34C759]/10 to-[#34C759]/5 dark:from-[#00ff41]/10 dark:to-[#00ff41]/5 border border-[#34C759]/20 dark:border-[#00ff41]/20'
                    : 'bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 opacity-50'
                }`}
              >
                {!badge.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
                  </div>
                )}
                <div className={`text-3xl mb-2 ${!badge.unlocked && 'blur-sm'}`}>{badge.icon}</div>
                <p className={`text-xs ${badge.unlocked ? 'text-gray-700 dark:text-zinc-300' : 'text-gray-400 dark:text-zinc-500'}`}>
                  {badge.name}
                </p>
                {badge.unlocked && <Star className="w-4 h-4 text-[#FFD700] absolute top-2 right-2" />}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-[#34C759] to-[#30D158] dark:from-[#00ff41] dark:to-[#00cc33] rounded-2xl shadow-sm text-white dark:text-zinc-950 transition-colors">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-8 h-8 flex-shrink-0 mt-1" />
            <div>
              <h4 className="mb-2">素晴らしい進捗です！</h4>
              <p className="text-sm text-white/90 dark:text-zinc-950/90">
                目標体重まであと少しです。この調子で頑張りましょう！
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
