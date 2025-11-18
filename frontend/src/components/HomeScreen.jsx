import React from 'react'
import Button from './ui/button.js'
import Progress from './ui/Progress'
import { TrendingUp, Flame, Activity, Award, ArrowRight } from 'lucide-react'

export default function HomeScreen({ onGoToMeals }){
  // Always show content (no premium gate)
  const dailyCalories = {
    consumed: 1450,
    burned: 380,
    target: 1800,
    get net(){ return this.consumed - this.burned }
  }
  const caloriesProgress = Math.min(100, Math.max(0, (dailyCalories.net / dailyCalories.target) * 100))

  const cardStyle = { background:'#fff', border:'1px solid #eef2f7', borderRadius:16, boxShadow:'0 10px 24px rgba(16,24,40,0.06)' }

  return (
    <div style={{minHeight:'100svh', background:'linear-gradient(180deg,#f8faf9,#e8f5ec)', paddingBottom:96}}>
      {/* Welcome */}
      <div style={{background:'linear-gradient(90deg,#34C759,#30D158)', color:'#fff', padding:'24px'}}>
        <h2 style={{margin:'0 0 6px 0'}}>こんにちは！</h2>
        <p style={{margin:0, opacity:.9}}>今日も目標に向かって頑張りましょう</p>
        <div style={{height:10}} />
        {onGoToMeals && (
          <Button className="primary-btn" onClick={onGoToMeals} style={{borderRadius:14, padding:'10px 14px', background:'rgba(255,255,255,.15)'}}>
            Go to Meal Management <ArrowRight style={{width:16, height:16, marginLeft:8}} />
          </Button>
        )}
      </div>

      <div style={{maxWidth:720, margin:'0 auto', padding:24, display:'flex', flexDirection:'column', gap:16}}>
        {/* Calorie Summary */}
        <div style={{...cardStyle, padding:24}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <h3 style={{margin:0, color:'#111827'}}>今日のカロリー</h3>
            <span style={{fontSize:13, color:'#6b7280'}}>残り {dailyCalories.target - dailyCalories.net} kcal</span>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
              <span style={{fontSize:13, color:'#374151'}}>{dailyCalories.net} / {dailyCalories.target} kcal</span>
              <span style={{fontSize:13, color:'#34C759'}}>{Math.round(caloriesProgress)}%</span>
            </div>
            <Progress value={caloriesProgress} className="h-3" />
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div style={{background:'linear-gradient(135deg,rgba(255,149,0,.1),rgba(255,149,0,.05))', padding:16, borderRadius:12, border:'1px solid rgba(255,149,0,.2)'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                <Flame className="w-5 h-5" style={{color:'#FF9500'}} />
                <span style={{fontSize:13, color:'#4b5563'}}>摂取</span>
              </div>
              <p style={{fontSize:24, color:'#111827', margin:'0 0 2px 0'}}>{dailyCalories.consumed}</p>
              <p style={{fontSize:12, color:'#6b7280', margin:0}}>kcal</p>
            </div>
            <div style={{background:'linear-gradient(135deg,rgba(90,200,250,.1),rgba(90,200,250,.05))', padding:16, borderRadius:12, border:'1px solid rgba(90,200,250,.2)'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                <Activity className="w-5 h-5" style={{color:'#5AC8FA'}} />
                <span style={{fontSize:13, color:'#4b5563'}}>消費</span>
              </div>
              <p style={{fontSize:24, color:'#111827', margin:'0 0 2px 0'}}>{dailyCalories.burned}</p>
              <p style={{fontSize:12, color:'#6b7280', margin:0}}>kcal</p>
            </div>
          </div>
        </div>

        {/* Ranking Badge */}
        <div style={{...cardStyle, padding:24, background:'linear-gradient(135deg,rgba(255,215,0,.1),rgba(255,215,0,.05))', border:'1px solid rgba(255,215,0,.2)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{display:'flex', alignItems:'center', gap:16}}>
              <div style={{width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#FFD700,#FFA500)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Award className="w-8 h-8" style={{color:'#fff'}} />
              </div>
              <div>
                <h4 style={{margin:'0 0 4px 0', color:'#111827'}}>現在のランク</h4>
                <p style={{margin:'0 0 2px 0', color:'#FFD700', fontSize:20}}>ゴールド</p>
                <p style={{margin:0, fontSize:12, color:'#6b7280'}}>次のランクまであと 3日</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5" style={{color:'#9ca3af'}} />
          </div>
          <div style={{marginTop:12}}>
            <Progress value={70} />
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
          {[{icon:'🎯', value:'7', label:'連続日数'}, {icon:'⚖️', value:'-2.5', label:'kg 減量'}, {icon:'🏃', value:'12', label:'運動回数'}].map((it, idx)=> (
            <div key={idx} style={{...cardStyle, padding:16, textAlign:'center'}}>
              <div style={{width:40, height:40, borderRadius:999, background:'rgba(52,199,89,.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px auto'}}>{it.icon}</div>
              <p style={{margin:'0 0 4px 0', fontSize:22, color:'#111827'}}>{it.value}</p>
              <p style={{margin:0, fontSize:12, color:'#6b7280'}}>{it.label}</p>
            </div>
          ))}
        </div>

        {/* Progress Message */}
        <div style={{...cardStyle, padding:20, background:'linear-gradient(90deg,#34C759,#30D158)', color:'#fff', border:'none'}}>
          <div style={{display:'flex', alignItems:'flex-start', gap:10}}>
            <span style={{fontSize:22}}><TrendingUp /></span>
            <div>
              <h4 style={{margin:'0 0 4px 0'}}>今週の進捗</h4>
              <p style={{margin:0, opacity:.9, fontSize:14}}>素晴らしいペースです！目標まであと3.5kgです。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
