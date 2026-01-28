// ログイン画面のUIと入力処理
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage({ onLogin, onSignupClick, onForgotPasswordClick }) {
  const [showPassword, setShowPassword] = useState(false)
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!emailOrPhone || !password) {
      alert('メール/電話番号とパスワードを入力してください。')
      return
    }
    onLogin()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-foreground">TORI</span>
            <span className="text-primary">MO</span>
          </h1>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-3xl shadow-lg p-8 space-y-6 transition-colors">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">ログイン</h2>
            <p className="text-muted-foreground text-sm">
              ログインするには、電話番号またはメールアドレスとパスワードを入力してください。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Phone Number */}
            <div>
              <label className="text-card-foreground text-sm font-medium block mb-2">
                メールアドレスまたは電話番号
              </label>
              <input
                type="text"
                placeholder="メールアドレスまたは電話番号"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full h-12 px-4 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-card-foreground text-sm font-medium block mb-2">パスワード</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                  aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Keep me logged in & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-muted text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground group-hover:text-card-foreground transition-colors">
                  ログイン状態を保持
                </span>
              </label>
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                パスワードを忘れた場合
              </button>
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:opacity-90 mt-6 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              ログイン
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-muted-foreground text-sm mt-8 pt-6 border-t border-border">
            アカウントをお持ちでない方は{' '}
            <button
              type="button"
              onClick={onSignupClick}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              新規登録
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
