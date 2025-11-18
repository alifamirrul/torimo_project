import React from 'react'

export default function CircularStat({
  label,
  value = 0,
  goal = 100,
  unit = '',
  color = '#22c55e', // default green
  size = 72,
  thickness = 8,
}){
  const pct = Math.max(0, Math.min(100, Math.round((value / (goal || 1)) * 100)))
  const r = (size / 2) - (thickness / 2)
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - pct / 100)

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <div style={{ width:size, height:size, position:'relative' }}>
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size/2}
            cy={size/2}
            r={r}
            stroke="#e5e7eb"
            strokeWidth={thickness}
            fill="none"
          />
          {/* Progress */}
          <circle
            cx={size/2}
            cy={size/2}
            r={r}
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            fill="none"
          />
        </svg>
        <div style={{
          position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:600, color:'#374151'
        }}>{pct}%</div>
      </div>
      <div style={{ marginTop:8, textAlign:'center' }}>
        <div style={{ fontSize:12, color:'#374151' }}>{label}</div>
        <div style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{value}{unit}</div>
        <div style={{ fontSize:10, color:'#6b7280' }}>/ {goal}</div>
      </div>
    </div>
  )
}
