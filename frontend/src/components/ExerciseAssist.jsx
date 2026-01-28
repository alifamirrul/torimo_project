// 運動アシスト（履歴/週次/自動カウント）
import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Play, Clock, Flame, TrendingUp, Lock, Camera, BookOpen, Sparkles } from 'lucide-react'
import Button from './ui/Button.jsx'
import Progress from './ui/Progress.jsx'
import { Card } from './ui/card'
import WorkoutAutoCount from './WorkoutAutoCount.jsx'
import TrainingMenuExplanation from './TrainingMenuExplanation.jsx'
import TrainingMenuSuggestion from './TrainingMenuSuggestion.jsx'
import { ExerciseCalorieTracker } from './ExerciseCalorieTracker.jsx'
import { supabase, SUPABASE_ENABLED } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function ExerciseAssist({ isPremium, onUpgrade, theme = 'light' }) {
  const [view, setView] = useState('home')
  const [showCalorieTracker, setShowCalorieTracker] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [dailySummary, setDailySummary] = useState({ steps: 0, exercise_minutes: 0, calories: 0 })
  const isDark = theme === 'dark'
  const { user: supabaseUser } = useAuth()

  const fetchDailySummary = useCallback(async () => {
    if (!supabaseUser || !SUPABASE_ENABLED) {
      setDailySummary({ steps: 0, exercise_minutes: 0, calories: 0 })
      return
    }
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('daily_summary')
      .select('steps, exercise_minutes, calories')
      .eq('user_id', supabaseUser.id)
      .eq('date', today)
      .maybeSingle()
    if (error) {
      setDailySummary({ steps: 0, exercise_minutes: 0, calories: 0 })
      return
    }
    setDailySummary(data || { steps: 0, exercise_minutes: 0, calories: 0 })
  }, [supabaseUser])

  const fetchHistory = useCallback(async () => {
    if (!supabaseUser || !SUPABASE_ENABLED) {
      setHistory([])
      setHistoryError(SUPABASE_ENABLED ? '' : 'Supabaseが未設定のため履歴を取得できません。')
      setHistoryLoading(false)
      return
    }
    setHistoryLoading(true)
    setHistoryError('')
    const { data, error } = await supabase
      .from('exercise_history')
      .select('id, exercise_name, reps, sets, duration_seconds, calories_burned, completed_at')
      .eq('user_id', supabaseUser.id)
      .order('completed_at', { ascending: false })
      .limit(20)
    if (error) {
      console.warn('Failed to load exercise history', error)
      setHistory([])
      setHistoryError('履歴を読み込めませんでした。時間をおいて再度お試しください。')
    } else {
      setHistory(data || [])
    }
    setHistoryLoading(false)
  }, [supabaseUser])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    fetchDailySummary()
  }, [fetchDailySummary])

  useEffect(() => {
    if (!SUPABASE_ENABLED || !supabaseUser?.id) return

    const channel = supabase
      .channel('exercise-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exercise_history',
          filter: `user_id=eq.${supabaseUser.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setHistory((prev) => [payload.new, ...prev])
            fetchDailySummary()
            return
          }
          if (payload.eventType === 'UPDATE' && payload.new) {
            setHistory((prev) => prev.map((item) => (item.id === payload.new.id ? payload.new : item)))
            fetchDailySummary()
            return
          }
          if (payload.eventType === 'DELETE' && payload.old) {
            setHistory((prev) => prev.filter((item) => item.id !== payload.old.id))
            fetchDailySummary()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabaseUser, fetchDailySummary])

  const todayStats = {
    steps: dailySummary.steps || 0,
    stepsGoal: 10000,
    exerciseTime: dailySummary.exercise_minutes || 0,
    exerciseGoal: 60,
    caloriesBurned: dailySummary.calories || 0,
  }

  const suggestedWorkouts = [
    { id: 1, name: '腹筋トレーニング', duration: 15, calories: 120, difficulty: '初級', icon: '💪' },
    { id: 2, name: 'ランニング', duration: 30, calories: 250, difficulty: '中級', icon: '🏃' },
    { id: 3, name: 'ヨガストレッチ', duration: 20, calories: 80, difficulty: '初級', icon: '🧘' },
  ]

  const cardBase = 'rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm transition-colors'

  const weekProgress = useMemo(() => {
    const labels = ['月', '火', '水', '木', '金', '土', '日']
    const now = new Date()
    const startOfWeek = new Date(now)
    const offset = (now.getDay() + 6) % 7
    startOfWeek.setDate(now.getDate() - offset)
    startOfWeek.setHours(0, 0, 0, 0)

    const dayKeys = labels.map((_, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      return date.toISOString().slice(0, 10)
    })

    const completedKeys = new Set()
    history.forEach((entry) => {
      if (!entry.completed_at) return
      const completedDate = new Date(entry.completed_at)
      const key = completedDate.toISOString().slice(0, 10)
      if (dayKeys.includes(key)) {
        completedKeys.add(key)
      }
    })

    return labels.map((label, index) => ({
      label,
      completed: completedKeys.has(dayKeys[index]),
    }))
  }, [history])

  const renderHistory = () => {
    if (historyLoading) {
      return <p className="text-sm text-slate-500 dark:text-gray-400">履歴を読み込み中です…</p>
    }
    if (historyError) {
      return <p className="text-sm text-rose-500">{historyError}</p>
    }
    if (!history.length) {
      return <p className="text-sm text-slate-500 dark:text-gray-400">まだ運動履歴がありません。</p>
    }
    return (
      <div className="space-y-3">
        {history.slice(0, 6).map((entry) => {
          const completedAt = entry.completed_at ? new Date(entry.completed_at) : null
          const formattedDate = completedAt
            ? completedAt.toLocaleString('ja-JP', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '日時不明'
          const durationMinutes = entry.duration_seconds
            ? Math.max(1, Math.round(entry.duration_seconds / 60))
            : null
          return (
            <div
              key={entry.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.exercise_name}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">{formattedDate}</p>
              </div>
              <div className="text-xs text-slate-600 dark:text-gray-300 text-right space-y-0.5">
                <p>{entry.reps}回 / {entry.sets}セット</p>
                {durationMinutes && <p>{durationMinutes}分・{entry.calories_burned ?? 0} kcal</p>}
                {!durationMinutes && (entry.calories_burned != null) && <p>{entry.calories_burned} kcal</p>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (view === 'auto') {
    return (
        <WorkoutAutoCount
        theme={theme}
        onBack={() => setView('home')}
        userId={supabaseUser?.id}
        onHistorySaved={() => {
          fetchHistory()
            fetchDailySummary()
        }}
      />
    )
  }
  if (view === 'menu') {
    return <TrainingMenuExplanation theme={theme} onBack={() => setView('home')} />
  }
  if (view === 'suggestion') {
    return <TrainingMenuSuggestion theme={theme} onBack={() => setView('home')} />
  }
  if (showCalorieTracker) {
    return (
      <ExerciseCalorieTracker
        theme={theme}
        onBack={() => setShowCalorieTracker(false)}
        userId={supabaseUser?.id}
        onHistorySaved={() => {
          fetchHistory()
          fetchDailySummary()
        }}
      />
    )
  }

  if (!isPremium) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 py-12 ${isDark ? 'bg-zinc-950' : 'bg-gradient-to-b from-slate-50 to-emerald-50'}`}>
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-800 p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">プレミアム機能</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-8">運動アシストを利用するには、プレミアムプランへのアップグレードが必要です。</p>
          <Button onClick={onUpgrade} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-2xl">
            プレミアムにアップグレード
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pb-24 transition-colors ${isDark ? 'bg-zinc-950 text-white' : 'bg-gradient-to-b from-slate-50 to-emerald-50'}`}>
      <div className={`border-b px-6 py-5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">運動アシスト</h1>
            <p className="text-sm text-slate-500 dark:text-gray-400">あなたに最適な運動プランを提案</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`${cardBase} p-4 bg-white dark:bg-gray-900 text-center`}>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center text-2xl">👟</div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{todayStats.steps.toLocaleString()}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">/ {todayStats.stepsGoal.toLocaleString()} 歩</p>
            <Progress value={(todayStats.steps / todayStats.stepsGoal) * 100} />
          </div>
          <div className={`${cardBase} p-4 bg-white dark:bg-gray-900 text-center`}>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{todayStats.exerciseTime}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">/ {todayStats.exerciseGoal} 分</p>
            <Progress value={(todayStats.exerciseTime / todayStats.exerciseGoal) * 100} />
          </div>
          <div className={`${cardBase} p-4 bg-white dark:bg-gray-900 text-center`}>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{todayStats.caloriesBurned}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400">kcal</p>
          </div>
        </div>

        <div className={`${cardBase} bg-gradient-to-br from-purple-200/40 to-purple-100/20 dark:from-purple-500/20 dark:to-purple-500/5 p-6` }>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">体質タイプ診断</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">あなたに最適な運動を見つけましょう</p>
            </div>
            <Button onClick={() => setView('suggestion')} className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-5 py-2">
              診断開始
            </Button>
          </div>
        </div>

        <div className={`${cardBase} bg-gradient-to-br from-sky-200/40 to-sky-100/10 dark:from-sky-500/20 dark:to-sky-500/5 p-6 text-center`}>
          <div className="w-16 h-16 rounded-full bg-sky-200/60 dark:bg-sky-500/30 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-sky-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">回数自動カウント機能</h3>
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">カメラでフォームをチェックしながら自動で回数をカウント</p>
          <Button onClick={() => setView('auto')} className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-7 py-2">
            カメラを起動
          </Button>
        </div>

        <div className={`${cardBase} bg-gradient-to-br from-emerald-200/40 to-emerald-100/10 dark:from-emerald-500/20 dark:to-emerald-500/5 p-6 text-center`}>
          <div className="w-16 h-16 rounded-full bg-emerald-200/60 dark:bg-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">トレーニングメニュー解説</h3>
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">部位別の正しいトレーニング方法を動画とテキストで詳しく解説</p>
          <Button onClick={() => setView('menu')} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-7 py-2">
            メニューを見る
          </Button>
        </div>

        <Card className="p-6 bg-gradient-to-br from-[#FF2D55]/10 to-[#FF2D55]/5 dark:from-[#FF2D55]/20 dark:to-[#FF2D55]/10 rounded-2xl border border-[#FF2D55]/20 dark:border-[#FF2D55]/30 transition-colors">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#FF2D55]/20 dark:bg-[#FF2D55]/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame className="w-8 h-8 text-[#FF2D55]" />
            </div>
            <h3 className="text-gray-900 dark:text-white mb-2">運動記録・カロリー計算</h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
              有酸素・無酸素運動の記録と<br />消費カロリーを自動計算
            </p>
            <Button
              onClick={() => setShowCalorieTracker(true)}
              className="bg-[#FF2D55] hover:bg-[#e6283e] text-white rounded-xl px-8"
            >
              記録を開始
            </Button>
          </div>
        </Card>

        <div className={`${cardBase} bg-white dark:bg-gray-900 p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">週間の運動実績</h3>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekProgress.map((day) => {
              const completed = day.completed
              return (
                <div key={day.label} className="text-center">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1 ${completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500'}`}>
                    {completed ? '✓' : '-'}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400">{day.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className={`${cardBase} bg-white dark:bg-gray-900 p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">最近の運動履歴</h3>
            </div>
            <button
              type="button"
              onClick={fetchHistory}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500"
            >
              再読み込み
            </button>
          </div>
          {renderHistory()}
        </div>
      </div>
    </div>
  )
}
