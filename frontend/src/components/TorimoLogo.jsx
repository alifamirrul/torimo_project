import React from 'react'

export default function TorimoLogo({ size = 140, animated = false }) {
  const strokeWidth = Math.max(2, Math.round(size * 0.04))
  const center = size / 2
  const radius = size * 0.38

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? 'animate-pulse' : ''}
      aria-label="Torimo logo"
    >
      <defs>
        <linearGradient id="torimoGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00ff41" />
          <stop offset="100%" stopColor="#00cc33" />
        </linearGradient>
      </defs>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="url(#torimoGradient)"
        strokeWidth={strokeWidth}
      />
      <path
        d={`M ${center - radius * 0.55} ${center - radius * 0.35} H ${center + radius * 0.55}`}
        stroke="#00ff41"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d={`M ${center} ${center - radius * 0.35} V ${center + radius * 0.5}`}
        stroke="#00ff41"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <circle
        cx={center}
        cy={center + radius * 0.2}
        r={radius * 0.18}
        fill="rgba(0, 255, 65, 0.15)"
      />
    </svg>
  )
}
