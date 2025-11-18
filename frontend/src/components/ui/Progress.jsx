import React from 'react'

export default function Progress({ value = 0, className = '' }){
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={"torimo-progress " + className} style={{ background:'#e5e7eb', borderRadius:6, height:8 }}>
      <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#34C759,#30D158)', height:'100%', borderRadius:6 }} />
    </div>
  )
}
