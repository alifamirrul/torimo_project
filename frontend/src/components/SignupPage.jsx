import { useState } from 'react'
import { Eye, EyeOff, ChevronRight, ChevronLeft, Check, X } from 'lucide-react'

export default function SignupPage({ onSignup, onBackToLogin }) {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 1: Account Info
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2: Personal Info
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')

  // Step 3: Body Info
  const [height, setHeight] = useState('')
  const [currentWeight, setCurrentWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')

  // Step 4: Goals
  const [goal, setGoal] = useState('')
  const [activityLevel, setActivityLevel] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
  }

  const isPasswordValid = passwordValidation.minLength && 
                          passwordValidation.hasUpperCase && 
                          passwordValidation.hasLowerCase

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step === totalSteps) {
      onSignup()
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return email && password && confirmPassword && password === confirmPassword && isPasswordValid
      case 2:
        return name && age && gender
      case 3:
        return height && currentWeight && targetWeight
      case 4:
        return goal && activityLevel && agreedToTerms
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-foreground">TORI</span>
            <span className="text-primary">MO</span>
          </h1>
          <p className="text-muted-foreground text-sm">アカウントを作成</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">ステップ {step} / {totalSteps}</span>
            <span className="text-sm text-primary font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/90 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-3xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Account Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-card-foreground mb-2">アカウント情報</h2>
                  <p className="text-sm text-muted-foreground">
                    メールアドレスとパスワードを設定してください
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="text-card-foreground text-sm font-medium block mb-2">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="text-card-foreground text-sm font-medium block mb-2">
                    パスワード
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="8文字以上"
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
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicators */}
                  {password && (
                    <div className="mt-3 space-y-2 p-3 bg-muted rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-2">パスワード要件:</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          {passwordValidation.minLength ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className={`text-xs ${passwordValidation.minLength ? 'text-primary' : 'text-muted-foreground'}`}>
                            8文字以上
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordValidation.hasUpperCase ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className={`text-xs ${passwordValidation.hasUpperCase ? 'text-primary' : 'text-muted-foreground'}`}>
                            大文字を含む (A-Z)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordValidation.hasLowerCase ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className={`text-xs ${passwordValidation.hasLowerCase ? 'text-primary' : 'text-muted-foreground'}`}>
                            小文字を含む (a-z)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="text-card-foreground text-sm font-medium block mb-2">
                    パスワード確認
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="パスワードを再入力"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 px-4 pr-12 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                      aria-label={showConfirmPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-destructive text-xs mt-2 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      パスワードが一致しません
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-card-foreground mb-2">基本情報</h2>
                  <p className="text-sm text-muted-foreground">
                    あなたについて教えてください
                  </p>
                </div>

                <div>
                  <label htmlFor="name" className="text-card-foreground text-sm font-medium block mb-2">
                    お名前
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="山田 太郎"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="age" className="text-card-foreground text-sm font-medium block mb-2">
                    年齢
                  </label>
                  <input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full h-12 px-4 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-card-foreground text-sm font-medium block mb-3">性別</label>
                  <div className="space-y-3">
                    {['male', 'female', 'other'].map((value) => (
                      <label
                        key={value}
                        className={`flex items-center space-x-3 p-4 bg-muted rounded-xl cursor-pointer border-2 transition-all ${
                          gender === value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-transparent hover:border-border'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={value}
                          checked={gender === value}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-card-foreground font-medium">
                          {value === 'male' ? '男性' : value === 'female' ? '女性' : 'その他'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Body Information */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-card-foreground mb-2">身体情報</h2>
                  <p className="text-sm text-muted-foreground">
                    現在の体型と目標を入力してください
                  </p>
                </div>

                <div>
                  <label htmlFor="height" className="text-card-foreground text-sm font-medium block mb-2">
                    身長 (cm)
                  </label>
                  <input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full h-12 px-4 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="currentWeight" className="text-card-foreground text-sm font-medium block mb-2">
                    現在の体重 (kg)
                  </label>
                  <input
                    id="currentWeight"
                    type="number"
                    step="0.1"
                    placeholder="70.0"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="w-full h-12 px-4 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="targetWeight" className="text-card-foreground text-sm font-medium block mb-2">
                    目標体重 (kg)
                  </label>
                  <input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    placeholder="65.0"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full h-12 px-4 bg-muted border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 4: Goals and Activity Level */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-card-foreground mb-2">目標設定</h2>
                  <p className="text-sm text-muted-foreground">
                    あなたの目標と活動レベルを選択してください
                  </p>
                </div>

                <div>
                  <label className="text-card-foreground text-sm font-medium block mb-3">主な目標</label>
                  <div className="space-y-3">
                    {[
                      { value: 'lose', label: '体重を減らす' },
                      { value: 'maintain', label: '体重を維持する' },
                      { value: 'gain', label: '筋肉をつける' }
                    ].map((item) => (
                      <label
                        key={item.value}
                        className={`flex items-center space-x-3 p-4 bg-muted rounded-xl cursor-pointer border-2 transition-all ${
                          goal === item.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-transparent hover:border-border'
                        }`}
                      >
                        <input
                          type="radio"
                          name="goal"
                          value={item.value}
                          checked={goal === item.value}
                          onChange={(e) => setGoal(e.target.value)}
                          className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-card-foreground font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-card-foreground text-sm font-medium block mb-3">活動レベル</label>
                  <div className="space-y-3">
                    {[
                      { value: 'sedentary', label: 'ほとんど運動しない', sub: 'デスクワーク中心' },
                      { value: 'light', label: '軽い運動', sub: '週1-3日' },
                      { value: 'moderate', label: '中程度の運動', sub: '週3-5日' },
                      { value: 'active', label: '激しい運動', sub: '週6-7日' }
                    ].map((item) => (
                      <label
                        key={item.value}
                        className={`flex items-center space-x-3 p-4 bg-muted rounded-xl cursor-pointer border-2 transition-all ${
                          activityLevel === item.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-transparent hover:border-border'
                        }`}
                      >
                        <input
                          type="radio"
                          name="activityLevel"
                          value={item.value}
                          checked={activityLevel === item.value}
                          onChange={(e) => setActivityLevel(e.target.value)}
                          className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <div className="flex-1">
                          <div className="text-card-foreground font-medium">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-border bg-muted text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-card-foreground transition-colors">
                      <a href="#" className="text-primary hover:text-primary/80 font-medium">
                        利用規約
                      </a>
                      と
                      <a href="#" className="text-primary hover:text-primary/80 font-medium">
                        プライバシーポリシー
                      </a>
                      に同意します
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 h-12 flex items-center justify-center gap-2 border-2 border-border text-card-foreground rounded-xl font-medium hover:bg-muted transition-all active:scale-[0.98]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  戻る
                </button>
              )}
              
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-[0.98]"
                >
                  次へ
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid()}
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" />
                  アカウント作成
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Back to Login */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          すでにアカウントをお持ちですか？{' '}
          <button
            onClick={onBackToLogin}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            ログイン
          </button>
        </p>
      </div>
    </div>
  )
}
