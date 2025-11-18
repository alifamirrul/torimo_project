import { useState } from 'react'
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from 'lucide-react'

export default function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setEmailSent(true)
    }, 1500)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3">
              <span className="text-foreground">TORI</span>
              <span className="text-primary">MO</span>
            </h1>
          </div>

          {/* Success Card */}
          <div className="bg-card rounded-3xl shadow-lg p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-card-foreground">メールを送信しました</h2>
              
              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  <span className="font-medium text-card-foreground">{email}</span> 宛に確認メールを送信しました。
                </p>
                <p>
                  メールに記載されたリンクをクリックして、パスワードのリセットを完了してください。
                </p>
              </div>

              <div className="bg-muted rounded-xl p-4 mt-6 border border-border">
                <div className="flex items-start gap-3 text-left">
                  <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>メールが届かない場合は、迷惑メールフォルダをご確認ください。</p>
                    <p>数分経ってもメールが届かない場合は、再度お試しください。</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onBack}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:opacity-90 mt-6 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                ログインに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-foreground">TORI</span>
            <span className="text-primary">MO</span>
          </h1>
        </div>

        {/* Password Reset Form */}
        <div className="bg-card rounded-3xl shadow-lg p-8 space-y-6">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">ログインに戻る</span>
          </button>

          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-card-foreground mb-2">パスワードのリセット</h2>
              <p className="text-muted-foreground text-sm">
                登録したメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
              </p>
            </div>

            <div>
              <label className="text-card-foreground text-sm font-medium block mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:opacity-90 mt-6 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  送信中...
                </>
              ) : (
                'リセットリンクを送信'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
