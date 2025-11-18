import React, { useState, useRef } from 'react'
import './MealManagement.css'

// Simple placeholder AI nutrition assistant page.
// Later we can wire real backend conversation or OpenAI integration.
export default function AINutritionAssist({ onBack, userProfile }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'こんにちは！栄養アシスタントです。あなたの目標に合わせたアドバイスを提供します。質問や「一日の食事プランを作成」などを入力してください。' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const listRef = useRef(null)

  function getApiBases(){
    const envBase = import.meta?.env?.VITE_API_BASE
    const host = (typeof window !== 'undefined' && window.location?.hostname) ? window.location.hostname : 'localhost'
    const sameHost = `http://${host}:8000`
    const arr = []
    if (envBase) arr.push(String(envBase).replace(/\/$/, ''))
    arr.push(sameHost.replace(/\/$/, ''))
    arr.push('http://localhost:8000')
    arr.push('http://127.0.0.1:8000')
    return Array.from(new Set(arr))
  }

  async function fetchFirstOk(path, init){
    const bases = getApiBases()
    let lastErr
    for(const b of bases){
      // Prevent accidental double 'api' if env base already contains /api
      const cleanPath = path.startsWith('/') ? path : '/' + path
      const needsStrip = /\/api\/?$/.test(b) && cleanPath.startsWith('/api/')
      const url = needsStrip ? b.replace(/\/api\/?$/, '') + cleanPath : b + cleanPath
      try{
        const res = await fetch(url, init)
        if(res.ok) return res
        lastErr = new Error(`HTTP ${res.status} at ${url}`)
      }catch(e){ lastErr = e }
    }
    throw lastErr || new Error('All API bases failed')
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFirstOk('/api/assistant/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg], profile: userProfile })
      })
      const data = await res.json()
      const replyText = data.reply || '回答を取得できませんでした。'
      setMessages(prev => [...prev, { role: 'assistant', content: replyText }])
    } catch (e){
      console.error(e)
      setError(e.message || String(e))
      setMessages(prev => [...prev, { role: 'assistant', content: 'サーバーへの接続に失敗しました。後で再試行してください。' }])
    } finally {
      setLoading(false)
      // scroll to bottom
      setTimeout(()=>{ listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior:'smooth'}) }, 50)
    }
  }

  return (
    <div className="meals-page">
      <div className="meals-header" style={{display:'flex', alignItems:'center', gap:12}}>
        <button className="secondary-btn" style={{height:36, padding:'0 14px'}} onClick={onBack}>← 戻る</button>
        <h1 style={{margin:0}}>AI栄養アシスト</h1>
      </div>
      <div className="meals-container">
        <div className="card" style={{background:'linear-gradient(135deg,#34C759,#30D158)', color:'#fff'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{fontSize:30}}>✨</div>
            <div>
              <strong>パーソナライズされた食事サポート</strong>
              <p style={{margin:'4px 0 0 0', fontSize:12, opacity:.85}}>あなたの目標に合わせたメニューや栄養改善のヒントを提供します。</p>
            </div>
          </div>
        </div>
        <div className="card" style={{marginTop:16}}>
          <h3 className="card-title">チャット</h3>
          <div ref={listRef} style={{display:'flex', flexDirection:'column', gap:10, maxHeight:360, overflowY:'auto', paddingRight:4}}>
            <div className="small muted" style={{marginBottom:4}}>プロフィール: {userProfile?.height_cm}cm / {userProfile?.weight_kg}kg / 目標 {userProfile?.goal_calories}kcal</div>
            {messages.map((m,i)=>(
              <div key={i} className="comment-box" style={{background: m.role==='assistant'? '#f6faf7':'#eef6ff', borderColor: m.role==='assistant'? '#e3f2e7':'#c9e2ff'}}>
                <div style={{fontSize:11, fontWeight:600, marginBottom:4, color:'#374151'}}>{m.role==='assistant'?'アシスタント':'あなた'}</div>
                <div style={{whiteSpace:'pre-wrap'}}>{m.content}</div>
              </div>
            ))}
          </div>
          <div className="row" style={{marginTop:12}}>
            <textarea className="torimo-input" rows={2} placeholder="相談内容を入力..." value={input} onChange={e=>setInput(e.target.value)} style={{flex:1, resize:'vertical'}} onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); }}} />
            <button type="button" className="primary-btn" style={{flexBasis:120}} onClick={handleSend} disabled={loading}>{loading ? '送信中…' : '送信'}</button>
          </div>
          {error && <div className="small" style={{color:'#d9534f', marginTop:8}}>Error: {error}</div>}
        </div>
      </div>
    </div>
  )
}
