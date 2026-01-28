import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const API_BASE = (import.meta.env?.VITE_API_BASE || 'http://localhost:8000').replace(/\/$/, '')

export default function NotesPage({ onBack }) {
  const { user, getAccessToken } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', body: '' })
  const [refreshTick, setRefreshTick] = useState(0)

  const headers = useMemo(() => {
    const token = getAccessToken()
    const nextHeaders = {
      'Content-Type': 'application/json',
    }
    if (token) {
      nextHeaders.Authorization = `Bearer ${token}`
    }
    return nextHeaders
  }, [getAccessToken])

  useEffect(() => {
    if (!user) {
      setNotes([])
      return
    }
    setLoading(true)
    setError('')
    fetch(`${API_BASE}/api/notes/`, {
      method: 'GET',
      headers,
    })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}))
          throw new Error(payload.detail || 'ノートの取得に失敗しました')
        }
        return res.json()
      })
      .then((data) => setNotes(data.notes || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, headers, refreshTick])

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl bg-white p-6 text-center shadow">
          <p className="text-sm text-gray-600">Supabase にサインインするとノートを管理できます。</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-600"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { title: form.title.trim(), body: form.body.trim() }
    if (!payload.title) {
      setError('タイトルを入力してください')
      return
    }
    const res = await fetch(`${API_BASE}/api/notes/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.detail || 'ノートの作成に失敗しました')
      return
    }
    setForm({ title: '', body: '' })
    setRefreshTick((tick) => tick + 1)
  }

  const handleDelete = async (noteId) => {
    setError('')
    const res = await fetch(`${API_BASE}/api/notes/${noteId}/`, {
      method: 'DELETE',
      headers,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.detail || '削除に失敗しました')
      return
    }
    setRefreshTick((tick) => tick + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 px-4 pb-24 pt-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">プライベートノート</h1>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-gray-300"
          >
            戻る
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">Supabase JWT トークンで保護された Django API を経由します。</p>

        <form onSubmit={handleCreate} className="mt-6 rounded-3xl border border-gray-100 bg-white p-4 shadow">
          <div className="space-y-3">
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="タイトル"
              className="w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              placeholder="内容 (任意)"
              rows={3}
              className="w-full rounded-2xl border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-500 py-3 text-white transition hover:bg-emerald-600"
            >
              ノートを保存
            </button>
          </div>
        </form>

        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        <section className="mt-6 space-y-4">
          {loading && <p className="text-sm text-gray-500">読み込み中...</p>}
          {!loading && notes.length === 0 && <p className="text-sm text-gray-500">ノートはまだありません。</p>}
          {notes.map((note) => (
            <article key={note.id} className="rounded-3xl border border-gray-100 bg-white p-4 shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{note.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{note.body || '（本文なし）'}</p>
                  <p className="mt-2 text-xs text-gray-400">{new Date(note.created_at).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:border-gray-300"
                >
                  削除
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
