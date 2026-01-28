import { useEffect, useState } from 'react'
import { CheckCircle2, Mail, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function EmailConfirmationPage({ theme = 'light', onContinue }) {
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true

    const handleConfirmation = async () => {
      try {
        if (typeof window === 'undefined') return
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          if (mounted) {
            setStatus('success')
            setMessage('メールアドレスの確認が完了しました。')
          }
          return
        }

        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            if (error) throw error
            if (mounted) {
              setStatus('success')
              setMessage('メールアドレスの確認が完了しました。')
            }
            return
          }
        }

        if (mounted) {
          setStatus('success')
          setMessage('メールアドレスの確認が完了しました。')
        }
      } catch (err) {
        if (mounted) {
          setStatus('error')
          setMessage(err?.message || '確認処理に失敗しました。')
        }
      }
    }

    handleConfirmation()
    return () => {
      mounted = false
    }
  }, [])

  const icon = status === 'error' ? AlertCircle : status === 'loading' ? Loader2 : CheckCircle2
  const Icon = icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-foreground">TORI</span>
            <span className="text-primary">MO</span>
          </h1>
          <p className="text-muted-foreground text-sm">メール確認</p>
        </div>

        <div className="bg-card rounded-3xl shadow-lg p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon className={`w-8 h-8 ${status === 'loading' ? 'animate-spin' : ''} text-primary`} />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-card-foreground">
            {status === 'loading' ? '確認中...' : status === 'error' ? '確認に失敗しました' : '確認完了'}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message || 'しばらくお待ちください。'}
          </p>

          {status !== 'loading' && (
            <div className="space-y-3">
              <div className="bg-muted rounded-xl p-4 border border-border text-left text-xs text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p>確認が完了したら、ログインしてご利用ください。</p>
                    <p>問題がある場合は、再度メールをご確認ください。</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onContinue}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:opacity-90 shadow-md transition-all active:scale-[0.98]"
              >
                ログイン画面へ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
