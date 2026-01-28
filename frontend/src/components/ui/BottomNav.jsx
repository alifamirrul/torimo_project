import React from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Utensils,
  Dumbbell,
  HeartPulse,
  Target,
  BookOpen,
  CircleHelp,
  Lock,
  NotebookPen
} from 'lucide-react'

const items = [
  { key: 'home', label: 'ホーム', Icon: Activity, premium: false },
  { key: 'meals', label: '食事', Icon: Utensils, premium: false },
  { key: 'exercise', label: '運動', Icon: Dumbbell, premium: true },
  { key: 'health', label: '体調', Icon: HeartPulse, premium: true },
  { key: 'goals', label: '目標', Icon: Target, premium: true },
  { key: 'education', label: '栄養学', Icon: BookOpen, premium: false },
  { key: 'help', label: 'ヘルプ', Icon: CircleHelp, premium: false },
  { key: 'notes', label: 'ノート', Icon: NotebookPen, premium: false, requiresAuth: true },
]

export default function BottomNav({ active, onNavigate, isPremium, theme = 'light' }){
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-center pb-[env(safe-area-inset-bottom)]">
      <div className="mx-3 mb-3 w-full max-w-md rounded-2xl border border-gray-200/60 bg-white/90 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur supports-[backdrop-filter]:bg-white/70 transition-colors dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <nav
          className="grid px-1 py-2"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map(({ key, label, Icon, premium, requiresAuth }) => {
            const isActive = active === key
            const locked = premium && !isPremium
            return (
              <motion.button
                key={key}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate(key, { premium, requiresAuth })}
                className={`group relative mx-1 flex flex-col items-center gap-1 rounded-xl px-1.5 py-1.5 transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-[#00ff41]'
                    : 'text-gray-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-[#00ff41]'
                }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={2.25} className="drop-shadow-[0_1px_0_rgba(0,0,0,0.02)]" />
                  {locked && (
                    <Lock
                      size={12}
                      className="absolute -right-1 -top-1 text-amber-500 dark:text-[#00ff41]"
                      strokeWidth={2.5}
                    />
                  )}
                </div>
                <span className="pointer-events-none select-none text-[10px] leading-none tracking-tight">
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-emerald-500/80 dark:bg-[#00ff41]/70 transition-colors"
                  />
                )}
              </motion.button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
