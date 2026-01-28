// お問い合わせフォーム
import { motion } from 'framer-motion'
import { Mail, Phone, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { useState } from 'react'

export function ContactPage({ theme = 'light', onBack }) {
  const resolveApiBase = () => {
    const envBase = import.meta?.env?.VITE_API_BASE
    if (envBase) {
      return envBase.replace(/\/$/, '')
    }
    if (typeof window !== 'undefined') {
      const { protocol, hostname, port } = window.location
      if (port && port !== '8000' && port !== '80' && port !== '443') {
        return `${protocol}//${hostname}:8000`
      }
      return `${protocol}//${hostname}${port ? `:${port}` : ''}`
    }
    return 'http://127.0.0.1:8000'
  }

  const categories = [
    { value: 'general', label: '一般的な質問', icon: '💬' },
    { value: 'technical', label: '技術的な問題', icon: '⚙️' },
    { value: 'billing', label: '請求・支払い', icon: '💳' },
    { value: 'feature', label: '機能リクエスト', icon: '✨' },
    { value: 'bug', label: 'バグ報告', icon: '🐛' },
    { value: 'other', label: 'その他', icon: '📝' },
  ]

  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError('')

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      category: form.category,
      subject: form.subject.trim(),
      message: form.message.trim(),
    }

    fetch(`${resolveApiBase()}/api/support/contact/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.detail || '送信に失敗しました。')
        }
        setIsSubmitted(true)
      })
      .catch((err) => {
        setSubmitError(err?.message || '送信に失敗しました。')
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  if (isSubmitted) {
    return (
      <div
        className={`min-h-screen pb-36 transition-colors ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-zinc-950 to-zinc-900'
            : 'bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec]'
        }`}
      >
        <div className="max-w-2xl mx-auto px-6 py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="text-center"
          >
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle
                  className="w-24 h-24 mx-auto"
                  style={{ color: theme === 'dark' ? '#00ff41' : '#34C759' }}
                />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-3xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              送信完了
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`text-lg mb-8 ${
                theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
              }`}
            >
              お問い合わせありがとうございます。<br />
              2営業日以内にご返信いたします。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card
                className={`p-6 mb-6 rounded-2xl border-2 transition-colors ${
                  theme === 'dark'
                    ? 'bg-zinc-900 border-[#00ff41]/20'
                    : 'bg-white border-[#34C759]/30'
                }`}
              >
                <div
                  className={`text-sm space-y-2 ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: theme === 'dark' ? '#00ff41' : '#34C759' }}
                    />
                    <div className="text-left">
                      <p className="font-bold mb-1">お問い合わせ内容の確認</p>
                      <p className="text-xs">
                        カテゴリー: {categories.find((c) => c.value === form.category)?.label}
                        <br />
                        件名: {form.subject || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {onBack && (
                <Button
                  onClick={onBack}
                  className={`rounded-full px-8 ${
                    theme === 'dark'
                      ? 'bg-[#00ff41] text-zinc-950 hover:bg-[#00ff41]/90'
                      : 'bg-gradient-to-r from-[#34C759] to-[#30D158] text-white hover:opacity-90'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ヘルプに戻る
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen pb-36 transition-colors ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-zinc-950 to-zinc-900'
          : 'bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec]'
      }`}
    >
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={onBack}
            className="h-9 px-3 rounded-lg bg-white/90 text-gray-700 border border-gray-200 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            お問い合わせ
          </h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card
            className={`p-6 rounded-2xl border-2 transition-colors ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
            }`}
          >
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  お名前
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-800 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="山田 太郎"
                />
              </div>
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  メールアドレス
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-800 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  カテゴリー
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-800 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  件名
                </label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-800 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="お問い合わせの件名"
                />
              </div>
              <div>
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  内容
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className={`mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-800 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="ご質問やご相談内容を入力してください"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#34C759] to-[#30D158] text-white hover:opacity-90 rounded-full"
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? '送信中…' : '送信する'}
              </Button>
              {submitError && (
                <p className="text-xs text-red-600 mt-2">{submitError}</p>
              )}
            </form>
          </Card>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            className={`p-4 rounded-2xl border ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#5AC8FA]" />
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  support@torimo-app.com
                </p>
                <p className="text-xs text-gray-500">24時間以内に返信</p>
              </div>
            </div>
          </Card>
          <Card
            className={`p-4 rounded-2xl border ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#AF52DE]" />
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  03-1234-5678
                </p>
                <p className="text-xs text-gray-500">平日 9:00-18:00</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
