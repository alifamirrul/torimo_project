import { useState } from 'react'
import { Plus, Calendar, TrendingDown, Lock, CalendarDays } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// 体重・体調記録画面（初心者向けに読みやすくコメント付き）
export default function WeightHealth({ isPremium, onUpgrade, onNavigateToCalendar, profileData, userProfile, theme = 'light' }) {
  // 入力フォーム用の状態
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [diary, setDiary] = useState('')
  // 追加ダイアログの表示状態
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  // グラフの表示範囲（週 / 月）
  const [chartRange, setChartRange] = useState('week')

  // localStorage から体重記録を読み込む
  const loadWeightRecords = () => {
    try {
      const stored = localStorage.getItem('weightRecords')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (err) {
      // ignore parse errors
    }
    // 何も保存されていなければ、プロフィールの体重を初期値として使う
    const profileWeight = Number(
      userProfile?.weight_kg ??
      profileData?.weight ??
      profileData?.current_weight_kg
    )
    if (Number.isFinite(profileWeight) && profileWeight > 0) {
      const today = new Date().toISOString().split('T')[0]
      return [
        { id: 1, date: today, weight: profileWeight, note: '登録時の体重' },
      ]
    }
    return [
      { id: 1, date: '2026-01-08', weight: 71.0, note: '記録開始！頑張ります' },
      { id: 2, date: '2026-01-10', weight: 70.5, note: '少し減りました' },
      { id: 3, date: '2026-01-12', weight: 70.2, note: '順調です' },
      { id: 4, date: '2026-01-14', weight: 69.8, note: '運動もしっかりできました' },
      { id: 5, date: '2026-01-16', weight: 69.5, note: '体調も良好' },
      { id: 6, date: '2026-01-18', weight: 69.2, note: '目標に近づいています' },
      { id: 7, date: '2026-01-20', weight: 68.9, note: '引き続き頑張ります' },
      { id: 8, date: '2026-01-22', weight: 68.5, note: '朝の体重測定。昨日は運動もしっかりできました。体調も良好です。' },
    ]
  }

  // 体重記録の一覧（初期値はloadWeightRecordsから）
  const [weightRecords, setWeightRecords] = useState(loadWeightRecords)

  // localStorageに保存して、状態も更新する
  const saveWeightRecords = (records) => {
    localStorage.setItem('weightRecords', JSON.stringify(records))
    setWeightRecords(records)
  }

  // グラフに表示するデータを作成する
  const getChartData = () => {
    const sortedRecords = [...weightRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const today = new Date()
    let filteredRecords = sortedRecords

    if (chartRange === 'week') {
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      filteredRecords = sortedRecords.filter((record) => new Date(record.date) >= weekAgo)
    } else if (chartRange === 'month') {
      const monthAgo = new Date(today)
      monthAgo.setDate(today.getDate() - 30)
      filteredRecords = sortedRecords.filter((record) => new Date(record.date) >= monthAgo)
    }

    return filteredRecords.map((record) => ({
      date: new Date(record.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      weight: record.weight,
    }))
  }

  // 現在値・変化量・目標値を計算する
  const getCurrentStats = () => {
    if (!weightRecords.length) {
      return { current: 0, change: 0, target: 65.0 }
    }

    const sortedRecords = [...weightRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const current = sortedRecords[0]?.weight || 0
    const oldest = sortedRecords[sortedRecords.length - 1]?.weight || current
    const change = Number((oldest - current).toFixed(1))
    const target = 65.0

    return { current, change, target }
  }

  // 直近5件の体調日記を取得する
  const getRecentDiaryEntries = () => {
    return [...weightRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }

  const stats = getCurrentStats()
  const chartData = getChartData()
  const diaryEntries = getRecentDiaryEntries()

  // グラフのY軸範囲を少し余裕を持たせて設定する
  const getYAxisDomain = () => {
    if (!chartData.length) return [65, 75]
    const weights = chartData.map((d) => d.weight)
    const minWeight = Math.min(...weights)
    const maxWeight = Math.max(...weights)
    const padding = 2
    return [Math.floor(minWeight - padding), Math.ceil(maxWeight + padding)]
  }

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
              体重・体調記録機能を利用するには、プレミアムプランへのアップグレードが必要です
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

  // 体重記録を追加する
  const handleAddRecord = () => {
    if (!weight) return
    const newRecord = {
      id: weightRecords.length + 1,
      date,
      weight: parseFloat(weight),
      note: diary,
    }
    saveWeightRecords([...weightRecords, newRecord])
    setIsAddDialogOpen(false)
    setWeight('')
    setDiary('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 pb-24 transition-colors">
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-6 py-4 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 dark:text-white">体重・体調記録</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">日々の変化を記録して振り返る</p>
          </div>
          {onNavigateToCalendar && (
            <Button
              onClick={onNavigateToCalendar}
              className="bg-white dark:bg-zinc-900 border-2 border-[#8dd3b6] dark:border-[#00ff41]/30 text-[#5aa88b] dark:text-[#00ff41] hover:bg-[#8dd3b6] dark:hover:bg-[#00ff41]/10 hover:text-white dark:hover:text-[#00ff41] rounded-xl"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              カレンダーへ
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 text-center transition-colors">
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">現在</p>
            <p className="text-2xl text-gray-900 dark:text-white mb-1">{stats.current}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">kg</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#34C759]/10 to-[#34C759]/5 dark:from-[#00ff41]/10 dark:to-[#00ff41]/5 rounded-2xl border border-[#34C759]/20 dark:border-[#00ff41]/20 text-center transition-colors">
            <p className="text-xs text-[#34C759] dark:text-[#00ff41] mb-2">変化</p>
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="w-5 h-5 text-[#34C759] dark:text-[#00ff41]" />
              <p className="text-2xl text-[#34C759] dark:text-[#00ff41]">{stats.change}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">kg</p>
          </Card>

          <Card className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 text-center transition-colors">
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">目標</p>
            <p className="text-2xl text-gray-900 dark:text-white mb-1">{stats.target}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">kg</p>
          </Card>
        </div>

        <Card className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 dark:text-white">体重推移グラフ</h3>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#34C759] dark:bg-[#00ff41] hover:bg-[#2fb350] dark:hover:bg-[#00cc33] text-white dark:text-zinc-950 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              記録追加
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setChartRange('week')}
              className={`px-5 py-2 rounded-lg border-2 transition-all ${
                chartRange === 'week'
                  ? 'bg-[#34C759] dark:bg-[#00ff41] border-[#34C759] dark:border-[#00ff41] text-white dark:text-zinc-950'
                  : 'bg-white dark:bg-zinc-900 border-[#8dd3b6] dark:border-[#00ff41]/30 text-[#5aa88b] dark:text-[#00ff41] hover:bg-[#8dd3b6] dark:hover:bg-[#00ff41]/10 hover:text-white dark:hover:text-[#00ff41]'
              }`}
            >
              週
            </Button>
            <Button
              onClick={() => setChartRange('month')}
              className={`px-5 py-2 rounded-lg border-2 transition-all ${
                chartRange === 'month'
                  ? 'bg-[#34C759] dark:bg-[#00ff41] border-[#34C759] dark:border-[#00ff41] text-white dark:text-zinc-950'
                  : 'bg-white dark:bg-zinc-900 border-[#8dd3b6] dark:border-[#00ff41]/30 text-[#5aa88b] dark:text-[#00ff41] hover:bg-[#8dd3b6] dark:hover:bg-[#00ff41]/10 hover:text-white dark:hover:text-[#00ff41]'
              }`}
            >
              月
            </Button>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#27272a' : '#f0f0f0'} />
              <XAxis
                dataKey="date"
                stroke={theme === 'dark' ? '#71717a' : '#9ca3af'}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                domain={getYAxisDomain()}
                stroke={theme === 'dark' ? '#71717a' : '#9ca3af'}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#18181b' : 'white',
                  border: `1px solid ${theme === 'dark' ? '#3f3f46' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  padding: '8px 12px',
                  color: theme === 'dark' ? '#fafafa' : '#111827',
                }}
                labelStyle={{ color: theme === 'dark' ? '#a1a1aa' : '#6b7280', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={theme === 'dark' ? '#00ff41' : '#34C759'}
                strokeWidth={3}
                dot={{ fill: theme === 'dark' ? '#00ff41' : '#34C759', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: theme === 'dark' ? '#00ff41' : '#34C759' }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-[#34C759]/10 dark:bg-[#00ff41]/10 rounded-xl border border-[#34C759]/20 dark:border-[#00ff41]/20">
            <p className="text-sm text-gray-700 dark:text-zinc-300 text-center">
              <span className="text-[#34C759] dark:text-[#00ff41]">順調です！</span>
              この2週間で2.5kg減量しました
            </p>
          </div>
        </Card>

        <div>
          <h3 className="text-gray-900 dark:text-white mb-4 px-2">体調日記</h3>
          <div className="space-y-3">
            {diaryEntries.map((entry) => (
              <Card key={entry.id} className="p-5 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-center">
                    <div className="w-12 h-12 bg-[#34C759]/10 dark:bg-[#00ff41]/10 rounded-full flex items-center justify-center mb-2">
                      <Calendar className="w-6 h-6 text-[#34C759] dark:text-[#00ff41]" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      {new Date(entry.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-500 dark:text-zinc-400">体重:</span>
                      <span className="text-gray-900 dark:text-white">{entry.weight} kg</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">{entry.note}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 bg-gradient-to-br from-[#5AC8FA]/10 to-[#5AC8FA]/5 dark:from-[#5AC8FA]/20 dark:to-[#5AC8FA]/10 rounded-2xl border border-[#5AC8FA]/20 dark:border-[#5AC8FA]/30 transition-colors">
          <h4 className="text-gray-900 dark:text-white mb-4">今週のまとめ</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-1">記録日数</p>
              <p className="text-2xl text-[#5AC8FA]">5</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">/ 7 日</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-1">平均変化</p>
              <p className="text-2xl text-[#34C759] dark:text-[#00ff41]">-0.4</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">kg / 日</p>
            </div>
          </div>
        </Card>
      </div>

      {isAddDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <h2 className="text-lg font-semibold dark:text-white">体重・体調を記録</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">日付、体重、体調メモを入力してください</p>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="date" className="text-gray-700 dark:text-zinc-300">日付</Label>
                <div className="relative mt-2">
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 dark:text-white"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <Label htmlFor="weight" className="text-gray-700 dark:text-zinc-300">体重 (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="68.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-2 h-12 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="diary" className="text-gray-700 dark:text-zinc-300">体調メモ</Label>
                <Textarea
                  id="diary"
                  placeholder="今日の体調や気づいたことを記録しましょう..."
                  value={diary}
                  onChange={(e) => setDiary(e.target.value)}
                  className="mt-2 min-h-32 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500 resize-none"
                />
              </div>

              <Button
                onClick={handleAddRecord}
                className="w-full bg-[#34C759] dark:bg-[#00ff41] hover:bg-[#2fb350] dark:hover:bg-[#00cc33] text-white dark:text-zinc-950 rounded-xl h-12"
              >
                記録を保存
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(false)}
                className="w-full bg-gray-100 dark:bg-zinc-800 rounded-xl h-12"
              >
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
