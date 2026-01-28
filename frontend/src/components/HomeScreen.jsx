// ホーム画面（簡易/ダミーデータ版）
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Crown, User, BookOpen, Utensils, Dumbbell, Activity, Target, Sparkles, CheckCircle2, ChevronRight, Zap, Clock } from 'lucide-react'

const heroImages = { salad: '/image/肉と野菜と魚.png', bread: '/image/パン.png', quiz: '/image/クイズ.png', muscle: '/image/腕筋肉.png', treadmill: '/image/ルームランナー.png', diary: '/image/日記.png', scale: '/image/体重計.png', height: '/image/身長測定.png' }

export default function HomeScreen({ onGoToProfile, isPremium = false, theme = 'light' }) {
  const [leftAdVisible, setLeftAdVisible] = useState(true)
  const [rightAdVisible, setRightAdVisible] = useState(true)
  const isDark = theme === 'dark'

  const todayCalories = { consumed: 1450, target: 2000, remaining: 550 }
  const todayExercise = { minutes: 25, caloriesBurned: 180, goal: 30 }
  const weightData = { current: 68.5, goal: 65, change: -1.2 }
  const nutritionStreak = { current: 7, best: 12, quizzesCompleted: 42 }
  const weekProgress = [
    { day: '月', completed: true },
    { day: '火', completed: true },
    { day: '水', completed: true },
    { day: '木', completed: false },
    { day: '金', completed: false },
    { day: '土', completed: false },
    { day: '日', completed: false }
  ]

  return (
    <div className={`min-h-screen pb-28 transition-colors ${isDark ? 'bg-gradient-to-b from-zinc-950 to-zinc-900' : 'bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec]'}`}>
      <nav className={`flex items-center justify-between px-4 py-3 pt-[env(safe-area-inset-top)] shadow-sm ${isDark ? 'bg-zinc-900 text-white' : 'bg-[#34C759] text-white'}`}>
        <div className="w-16 sm:w-24" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-2xl font-bold tracking-wide">TORIMO</motion.div>
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${isPremium ? 'bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900' : 'bg-white/20 text-white'}`}>{isPremium && <Crown className="h-3 w-3" />}{isPremium ? '有料会員' : '無料会員'}</span>
          {onGoToProfile && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGoToProfile} className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] hover:bg-white/30 whitespace-nowrap">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">プロフィール</span>
            </motion.button>
          )}
        </div>
      </nav>

      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-6 px-4 lg:flex-row">
        <AnimatePresence>
          {leftAdVisible && (
            <motion.div
              key="left-ad"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`hidden h-96 w-40 flex-shrink-0 rounded-2xl border text-xs shadow-sm lg:flex ${
                isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-400' : 'border-gray-200 bg-white text-gray-400'
              }`}
            >
              <button
                onClick={() => setLeftAdVisible(false)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-sm"
              >
                <X className="h-4 w-4" />
              <span
                className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                ここに広告を表示
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`overflow-hidden rounded-3xl border-2 shadow-lg ${
              isDark ? 'border-zinc-800 bg-zinc-900' : 'border-emerald-200/60 bg-white'
            }`}
                  className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] hover:bg-white/30 whitespace-nowrap"
            <div className="relative h-48 overflow-hidden bg-gradient-to-r from-[#34C759] to-[#30D158] sm:h-56">
              <motion.img
                  <span className="hidden sm:inline">プロフィール</span>
                alt="サラダ"
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-6 top-6 w-24 opacity-20 drop-shadow-lg"
              />
              <motion.img
                src={heroImages.bread}
                alt="ブレッド"
                animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-6 right-6 w-20 opacity-20 drop-shadow-lg"
              />
              <motion.img
                src={heroImages.quiz}
                alt="クイズ"
                animate={{ y: [0, -10, 0], x: [0, 8, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-1/4 top-1/2 hidden w-16 -translate-y-1/2 opacity-20 drop-shadow-lg sm:block"
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="mb-3"
                >
                  <Sparkles className="mx-auto h-10 w-10 text-yellow-200 drop-shadow" />
                </motion.div>
                <motion.h2 className="text-3xl font-bold drop-shadow" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                  TORIMO で健康管理
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-white/80"
                >
                  食事・運動・学習までワンタップ
                </motion.p>
              </div>
            </div>
          </motion.section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              isDark={isDark}
              title="栄養学"
              subtitle="学習ストリーク"
              iconColor="#34C759"
              icon={BookOpen}
              badge={`最高: ${nutritionStreak.best}日`}
              value={`${nutritionStreak.current}日`}
              subline={`クイズ完了: ${nutritionStreak.quizzesCompleted}問`}
            />
            <StatCard
              isDark={isDark}
              title="体重記録"
              subtitle="今週の変化"
              iconColor="#FF3B30"
              icon={Activity}
              badge="Premium"
              value={`${weightData.current}kg`}
              subline={`目標 ${weightData.goal}kg / 変化 ${Math.abs(weightData.change)}kg`}
              locked={!isPremium}
            />
          </section>

          <CalorieCard
            isDark={isDark}
            stats={todayCalories}
            locked={!isPremium}
          />

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ExerciseCard
              isDark={isDark}
              stats={todayExercise}
              locked={!isPremium}
            />
            <WeekProgressCard
              isDark={isDark}
              weekProgress={weekProgress}
              locked={!isPremium}
            />
          </section>
          {/* 機能リンクは BottomNav に統合済みのためホームでは非表示 */}
        </div>

        <AnimatePresence>
          {rightAdVisible && (
            <motion.div
              key="right-ad"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`hidden h-96 w-40 flex-shrink-0 rounded-2xl border text-xs shadow-sm lg:flex ${
                isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-400' : 'border-gray-200 bg-white text-gray-400'
              }`}
            >
              <button
                onClick={() => setRightAdVisible(false)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-sm"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex flex-1 items-center justify-center px-4 text-center">
                ここに広告を表示
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CardShell({ children, isDark, highlight }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 p-5 shadow-md transition-all ${
        isDark ? 'border-zinc-800 bg-zinc-900' : 'border-white/60 bg-white'
      } ${highlight}`}
    >
      {children}
    </div>
  )
}

function StatCard({ isDark, title, subtitle, icon: Icon, iconColor, badge, value, subline, locked, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: onClick && !locked ? -4 : 0 }}
      onClick={locked ? undefined : onClick}
      className={`text-left ${onClick && !locked ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <CardShell isDark={isDark}>
        {locked && <LockOverlay />}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${iconColor}1a` }}>
              <Icon className="h-6 w-6" style={{ color: iconColor }} />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{subtitle}</p>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
            </div>
          </div>
          <span className="rounded-full bg-black/5 px-2 py-1 text-xs text-gray-500">{badge}</span>
        </div>
        <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</div>
        <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>{subline}</p>
      </CardShell>
    </motion.button>
  )
}

function CalorieCard({ isDark, stats, locked, onClick }) {
  const progress = Math.min(100, Math.round((stats.consumed / stats.target) * 100))
  return (
    <motion.button
      type="button"
      whileHover={{ y: onClick && !locked ? -4 : 0 }}
      onClick={locked ? undefined : onClick}
      className={`block w-full text-left ${onClick && !locked ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <CardShell isDark={isDark}>
        {locked && <LockOverlay />}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
              <Utensils className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>食事管理</p>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>今日のカロリー</h3>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`} />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>摂取</p>
            <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.consumed}</div>
            <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>/ {stats.target} kcal</p>
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2 text-emerald-500">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold">残り {stats.remaining} kcal</span>
            </div>
            <div className={`h-3 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
                className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
              />
            </div>
          </div>
        </div>
      </CardShell>
    </motion.button>
  )
}

function ExerciseCard({ isDark, stats, locked, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: onClick && !locked ? -4 : 0 }}
      onClick={locked ? undefined : onClick}
      className={`text-left ${onClick && !locked ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <CardShell isDark={isDark}>
        {locked && <LockOverlay />}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100">
              <Dumbbell className="h-6 w-6 text-sky-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>今日の運動</p>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>アクティビティ</h3>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-sky-500" />
            <div>
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.minutes}分</span>
              <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}> / {stats.goal}分</span>
            </div>
          </div>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>消費: {stats.caloriesBurned} kcal</p>
        </div>
      </CardShell>
    </motion.button>
  )
}

function WeekProgressCard({ isDark, weekProgress, locked, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: onClick && !locked ? -4 : 0 }}
      onClick={locked ? undefined : onClick}
      className={`text-left ${onClick && !locked ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <CardShell isDark={isDark}>
        {locked && <LockOverlay />}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Target className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>週間達成</p>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>目標トラッカー</h3>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`} />
        </div>
        <div className="mb-2 flex items-center justify-between gap-2">
          {weekProgress.map((day, idx) => (
            <motion.div key={day.day} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 * idx }}>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  day.completed
                    ? 'bg-purple-500 text-white'
                    : isDark
                    ? 'bg-zinc-800 text-zinc-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {day.completed ? <CheckCircle2 className="h-5 w-5" /> : day.day}
              </div>
            </motion.div>
          ))}
        </div>
        <p className={`text-center text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>3 / 7 日達成</p>
      </CardShell>
    </motion.button>
  )
}

function FeatureCard({ feature, isDark, locked }) {
  const Icon = feature.icon
  return (
    <motion.button
      type="button"
      whileHover={{ y: locked ? 0 : -4 }}
      onClick={() => (!locked ? feature.onClick?.() : undefined)}
      className={`block w-full text-left ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div
        className={`relative overflow-hidden rounded-3xl border-2 p-5 shadow-lg ${
          isDark ? 'border-zinc-800/60 bg-zinc-900/80' : 'border-white/40 bg-white/80'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient}`} />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${feature.color}1a` }}>
              <Icon className="h-6 w-6" style={{ color: feature.color }} />
            </div>
            <div>
              <h4 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h4>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>{feature.description}</p>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <img src={feature.leftImage} alt="decor" className="hidden h-16 w-16 rounded-2xl object-cover md:block" />
            <img src={feature.rightImage} alt="decor" className="hidden h-16 w-16 rounded-2xl object-cover md:block" />
            <span
              className="rounded-full border border-white/40 px-4 py-1 text-sm font-semibold"
              style={{ color: feature.color }}
            >
              {feature.action}
            </span>
          </div>
        </div>
        {locked && <LockOverlay label="プレミアム" />}
      </div>
    </motion.button>
  )
}

function LockOverlay({ label }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/50 text-white">
      <Lock className="h-8 w-8" />
      {label && <span className="rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-wide">{label}</span>}
    </div>
  )
}
