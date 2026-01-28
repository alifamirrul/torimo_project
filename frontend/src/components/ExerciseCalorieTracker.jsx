// 運動カロリー計算と履歴管理
import { useEffect, useState } from 'react'
import { ArrowLeft, Flame, Activity, Dumbbell, Calculator, Trash2, History, User } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { supabase, SUPABASE_ENABLED } from '../supabaseClient'

const aerobicMETs = {
  ランニング: 9.8,
  サイクリング: 8.0,
  水泳: 7.0,
  ウォーキング: 3.5,
  縄跳び: 10.0,
}

const anaerobicMETs = {
  腕立て伏せ: 0.6,
  スクワット: 0.5,
  クランチ: 0.3,
  ランジ: 0.6,
  バーピー: 10.0,
}

const STEPS_PER_MINUTE = 100

export function ExerciseCalorieTracker({ theme = 'light', onBack, userId, onHistorySaved }) {
  const [weight, setWeight] = useState('')
  const [aerobicType, setAerobicType] = useState('ランニング')
  const [aerobicMinutes, setAerobicMinutes] = useState('')
  const [anaerobicType, setAnaerobicType] = useState('腕立て伏せ')
  const [anaerobicCounts, setAnaerobicCounts] = useState('')

  const [aerobicCalories, setAerobicCalories] = useState(0)
  const [anaerobicCalories, setAnaerobicCalories] = useState(0)
  const [totalCalories, setTotalCalories] = useState(0)

  const [trainingHistory, setTrainingHistory] = useState([])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('trainingHistory')
    if (stored) {
      setTrainingHistory(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    let totalHistoryCalories = 0
    trainingHistory.forEach((item) => {
      totalHistoryCalories += parseFloat(item.total) || 0
    })
    setTotalCalories(totalHistoryCalories)
  }, [trainingHistory])

  const calculateCalories = async () => {
    const weightNum = parseFloat(weight)

    if (!weightNum) {
      alert('体重を入力してください。')
      return
    }

    if (weightNum < 0) {
      alert('0以上の数値を入力してください')
      return
    }

    const aerobicMin = parseFloat(aerobicMinutes) || 0
    if (aerobicMin < 0) {
      alert('0以上の数値を入力してください')
      return
    }
    const aerobicCal = (aerobicMETs[aerobicType] * weightNum * 3.5) / 200 * aerobicMin

    const anaerobicCount = parseFloat(anaerobicCounts) || 0
    if (anaerobicCount < 0) {
      alert('0以上の数値を入力してください')
      return
    }
    const anaerobicCal = (anaerobicMETs[anaerobicType] * weightNum * 3.5) / 200 * anaerobicCount

    const total = aerobicCal + anaerobicCal

    setAerobicCalories(aerobicCal)
    setAnaerobicCalories(anaerobicCal)

    const record = {
      date: new Date().toLocaleString('ja-JP'),
      aerobic: {
        type: aerobicType,
        minutes: aerobicMin,
        calories: aerobicCal.toFixed(1),
      },
      anaerobic: {
        type: anaerobicType,
        counts: anaerobicCount,
        calories: anaerobicCal.toFixed(1),
      },
      total: total.toFixed(1),
    }

    const newHistory = [...trainingHistory, record]
    setTrainingHistory(newHistory)
    localStorage.setItem('trainingHistory', JSON.stringify(newHistory))

    if (SUPABASE_ENABLED && userId) {
      const durationSeconds = Math.max(0, Math.round(aerobicMin * 60))
      const reps = Math.max(0, Math.round(anaerobicCount))
      const caloriesBurned = Math.max(0, Math.round(total))
      const mainExercise = aerobicMin > 0 ? aerobicType : anaerobicType
      const name = mainExercise || 'トレーニング'
      const payload = {
        user_id: userId,
        workout_type: name,
        duration_minutes: Math.max(0, Math.round(aerobicMin)),
        calories: caloriesBurned,
      }

      try {
        const { error: workoutError } = await supabase.from('workout_history').insert(payload)
        if (workoutError) throw workoutError

        const today = new Date().toISOString().slice(0, 10)
        const { data: workouts, error: fetchError } = await supabase
          .from('workout_history')
          .select('duration_minutes, calories, created_at')
          .eq('user_id', userId)
          .gte('created_at', `${today}T00:00:00Z`)
          .lte('created_at', `${today}T23:59:59Z`)

        if (!fetchError && workouts) {
          const totalMinutes = workouts.reduce((sum, item) => sum + (item.duration_minutes || 0), 0)
          const totalCalories = workouts.reduce((sum, item) => sum + (item.calories || 0), 0)
          const steps = totalMinutes * STEPS_PER_MINUTE

          await supabase
            .from('daily_summary')
            .upsert(
              {
                user_id: userId,
                date: today,
                steps,
                exercise_minutes: totalMinutes,
                calories: totalCalories,
              },
              { onConflict: 'user_id,date' }
            )
        }

        onHistorySaved?.()
      } catch (err) {
        // ignore save errors for now
      }
    }

    setAerobicMinutes('')
    setAnaerobicCounts('')
  }

  const resetHistory = () => {
    const confirmReset = window.confirm('履歴をリセットしますか？この操作は取り消せません。')
    if (!confirmReset) return
    localStorage.removeItem('trainingHistory')
    setAerobicCalories(0)
    setAnaerobicCalories(0)
    setTotalCalories(0)
    setTrainingHistory([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 pb-24 transition-colors">
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-6 py-4 transition-colors sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-gray-900 dark:text-white">運動記録・カロリー計算</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              運動の消費カロリーを記録しましょう
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#5AC8FA]/10 dark:bg-[#5AC8FA]/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-[#5AC8FA]" />
            </div>
            <h2 className="text-gray-900 dark:text-white">ユーザー情報</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="text-gray-700 dark:text-zinc-300">
              体重 (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              min="0"
              placeholder="例: 60"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl h-12"
            />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#FF9500]/10 to-[#FF9500]/5 dark:from-[#FF9500]/20 dark:to-[#FF9500]/10 rounded-2xl border border-[#FF9500]/20 dark:border-[#FF9500]/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FF9500]/20 dark:bg-[#FF9500]/30 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#FF9500]" />
            </div>
            <h2 className="text-gray-900 dark:text-white">有酸素運動</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aerobicType" className="text-gray-700 dark:text-zinc-300">
                運動メニュー
              </Label>
              <select
                id="aerobicType"
                value={aerobicType}
                onChange={(e) => setAerobicType(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl h-12 px-3 text-sm"
              >
                <option value="ランニング">🏃 ランニング</option>
                <option value="サイクリング">🚴 サイクリング</option>
                <option value="水泳">🏊 水泳</option>
                <option value="ウォーキング">🚶 ウォーキング</option>
                <option value="縄跳び">🪢 縄跳び</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aerobicMinutes" className="text-gray-700 dark:text-zinc-300">
                運動時間 (分)
              </Label>
              <Input
                id="aerobicMinutes"
                type="number"
                min="0"
                placeholder="例: 30"
                value={aerobicMinutes}
                onChange={(e) => setAerobicMinutes(e.target.value)}
                className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl h-12"
              />
            </div>

            <div className="p-4 bg-white/50 dark:bg-zinc-800/50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-zinc-400">消費カロリー</span>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#FF9500]" />
                  <span className="text-2xl text-gray-900 dark:text-white font-medium">
                    {aerobicCalories.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-zinc-400">kcal</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#AF52DE]/10 to-[#AF52DE]/5 dark:from-[#AF52DE]/20 dark:to-[#AF52DE]/10 rounded-2xl border border-[#AF52DE]/20 dark:border-[#AF52DE]/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#AF52DE]/20 dark:bg-[#AF52DE]/30 rounded-full flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-[#AF52DE]" />
            </div>
            <h2 className="text-gray-900 dark:text-white">無酸素運動</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anaerobicType" className="text-gray-700 dark:text-zinc-300">
                運動メニュー
              </Label>
              <select
                id="anaerobicType"
                value={anaerobicType}
                onChange={(e) => setAnaerobicType(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl h-12 px-3 text-sm"
              >
                <option value="腕立て伏せ">💪 腕立て伏せ</option>
                <option value="スクワット">🦵 スクワット</option>
                <option value="クランチ">🧘 クランチ</option>
                <option value="ランジ">🏋️ ランジ</option>
                <option value="バーピー">🤸 バーピー</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anaerobicCounts" className="text-gray-700 dark:text-zinc-300">
                回数 (回)
              </Label>
              <Input
                id="anaerobicCounts"
                type="number"
                min="0"
                placeholder="例: 20"
                value={anaerobicCounts}
                onChange={(e) => setAnaerobicCounts(e.target.value)}
                className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl h-12"
              />
            </div>

            <div className="p-4 bg-white/50 dark:bg-zinc-800/50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-zinc-400">消費カロリー</span>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#AF52DE]" />
                  <span className="text-2xl text-gray-900 dark:text-white font-medium">
                    {anaerobicCalories.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-zinc-400">kcal</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Button
          onClick={calculateCalories}
          className="w-full bg-[#34C759] dark:bg-[#00ff41] hover:bg-[#2fb350] dark:hover:bg-[#00cc33] text-white dark:text-zinc-950 h-14 rounded-2xl text-lg"
        >
          <Calculator className="w-5 h-5 mr-2" />
          消費カロリーを計算
        </Button>

        <Card className="p-6 bg-gradient-to-br from-[#FF2D55]/10 to-[#FF2D55]/5 dark:from-[#FF2D55]/20 dark:to-[#FF2D55]/10 rounded-2xl border border-[#FF2D55]/20 dark:border-[#FF2D55]/30 transition-colors">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-[#FF2D55]" />
              <h2 className="text-gray-900 dark:text-white">累計消費カロリー</h2>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl text-gray-900 dark:text-white font-bold">
                {totalCalories.toFixed(1)}
              </span>
              <span className="text-xl text-gray-500 dark:text-zinc-400">kcal</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5AC8FA]/10 dark:bg-[#5AC8FA]/20 rounded-full flex items-center justify-center">
                <History className="w-5 h-5 text-[#5AC8FA]" />
              </div>
              <h2 className="text-gray-900 dark:text-white">トレーニング履歴</h2>
            </div>

            <Button
              onClick={resetHistory}
              className="text-[#FF2D55] hover:text-[#FF2D55] hover:bg-[#FF2D55]/10 rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              リセット
            </Button>
          </div>

          {trainingHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
              </div>
              <p className="text-gray-500 dark:text-zinc-400">
                まだトレーニング履歴がありません
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {trainingHistory.some((item) => item.aerobic.minutes > 0) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#FF9500]" />
                    有酸素運動
                  </h3>
                  <div className="space-y-2">
                    {trainingHistory
                      .filter((item) => item.aerobic.minutes > 0)
                      .slice()
                      .reverse()
                      .map((item, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-zinc-400">
                              {item.date}
                            </span>
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-[#FF9500]" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.aerobic.calories} kcal
                              </span>
                            </div>
                          </div>
                          <div className="text-gray-900 dark:text-white">
                            {item.aerobic.type}
                            <span className="text-gray-500 dark:text-zinc-400 ml-2">
                              {item.aerobic.minutes}分
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {trainingHistory.some((item) => item.anaerobic.counts > 0) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#AF52DE]" />
                    無酸素運動
                  </h3>
                  <div className="space-y-2">
                    {trainingHistory
                      .filter((item) => item.anaerobic.counts > 0)
                      .slice()
                      .reverse()
                      .map((item, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-zinc-400">
                              {item.date}
                            </span>
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-[#AF52DE]" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.anaerobic.calories} kcal
                              </span>
                            </div>
                          </div>
                          <div className="text-gray-900 dark:text-white">
                            {item.anaerobic.type}
                            <span className="text-gray-500 dark:text-zinc-400 ml-2">
                              {item.anaerobic.counts}回
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default ExerciseCalorieTracker
