import React from 'react'
import Button from './ui/button.js'

export default function NutritionEducation({ isPremium /* free feature */, onUpgrade }){
  return (
    <div style={{padding:16}}>
      <div className="card" style={{padding:24}}>
        <h2 style={{marginTop:0}}>Nutrition Education</h2>
        <p className="muted">Learn nutrition basics, PFC balance, and healthy tips.</p>
        {!isPremium && (
          <>
            <div style={{height:12}} />
            <p className="muted small">Upgrade for personalized recommendations and advanced lessons.</p>
            <div style={{height:8}} />
            <Button className="primary-btn" onClick={onUpgrade}>Upgrade</Button>
          </>
        )}
      </div>
    </div>
  )
}
