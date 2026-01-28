import React from 'react'

export default function CircularStat({
  label,
  value = 0,
  goal = 100,
  unit = '',
  color = '#22c55e', // default green
  darkColor,
  size = 72,
  thickness = 8,
}){
  const pct = Math.max(0, Math.min(100, Math.round((value / (goal || 1)) * 100)))
  const r = (size / 2) - (thickness / 2)
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - pct / 100)
  // Use darkColor if provided, otherwise map common colors to neon variants
  const resolvedDarkColor = darkColor || (color === '#22c55e' || color === '#34C759' ? '#00ff41' : color)

  return (
    <div className="flex flex-col items-center transition-colors">
      <div style={{ width:size, height:size }} className="relative">
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size/2}
            cy={size/2}
            r={r}
            className="stroke-gray-200 dark:stroke-zinc-700 transition-colors"
            strokeWidth={thickness}
            fill="none"
          />
          {/* Progress */}
          <circle
            cx={size/2}
            cy={size/2}
            r={r}
            stroke={color}
            className="dark:hidden"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            fill="none"
          />
          <circle
            cx={size/2}
            cy={size/2}
            r={r}
            stroke={resolvedDarkColor}
            className="hidden dark:block"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            fill="none"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-zinc-300 transition-colors">
          {pct}%
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-xs text-gray-600 dark:text-zinc-400 transition-colors">{label}</div>
        <div className="text-sm font-bold text-gray-900 dark:text-white transition-colors">{value}{unit}</div>
        <div className="text-[10px] text-gray-500 dark:text-zinc-500 transition-colors">/ {goal}</div>
      </div>
    </div>
  )
}
