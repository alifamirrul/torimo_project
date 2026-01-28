// 栄養グラフ（P/F/Cとカロリー）
import React, { useMemo, useEffect, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Chart.js の機能を登録
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler)

// ダークモードの検出フック
function useThemeDetection() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

// グラフで使う色
const COLORS = {
  protein: 'rgba(54, 162, 235, 0.75)', // blue
  fat: 'rgba(255, 159, 64, 0.75)',     // orange
  carbs: 'rgba(75, 192, 192, 0.75)',   // teal
  kcal: 'rgba(153, 102, 255, 0.9)',    // purple
}

// 日付をYYYY-MM-DDに変換する
function dayKey(d){
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${dd}`
}

// 1日の開始/終了時刻を作る
function startOfDay(d){ const n = new Date(d); n.setHours(0,0,0,0); return n }
function endOfDay(d){ const n = new Date(d); n.setHours(23,59,59,999); return n }

// 直近n日分の日付配列を作る
function rangeDays(n){
  const today = startOfDay(new Date())
  const days = []
  for (let i=n-1;i>=0;i--){
    const d = new Date(today); d.setDate(today.getDate()-i)
    days.push(d)
  }
  return days
}

// 指定した期間に含まれるか判定
function within(ts, start, end){
  const t = ts ? new Date(ts) : new Date()
  return t >= start && t <= end
}

// データを集計してグラフ用に整形する
function aggregate(history, range){
  const now = new Date()
  if (!Array.isArray(history) || history.length === 0){
    if (range === 'day'){
      return { labels: [], protein: [], fat: [], carbs: [], kcal: [] }
    }
  }

  if (range === 'day'){
    const s = startOfDay(now), e = endOfDay(now)
    const todays = history.filter(h => within(h.ts, s, e))
      .sort((a,b)=>{
        const ta = a.ts ? new Date(a.ts).getTime() : 0
        const tb = b.ts ? new Date(b.ts).getTime() : 0
        return ta - tb
      })
    const labels = todays.map(h => (h.time || h.type || '食事'))
    const protein = todays.map(h => h.protein || 0)
    const fat = todays.map(h => h.fat || 0)
    const carbs = todays.map(h => h.carbs || 0)
    const kcal = todays.map(h => h.calories || ( (h.protein||0)*4 + (h.fat||0)*9 + (h.carbs||0)*4 ))
    return { labels, protein, fat, carbs, kcal }
  }

  // week: last 7 days including today
  // month: actual calendar month (from first day to today) for clarity
  const days = range === 'week' ? rangeDays(7) : (()=>{
    const today = startOfDay(now)
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    const arr = []
    const cursor = new Date(first)
    while (cursor <= today){ arr.push(new Date(cursor)); cursor.setDate(cursor.getDate()+1) }
    return arr
  })()
  const labels = days.map(d => dayKey(d))
  const map = new Map(labels.map(l => [l, { p:0, f:0, c:0, kcal:0 }]))

  history.forEach(h => {
    const t = h.ts ? new Date(h.ts) : new Date()
    const key = dayKey(t)
    if (!map.has(key)) return
    const e = map.get(key)
    const p = h.protein||0, f = h.fat||0, c = h.carbs||0
    e.p += p; e.f += f; e.c += c
    e.kcal += (h.calories || (p*4 + f*9 + c*4))
  })

  return {
    labels,
    protein: labels.map(l => round1(map.get(l)?.p || 0)),
    fat: labels.map(l => round1(map.get(l)?.f || 0)),
    carbs: labels.map(l => round1(map.get(l)?.c || 0)),
    kcal: labels.map(l => Math.round(map.get(l)?.kcal || 0)),
  }
}

// 小数第1位まで丸める
function round1(n){ return Math.round(n*10)/10 }

// ラベルを表示用に変換する
function formatLabels(range, labels){
  if (!Array.isArray(labels) || labels.length === 0) return []
  if (range === 'day') return labels
  const today = new Date(); today.setHours(0,0,0,0)
  const todayKeyStr = dayKey(today)
  const yest = new Date(today); yest.setDate(today.getDate()-1)
  const yestKeyStr = dayKey(yest)
  return labels.map((l, idx)=>{
    if (l === todayKeyStr) return 'Today'
    if (l === yestKeyStr) return 'Yesterday'
    // MM/DD short
    const [y,m,d] = l.split('-')
    return `${m}/${d}`
  })
}

const buildBarData = ({ labels, dataAgg, proteinGoal }) => ({
  labels,
  datasets: [
    {
      type: 'bar',
      label: 'P (g)',
      data: dataAgg.protein,
      yAxisID: 'y1',
      backgroundColor: COLORS.protein,
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      stack: 'pfc',
      borderRadius: 6,
      order: 0,
    },
    {
      type: 'bar',
      label: 'F (g)',
      data: dataAgg.fat,
      yAxisID: 'y1',
      backgroundColor: COLORS.fat,
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
      stack: 'pfc',
      borderRadius: 6,
      order: 0,
    },
    {
      type: 'bar',
      label: 'C (g)',
      data: dataAgg.carbs,
      yAxisID: 'y1',
      backgroundColor: COLORS.carbs,
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      stack: 'pfc',
      borderRadius: 6,
      order: 0,
    },
    {
      type: 'line',
      label: 'カロリー (kcal)',
      data: dataAgg.kcal,
      yAxisID: 'y2',
      borderColor: COLORS.kcal,
      backgroundColor: 'rgba(153, 102, 255, 0.15)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5,
      order: 2,
    },
    ...(proteinGoal > 0 ? [{
      type: 'line',
      label: `P目標 ${proteinGoal}g`,
      data: dataAgg.labels.map(() => proteinGoal),
      yAxisID: 'y1',
      borderColor: 'rgba(255,0,0,0.7)',
      backgroundColor: 'rgba(0,0,0,0)',
      borderDash: [6,4],
      pointRadius: 0,
      tension: 0,
      order: 1,
    }] : [])
  ]
})

const buildStackedOptions = (isDark) => {
  const textColor = isDark ? '#a1a1aa' : '#6b7280'
  const gridColor = isDark ? '#27272a' : '#e5e7eb'
  
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: { 
        position: 'top', 
        labels: { 
          boxWidth: 12,
          color: textColor 
        } 
      },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        backgroundColor: isDark ? '#18181b' : 'white',
        titleColor: isDark ? '#fafafa' : '#1a1a1a',
        bodyColor: isDark ? '#a1a1aa' : '#6b7280',
        borderColor: isDark ? '#27272a' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: textColor }
      },
      y1: { 
        beginAtZero: true, 
        position: 'left', 
        title: { display: true, text: 'P/F/C (g)', color: textColor },
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      y2: { 
        beginAtZero: true, 
        position: 'right', 
        grid: { drawOnChartArea: false }, 
        title: { display: true, text: 'kcal', color: textColor },
        ticks: { color: textColor }
      },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  }

  return {
    ...commonOptions,
    scales: {
      x: { 
        stacked: true, 
        grid: { display: false },
        ticks: { color: textColor }
      },
      y1: { 
        stacked: true, 
        beginAtZero: true, 
        position: 'left', 
        title: { display: true, text: 'P/F/C (g)', color: textColor },
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      y2: commonOptions.scales.y2,
    },
  }
}

// 栄養（P/F/C）とカロリーのグラフ
export default function NutritionCharts({ history, range='week', proteinGoal=0 }){
  // ダークモード検出
  const isDark = useThemeDetection()
  // データの集計結果をメモ化
  const dataAgg = useMemo(()=> aggregate(history || [], range), [history, range])
  const empty = (dataAgg.labels || []).length === 0

  if (empty){
    return <div className="text-sm text-gray-500 dark:text-zinc-400 transition-colors">データがありません。食事を記録するとここに表示されます。</div>
  }

  const labels = formatLabels(range, dataAgg.labels)

  // 棒グラフ + 折れ線グラフのデータ
  const barData = buildBarData({ labels, dataAgg, proteinGoal })
  // 積み上げ表示用オプション (ダークモード対応)
  const stackedOptions = buildStackedOptions(isDark)

  return (
    <div>
      <div style={{height: 420}}>
        <Bar data={barData} options={stackedOptions} />
      </div>
    </div>
  )
}
