import React, { useMemo } from 'react'
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

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler)

const COLORS = {
  protein: 'rgba(54, 162, 235, 0.75)', // blue
  fat: 'rgba(255, 159, 64, 0.75)',     // orange
  carbs: 'rgba(75, 192, 192, 0.75)',   // teal
  kcal: 'rgba(153, 102, 255, 0.9)',    // purple
}

// Helper: format date as YYYY-MM-DD
function dayKey(d){
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${dd}`
}

function startOfDay(d){ const n = new Date(d); n.setHours(0,0,0,0); return n }
function endOfDay(d){ const n = new Date(d); n.setHours(23,59,59,999); return n }

function rangeDays(n){
  const today = startOfDay(new Date())
  const days = []
  for (let i=n-1;i>=0;i--){
    const d = new Date(today); d.setDate(today.getDate()-i)
    days.push(d)
  }
  return days
}

function within(ts, start, end){
  const t = ts ? new Date(ts) : new Date()
  return t >= start && t <= end
}

// Aggregate functions
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

function round1(n){ return Math.round(n*10)/10 }

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

export default function NutritionCharts({ history, range='week', proteinGoal=0 }){
  const dataAgg = useMemo(()=> aggregate(history || [], range), [history, range])
  const empty = (dataAgg.labels || []).length === 0

  if (empty){
    return <div className="muted small">データがありません。食事を記録するとここに表示されます。</div>
  }

  const labels = formatLabels(range, dataAgg.labels)

  const barData = {
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
        data: dataAgg.labels.map(()=> proteinGoal),
        yAxisID: 'y1',
        borderColor: 'rgba(255,0,0,0.7)',
        backgroundColor: 'rgba(0,0,0,0)',
        borderDash: [6,4],
        pointRadius: 0,
        tension: 0,
        order: 1,
      }] : [])
    ]
  }

  // lineData no longer needed separately since we use mixed chart

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12 } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y1: { beginAtZero: true, position: 'left', title: { display: true, text: 'P/F/C (g)' } },
      y2: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'kcal' } },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  }

  const stackedOptions = {
    ...commonOptions,
    scales: {
      x: { stacked: true, grid: { display: false } },
      y1: { stacked: true, beginAtZero: true, position: 'left', title: { display: true, text: 'P/F/C (g)' } },
      y2: commonOptions.scales.y2,
    },
  }

  return (
    <div>
      <div style={{height: 420}}>
        <Bar data={barData} options={stackedOptions} />
      </div>
    </div>
  )
}
