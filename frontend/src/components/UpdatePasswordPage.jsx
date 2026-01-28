import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, Lock } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function UpdatePasswordPage({ onBack }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [hasSession, setHasSession] = useState(true)

  useEffect(() => {
    let mounted = true
    const initSession = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          const code = url.searchParams.get('code')

          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error && mounted) {
              setErrorMessage('セッションの作成に失敗しました。リンクを再度開いてください。')
              setHasSession(false)
              return
            }
          } else if (window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
            const accessToken = hashParams.get('access_token')
            const refreshToken = hashParams.get('refresh_token')

            if (accessToken && refreshToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              if (error && mounted) {
                setErrorMessage('セッションの作成に失敗しました。リンクを再度開いてください。')
                setHasSession(false)
                return
              }
            }
          }
        }

        const { data, error } = await supabase.auth.getSession()
        if (!mounted) return
        if (error) {
          setErrorMessage('セッションの確認に失敗しました。リンクを再度開いてください。')
          setHasSession(false)
          return
        }
        if (!data?.session) {
          setErrorMessage('セッションが見つかりません。リセットリンクを再度開いてください。')
          setHasSession(false)
        } else {
          setHasSession(true)
        }
      } catch (err) {
        if (mounted) {
          setErrorMessage('通信エラーが発生しました。リンクを再度開いてください。')
          setHasSession(false)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initSession()

    return () => {
      mounted = false
    }
  }, [])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!hasSession) return

    if (!password || password.length < 8) {
      setErrorMessage('パスワードは8文字以上で入力してください。')
      return
    }
    if (password !== confirmPassword) {
      setErrorMessage('パスワードが一致しません。')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setErrorMessage('更新に失敗しました。時間をおいて再度お試しください。')
        return
      }

      setSuccessMessage('パスワードを更新しました。ログイン画面に戻ってください。')
      setPassword('')
      setConfirmPassword('')
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, '/update-password')
      }
    } catch (err) {
      setErrorMessage('通信エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-foreground">TORI</span>
            <span className="text-primary">MO</span>
          </h1>
        </div>

        <div className="bg-card rounded-3xl shadow-lg p-8 space-y-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors mb-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">ログインに戻る</span>
          </button>

          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">新しいパスワード</h2>
            <p className="text-muted-foreground text-sm">新しいパスワードを入力してください。</p>
          </div>

          {successMessage ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-card-foreground text-sm font-medium block mb-2">新しいパスワード</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-10 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="8文字以上"
                    required
                    disabled={isLoading}
                  />
                  <Lock className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-card-foreground text-sm font-medium block mb-2">パスワード確認</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="同じパスワードを入力"
                  required
                  disabled={isLoading}
                />
              </div>

              {errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}

              <button
                type="submit"
                disabled={isLoading || !hasSession}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:opacity-90 mt-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    更新中...
                  </>
                ) : (
                  'パスワードを更新'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}