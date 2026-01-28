import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function SignInPage({ onSuccess, onCancel, onShowSignup, onForgotPassword }) {
  const { user, loading, error, signInWithPassword, signInWithOAuth, signOut } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSignIn = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      await signInWithPassword({ email: form.email, password: form.password })
      setMessage('サインインに成功しました。')
      onSuccess?.()
    } catch (err) {
      setMessage(err.message || 'サインインに失敗しました。')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOAuth = async () => {
    setSubmitting(true)
    setMessage('')
    try {
      await signInWithOAuth('github') // Configure the provider in Supabase before using.
    } catch (err) {
      setMessage(err.message || 'OAuth サインインに失敗しました。')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    setSubmitting(true)
    setMessage('')
    try {
      await signOut()
      setMessage('サインアウトしました。')
    } catch (err) {
      setMessage(err.message || 'サインアウトに失敗しました。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3fbf5] to-[#dff6e6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold tracking-[0.2em]">
            <span className="text-gray-800">TORI</span>
            <span className="text-emerald-500">MO</span>
          </h1>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-2xl shadow-emerald-100/80">
          <h2 className="text-center text-lg font-semibold text-gray-900">ログイン</h2>
          <p className="mt-2 text-center text-xs text-gray-500">
            ログインするには、電話番号またはメールアドレスとパスワードを入力してください。
          </p>

          <form className="mt-6 space-y-4" onSubmit={handlePasswordSignIn}>
            <div>
              <label className="text-xs font-semibold text-gray-600">メールアドレスまたは電話番号</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="メールアドレスまたは電話番号"
                className="mt-1 w-full rounded-2xl border border-gray-100 bg-gray-100/80 px-3 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">パスワード</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="パスワード"
                className="mt-1 w-full rounded-2xl border border-gray-100 bg-gray-100/80 px-3 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
                />
                ログイン状態を保持
              </label>
              <button
                type="button"
                className="text-emerald-500 font-medium hover:text-emerald-600"
                onClick={() => onForgotPassword?.()}
              >
                パスワードを忘れた場合
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-[18px] bg-gradient-to-r from-emerald-400 to-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'ログイン中…' : 'ログイン'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleOAuth}
            disabled={submitting}
            className="mt-4 w-full rounded-2xl border border-gray-200 py-3 text-xs font-semibold text-gray-600 hover:border-emerald-200 disabled:opacity-50"
          >
            GitHub でサインイン
          </button>

          {message && <p className="mt-4 rounded-2xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{message}</p>}
          {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}

          <div className="mt-6 text-center text-xs text-gray-500">
            アカウントをお持ちでない方は{' '}
            <button
              type="button"
              onClick={() => onShowSignup?.()}
              className="font-semibold text-emerald-500 hover:text-emerald-600"
            >
              新規登録
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-gray-500">
          ローディング: {loading ? 'はい' : 'いいえ'} / ユーザーID: {user?.id || '—'}
        </div>
      </div>
    </div>
  )
}
