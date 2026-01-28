import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Calendar, ChevronRight } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'

// 体重をカレンダーで記録する画面
export default function WeightCalendar({ onBack, theme = 'light' }) {
  // ダークモード判定
  const isDark = theme === 'dark'
  // モーダル表示・入力用の状態
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [weightValue, setWeightValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 日付クリック時にモーダルを開く
  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr)
    setWeightValue('')
    setError('')
    setShowModal(true)
  }

  // 体重を保存する
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedDate) return
    setSaving(true)
    setError('')
    try {
      // サーバーに送るためのフォームデータ
      const formData = new FormData()
      formData.append('date', selectedDate)
      formData.append('weight', weightValue)

      // Django APIにPOST
      const response = await fetch('/api/add/', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (data?.status === 'success') {
        setShowModal(false)
      } else {
        setError('保存に失敗しました。')
      }
    } catch (err) {
      setError('通信エラーが発生しました。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`min-h-screen pb-24 transition-colors ${isDark ? 'bg-zinc-950 text-white' : 'bg-gradient-to-b from-slate-50 to-emerald-50'}`}>
      <div className={`border-b px-6 py-5 transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <Button onClick={onBack} className="rounded-full w-10 h-10 bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center transition-colors">
              <Calendar className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">体重カレンダー</h1>
              <p className="text-sm text-slate-500 dark:text-gray-400">日々の体重記録を確認</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Card className="p-4 bg-white dark:bg-gray-900 transition-colors">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="auto"
            dateClick={handleDateClick}
          />
        </Card>
        <p className="text-sm text-slate-500 dark:text-gray-400">日付をタップして体重を記録できます。</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl transition-colors">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">体重を記録</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">{selectedDate}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 dark:text-gray-300">体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm transition-colors"
                  required
                />
              </div>
              {error && <p className="text-sm text-rose-500">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 transition-colors">
                  キャンセル
                </Button>
                <Button type="submit" className="px-4 py-2 bg-emerald-500 dark:bg-[#00ff41] dark:text-zinc-950 text-white transition-colors" disabled={saving}>
                  {saving ? '保存中…' : '保存'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
