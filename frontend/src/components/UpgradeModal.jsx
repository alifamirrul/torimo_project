import React from 'react'
import Button from './ui/button.js'

export default function UpgradeModal({ isOpen, onClose, onUpgrade }){
  if (!isOpen) return null
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
      <div className="card" style={{padding:24, width:360, maxWidth:'90vw'}}>
        <h3 style={{marginTop:0}}>Upgrade to Premium</h3>
        <p className="muted">Unlock all premium features: Home dashboard, Meal management, Exercise assist, Health tracking, and Goals.</p>
        <div style={{height:16}} />
        <div style={{display:'flex', gap:8}}>
          <button className="secondary-btn" style={{flex:1}} onClick={onClose}>Later</button>
          <Button className="primary-btn" style={{flex:1}} onClick={onUpgrade}>Upgrade</Button>
        </div>
      </div>
    </div>
  )
}
