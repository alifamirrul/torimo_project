import React from 'react'

export default function Progress({ value = 0, className = '' }){
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={"torimo-progress bg-gray-200 dark:bg-zinc-700 rounded-md h-2 transition-colors " + className}>
      <div 
        className="h-full rounded-md bg-gradient-to-r from-[#34C759] to-[#30D158] dark:from-[#00ff41] dark:to-[#00cc33] transition-all" 
        style={{ width: `${pct}%` }} 
      />
    </div>
  )
}
