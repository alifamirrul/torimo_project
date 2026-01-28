import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Ruler,
  Weight,
  Target,
  Zap,
  TrendingUp,
  Activity,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

// 目標の選択肢
const goalOptions = [
  { value: '脂肪燃焼', label: '脂肪燃焼', icon: '🔥' },
  { value: '筋肉量増加', label: '筋肉量増加', icon: '💪' },
]

// トレーニング強度の選択肢
const intensityOptions = [
  { value: 'low', label: '低', icon: '🌱', description: '初心者向け' },
  { value: 'mid', label: '中', icon: '⚡', description: '標準' },
  { value: 'high', label: '強', icon: '🔥', description: '上級者向け' },
]

// 鍛えたい部位の選択肢
const targetPartOptions = [
  { value: '肩', label: '肩', icon: '🏋️' },
  { value: '背中', label: '背中', icon: '🔙' },
  { value: '胸', label: '胸', icon: '💓' },
  { value: '腕', label: '腕', icon: '💪' },
  { value: '腹', label: '腹', icon: '🧘' },
  { value: '尻', label: '尻', icon: '🍑' },
  { value: '足', label: '足', icon: '🦵' },
  { value: '全身', label: '全身', icon: '🏃' },
]

// 部位・強度ごとのメニュー一覧
const trainingMenus = {
  胸: {
    low: [
      { name: 'プッシュアップ', href: '../training_menu_explanetion/chest/chest.html', label: '詳しい解説はこちら' },
      { name: 'チェストスクイーズ', href: '../training_menu_explanetion/chest/chest.html', label: '詳しい解説はこちら' },
      { name: 'インクラインプッシュアップ', href: '../training_menu_explanetion/chest/chest.html', label: '詳しい解説はこちら' },
    ],
    mid: [
      { name: 'ディクラインプッシュアップ', href: '../training_menu_explanetion/chest/chest.html', label: '詳しい解説はこちら' },
      { name: 'ダンベルプレス', href: '../training_menu_explanetion/chest/chest.html', label: '詳しい解説はこちら' },
      { name: 'プッシュアッププランクタッチ', href: '../training_menu_explanetion/chest/chest.html', label: '詳しい解説はこちら' },
    ],
    high: [
      { name: 'ナロープッシュアップ', href: '../training_menu_explanetion/chest/chest.html', label: '詳しい解説はこちら' },
      { name: 'ダンベルフライ', href: '../training_menu_explanetion/chest/chest.html', label: '詳しい解説はこちら' },
      { name: 'アーチャープッシュアップ', href: '../training_menu_explanetion/chest/chest.html', label: '詳しい解説はこちら' },
    ],
  },
  肩: {
    low: [
      { name: 'バイクプッシュアップ', href: '../training_menu_explanetion/sholder/sholder.html', label: '詳しい解説はこちら' },
      { name: 'ハイ・ロープランク', href: '../training_menu_explanetion/sholder/sholder.html', label: '詳しい解説はこちら' },
      { name: 'Tレイズ', href: '../training_menu_explanetion/sholder/sholder.html', label: '詳しい解説はこちら' },
    ],
    mid: [
      { name: 'Wレイズ', href: '../training_menu_explanetion/sholder/sholder.html', label: '詳しい解説はこちら' },
      { name: 'アーノルドプレス', href: '../training_menu_explanetion/sholder/sholder.html', label: '詳しい解説はこちら' },
      { name: 'リアレイズ', href: '../training_menu_explanetion/sholder/sholder.html', label: '詳しい解説はこちら' },
    ],
    high: [
      { name: 'ショルダープレス', href: '../training_menu_explanetion/sholder/sholder.html', label: '詳しい解説はこちら' },
      { name: 'サイドレイズ', href: '../training_menu_explanetion/sholder/sholder.html', label: '詳しい解説はこちら' },
      { name: 'ベントオーバーリアレイズ', href: '../training_menu_explanetion/sholder/sholder.html', label: '詳しい解説はこちら' },
    ],
  },
  背中: {
    low: [
      { name: 'バードドッグ', href: '../training_menu_explanetion/back/back.html', label: '詳しい解説はこちら' },
      { name: 'リバーススノーエンジェル', href: '../training_menu_explanetion/back/back.html', label: '詳しい解説はこちら' },
      { name: 'スイマー', href: '../training_menu_explanetion/back/back.html', label: '詳しい解説はこちら' },
    ],
    mid: [
      { name: 'デッドリフト', href: '../training_menu_explanetion/back/back.html', label: '詳しい解説はこちら' },
      { name: 'ワンハンドダンベルロウ', href: '../training_menu_explanetion/back/back.html', label: '詳しい解説はこちら' },
      { name: 'ダンベルプルオーバー', href: '../training_menu_explanetion/back/back.html', label: '詳しい解説はこちら' },
    ],
    high: [
      { name: 'ペンドレイロウ', href: '../training_menu_explanetion/back/back.html', label: '詳しい解説はこちら' },
      { name: 'メドウズロウ', href: '../training_menu_explanetion/back/back.html', label: '詳しい解説はこちら' },
      { name: 'ベントロウ', href: '../training_menu_explanetion/back/back.html', label: '詳しい解説はこちら' },
    ],
  },
  腕: {
    low: [
      { name: 'プッシュアップ', href: '../training_menu_explanetion/arm/arm.html', label: '詳しい解説はこちら' },
      { name: 'テーブルトライセップス', href: '../training_menu_explanetion/arm/arm.html', label: '詳しい解説はこちら' },
      { name: 'タオルアームカール', href: '../training_menu_explanetion/arm/arm.html', label: '詳しい解説はこちら' },
    ],
    mid: [
      { name: 'アームカール', href: '../training_menu_explanetion/arm/arm.html', label: '詳しい解説はこちら' },
      { name: 'ハンマーカール', href: '../training_menu_explanetion/arm/arm.html', label: '詳しい解説はこちら' },
      { name: 'キックバック', href: '../training_menu_explanetion/arm/arm.html', label: '詳しい解説はこちら' },
    ],
    high: [
      { name: 'コンセントレーションカール', href: '../training_menu_explanetion/arm/arm.html', label: '詳しい解説はこちら' },
      { name: 'スカルクラッシャー', href: '../training_menu_explanetion/arm/arm.html', label: '詳しい解説はこちら' },
      { name: 'プリチャーカール', href: '../training_menu_explanetion/arm/arm.html', label: '詳しい解説はこちら' },
    ],
  },
  腹: {
    low: [
      { name: 'ニートゥチェスト', href: '../training_menu_explanetion/body/body.html', label: '詳しい解説はこちら' },
      { name: 'クランチ', href: '../training_menu_explanetion/body/body.html', label: '詳しい解説はこちら' },
      { name: 'デッドバグ', href: '../training_menu_explanetion/body/body.html', label: '詳しい解説はこちら' },
    ],
    mid: [
      { name: 'レッグレイズ', href: '../training_menu_explanetion/body/body.html', label: '詳しい解説はこちら' },
      { name: 'バイシクルクランチ', href: '../training_menu_explanetion/body/body.html', label: '詳しい解説はこちら' },
      { name: 'プランク', href: '../training_menu_explanetion/body/body.html', label: '詳しい解説はこちら' },
    ],
    high: [
      { name: 'ｖシットアップ', href: '../training_menu_explanetion/body/body.html', label: '詳しい解説はこちら' },
      { name: 'ジャックナイフ', href: '../training_menu_explanetion/body/body.html', label: '詳しい解説はこちら' },
      { name: 'ドラゴンフラッグ', href: '../training_menu_explanetion/body/body.html', label: '詳しい解説はこちら' },
    ],
  },
  尻: {
    low: [
      { name: 'ヒップリフト', href: '../training_menu_explanetion/hip/hip.html', label: '詳しい解説はこちら' },
      { name: 'ドンキーキック', href: '../training_menu_explanetion/hip/hip.html', label: '詳しい解説はこちら' },
      { name: 'サイドレッグレイズ', href: '../training_menu_explanetion/hip/hip.html', label: '詳しい解説はこちら' },
    ],
    mid: [
      { name: 'ブルガリアンスクワット', href: '../training_menu_explanetion/hip/hip.html', label: '詳しい解説はこちら' },
      { name: 'ワイドスクワット', href: '../training_menu_explanetion/hip/hip.html', label: '詳しい解説はこちら' },
      { name: 'ヒップスラスト', href: '../training_menu_explanetion/hip/hip.html', label: '詳しい解説はこちら' },
    ],
    high: [
      { name: 'ピストルスクワット', href: '../training_menu_explanetion/hip/hip.html', label: '詳しい解説はこちら' },
      { name: 'ジャンプスクワット', href: '../training_menu_explanetion/hip/hip.html', label: '詳しい解説はこちら' },
      { name: 'クロススクワット', href: '../training_menu_explanetion/hip/hip.html', label: '詳しい解説はこちら' },
    ],
  },
  足: {
    low: [
      { name: 'スクワット', href: '../training_menu_explanetion/leg/leg.html', label: '詳しい解説はこちら' },
      { name: 'ランジ', href: '../training_menu_explanetion/leg/leg.html', label: '詳しい解説はこちら' },
      { name: 'カーフレイズ', href: '../training_menu_explanetion/leg/leg.html', label: '詳しい解説はこちら' },
    ],
    mid: [
      { name: 'ブルガリアンスクワット', href: '../training_menu_explanetion/leg/leg.html', label: '詳しい解説はこちら' },
      { name: 'サイドランジ', href: '../training_menu_explanetion/leg/leg.html', label: '詳しい解説はこちら' },
      { name: 'ジャンプスクワット', href: '../training_menu_explanetion/leg/leg.html', label: '詳しい解説はこちら' },
    ],
    high: [
      { name: 'スキージャンプスクワット', href: '../training_menu_explanetion/leg/leg.html', label: '詳しい解説はこちら' },
      { name: 'ナロースクワット', href: '../training_menu_explanetion/leg/leg.html', label: '詳しい解説はこちら' },
      { name: 'ドンキーカーフレイズ', href: '../training_menu_explanetion/leg/leg.html', label: '詳しい解説はこちら' },
    ],
  },
  全身: {
    low: [
      { name: 'ジャンピングジャックス', href: '../training_menu_explanetion/whole_body/whole_body.html', label: '詳しい解説はこちら' },
      { name: 'ニーアップ(モモ上げ)', href: '../training_menu_explanetion/whole_body/whole_body.html', label: '詳しい解説はこちら' },
      { name: 'スクワット', href: '../training_menu_explanetion/whole_body/whole_body.html', label: '詳しい解説はこちら' },
    ],
    mid: [
      { name: 'マウンテンクライマー', href: '../training_menu_explanetion/whole_body/whole_body.html', label: '詳しい解説はこちら' },
      { name: 'バーピー', href: '../training_menu_explanetion/whole_body/whole_body.html', label: '詳しい解説はこちら' },
      { name: 'ジャンピングスクワット', href: '../training_menu_explanetion/whole_body/whole_body.html', label: '詳しい解説はこちら' },
    ],
    high: [
      { name: 'ジャンプランジ', href: '../training_menu_explanetion/whole_body/whole_body.html', label: '詳しい解説はこちら' },
      { name: 'ランジスクワット', href: '../training_menu_explanetion/whole_body/whole_body.html', label: '詳しい解説はこちら' },
      { name: 'バーピージャックス', href: '../training_menu_explanetion/whole_body/whole_body.html', label: '詳しい解説はこちら' },
    ],
  },
}

// BMIを計算する
const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100
  if (!heightInMeters) {
    return 0
  }
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(2))
}

// BMIの区分を返す
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return '低体重'
  if (bmi < 25) return '標準体重'
  if (bmi < 30) return '肥満(1度)'
  return '肥満(2度以上)'
}

// BMIと目標に応じたアドバイスを作成
const generateAdvice = (bmi, trainingIntensity, goalBody) => {
  let advice = ''
  let bodyConstitution = ''
  let goalAdvice = ''

  if (bmi < 18.5) {
    advice = '体重が低すぎます。栄養をしっかり摂りましょう。'
  } else if (bmi < 25) {
    advice = '標準体型です。運動を続けましょう。'
  } else {
    advice = '体重が少し多めです。食事と運動を見直しましょう。'
  }

  if (trainingIntensity === 'low') {
    bodyConstitution = '初心者向けです。無理せず始めましょう。'
  } else if (trainingIntensity === 'mid') {
    bodyConstitution = '中級者向けです。バランスよくトレーニングしましょう。'
  } else {
    bodyConstitution = '上級者向けです。体力に合わせて挑戦しましょう。'
  }

  if (goalBody === '脂肪燃焼') {
    goalAdvice = '有酸素運動中心に、歩数7000歩以上を目指しましょう。'
  } else if (goalBody === '筋肉量増加') {
    goalAdvice = '無酸素運動中心に、低脂質・高タンパク食を意識しましょう。'
  }

  return { advice, bodyConstitution, goalBody: goalAdvice }
}

// 目標に合わせてメニューを調整
const adjustByGoal = (menuList, goal) => {
  if (!menuList) {
    return []
  }
  if (goal === '脂肪燃焼' || goal === '筋肉量増加') {
    return menuList.map((item) => ({ ...item }))
  }
  return menuList
}

// 入力内容から最適メニューを選ぶ
const generateOptimalMenu = (part, level, goal) => {
  const menuList = trainingMenus[part]?.[level]
  return adjustByGoal(menuList, goal)
}

// メニュー提案画面
const TrainingMenuSuggestion = ({ theme = 'light', onBack }) => {
  // 入力フォームの状態
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    goal: '脂肪燃焼',
    intensity: 'mid',
    targetPart: '全身',
  })
  // 診断結果
  const [result, setResult] = useState(null)
  // 送信済みかどうか
  const [isSubmitted, setIsSubmitted] = useState(false)

  // 診断ボタン押下時の処理
  const handleSubmit = () => {
    if (!formData.age || !formData.height || !formData.weight) {
      alert('すべての項目を入力してください')
      return
    }

    const height = parseInt(formData.height, 10)
    const weight = parseInt(formData.weight, 10)

    const bmi = calculateBMI(weight, height)
    const bmiCategory = getBMICategory(bmi)
    const adviceResult = generateAdvice(bmi, formData.intensity, formData.goal)
    const recommendedExercises = generateOptimalMenu(
      formData.targetPart,
      formData.intensity,
      formData.goal
    )

    setResult({
      bmi,
      bmiCategory,
      adviceResult,
      recommendedExercises,
    })
    setIsSubmitted(true)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // もう一度診断する
  const handleReset = () => {
    setIsSubmitted(false)
    setResult(null)
    setFormData({
      age: '',
      height: '',
      weight: '',
      goal: '脂肪燃焼',
      intensity: 'mid',
      targetPart: '全身',
    })
  }

  return (
    <div
      className={`min-h-screen transition-colors ${
        theme === 'dark' ? 'bg-gradient-to-b from-zinc-950 to-zinc-900' : 'bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec]'
      }`}
    >
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                  : 'bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold">戻る</span>
            </button>
          </div>

          <div className="text-center">
            <Sparkles
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: theme === 'dark' ? '#00ff41' : '#34C759' }}
            />
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              メニュー提案
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              あなたに最適なトレーニングメニューを提案します
            </p>
          </div>
        </motion.div>

        {!isSubmitted ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card
              className={`p-6 rounded-2xl border-2 transition-colors mb-6 ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
              }`}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-4 h-4" />
                    年齢 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="年齢を入力"
                    className={`rounded-xl border-2 transition-colors ${
                      theme === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#00ff41]'
                        : 'bg-[#f5f5f5] border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#34C759]'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Ruler className="w-4 h-4" />
                    身長 (cm) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="身長を入力"
                    className={`rounded-xl border-2 transition-colors ${
                      theme === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#00ff41]'
                        : 'bg-[#f5f5f5] border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#34C759]'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Weight className="w-4 h-4" />
                    体重 (kg) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="体重を入力"
                    className={`rounded-xl border-2 transition-colors ${
                      theme === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#00ff41]'
                        : 'bg-[#f5f5f5] border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#34C759]'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Target className="w-4 h-4" />
                    目標
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {goalOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, goal: option.value })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.goal === option.value
                            ? theme === 'dark'
                              ? 'bg-[#00ff41]/10 border-[#00ff41] text-white'
                              : 'bg-[#34C759]/10 border-[#34C759] text-gray-900'
                            : theme === 'dark'
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                              : 'bg-[#f5f5f5] border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{option.icon}</span>
                          <span className="text-sm font-bold">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Zap className="w-4 h-4" />
                    トレーニング強度
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {intensityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, intensity: option.value })}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.intensity === option.value
                            ? theme === 'dark'
                              ? 'bg-[#00ff41]/10 border-[#00ff41] text-white'
                              : 'bg-[#34C759]/10 border-[#34C759] text-gray-900'
                            : theme === 'dark'
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                              : 'bg-[#f5f5f5] border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg mb-1">{option.icon}</div>
                        <div className="text-sm font-bold">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Activity className="w-4 h-4" />
                    鍛えたい部位
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {targetPartOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, targetPart: option.value })}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.targetPart === option.value
                            ? theme === 'dark'
                              ? 'bg-[#00ff41]/10 border-[#00ff41] text-white'
                              : 'bg-[#34C759]/10 border-[#34C759] text-gray-900'
                            : theme === 'dark'
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                              : 'bg-[#f5f5f5] border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-xs font-bold">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className={`w-full py-6 rounded-2xl text-lg font-bold transition-all ${
                    theme === 'dark'
                      ? 'bg-[#00ff41] text-zinc-950 hover:bg-[#00ff41]/90'
                      : 'bg-gradient-to-r from-[#34C759] to-[#30D158] text-white hover:opacity-90'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  診断する
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Card
                className={`p-6 rounded-2xl border-2 transition-colors ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                }`}
              >
                <div className="text-center">
                  <TrendingUp className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#34C759]'}`} />
                  <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    あなたのBMI
                  </h3>
                  <div className={`text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#34C759]'}`}>
                    {result?.bmi.toFixed(1)}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                    {result?.bmiCategory}
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card
                className={`p-6 rounded-2xl border-2 transition-colors ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#34C759]'}`} />
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    総合アドバイス
                  </h3>
                </div>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  {result?.adviceResult?.advice}
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card
                className={`p-6 rounded-2xl border-2 transition-colors ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <User className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#34C759]'}`} />
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    体質別アドバイス
                  </h3>
                </div>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  {result?.adviceResult?.bodyConstitution}
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card
                className={`p-6 rounded-2xl border-2 transition-colors ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#34C759]'}`} />
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    目標別アドバイス
                  </h3>
                </div>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  {result?.adviceResult?.goalBody}
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card
                className={`p-6 rounded-2xl border-2 transition-colors ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-[#00ff41]/10 to-[#00ff41]/5 border-[#00ff41]/30'
                    : 'bg-gradient-to-br from-[#34C759]/10 to-[#34C759]/5 border-[#34C759]/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#34C759]'}`} />
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    おすすめトレーニングメニュー
                  </h3>
                </div>
                <div className="space-y-2">
                  {result?.recommendedExercises.map((exercise, index) => (
                    <div
                      key={`${exercise.name}-${index}`}
                      className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white/50'}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              theme === 'dark' ? 'bg-[#00ff41]/20 text-[#00ff41]' : 'bg-[#34C759]/20 text-[#34C759]'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {exercise.name}
                          </span>
                        </div>
                        <a
                          href={exercise.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={`text-xs font-semibold underline-offset-4 hover:underline ${
                            theme === 'dark' ? 'text-[#00ff41]' : 'text-[#34C759]'
                          }`}
                        >
                          {exercise.label}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <Button
                onClick={handleReset}
                className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                もう一度診断する
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrainingMenuSuggestion
