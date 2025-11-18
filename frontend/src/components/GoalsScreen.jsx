import React from 'react'
import Button from './ui/button.js'

export default function GoalsScreen({ isPremium, onUpgrade }){
  if (!isPremium) {
    return (
      <div style={{padding:16}}>
        <div className="card" style={{padding:24, textAlign:'center'}}>
          <h2 style={{marginTop:0}}>Goals</h2>
          <p className="muted">Upgrade to set and track personalized goals.</p>
          <div style={{height:12}} />
          <Button className="primary-btn" onClick={onUpgrade}>Upgrade</Button>
        </div>
      </div>
    )
  }
  return (
    <div style={{padding:16}}>
      <div className="card" style={{padding:24}}>
        <h2 style={{marginTop:0}}>Goals</h2>
        <p className="muted">Your premium goal trackers will appear here.</p>
      </div>
    </div>
  )
}
