import React from 'react'
import Button from './ui/button.js'

export default function ProfileSettings({ onLogout, isPremium, theme, onToggleTheme }){
  return (
    <div style={{padding:16}}>
      <div className="card" style={{padding:24}}>
        <h2 style={{marginTop:0}}>Profile</h2>
        <div style={{height:8}} />
        <div className="row-between">
          <span className="muted">Theme</span>
          <button className="secondary-btn" onClick={onToggleTheme}>Toggle Theme</button>
        </div>
        <div style={{height:12}} />
        <div className="row-between">
          <span className="muted">Plan</span>
          <span>{isPremium ? 'Premium' : 'Free'}</span>
        </div>
        <div style={{height:16}} />
        <Button className="primary-btn" onClick={onLogout}>Log out</Button>
      </div>
    </div>
  )
}
