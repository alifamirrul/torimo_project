import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Apple, Leaf, Sparkles } from 'lucide-react'

export default function SplashScreen({ isOpen, onComplete }) {
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => onComplete?.(), 2600)
    return () => clearTimeout(timer)
  }, [isOpen, onComplete])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0f1115] via-[#0a0c10] to-black"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#00ff41]/10 blur-3xl"
            animate={{ scale: [0.9, 1.1, 0.95], opacity: [0.4, 0.7, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
          />
          <motion.div
            className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#34C759]/10 blur-3xl"
            animate={{ scale: [1.1, 0.95, 1.05], opacity: [0.35, 0.6, 0.45] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
          />
        </div>

        <div className="relative flex flex-col items-center gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute h-40 w-40 rounded-full border border-white/10"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute h-28 w-28 rounded-full border border-white/10"
            />
            <div className="flex items-center gap-3 rounded-3xl bg-white/5 px-6 py-4 shadow-2xl shadow-emerald-500/20 backdrop-blur">
              <Apple className="h-10 w-10 text-[#34C759]" />
              <Leaf className="h-10 w-10 text-[#00ff41]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <div className="text-2xl font-semibold tracking-[0.4em] text-white">
              TORIMO
            </div>
            <div className="mt-2 text-sm text-white/60">Healthy habits, beautifully tracked.</div>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 text-white/60 text-sm"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, type: 'tween' }}
          >
            <Sparkles className="h-4 w-4" />
            <span>Loading experience...</span>
          </motion.div>

          <div className="h-1 w-52 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#34C759] to-[#00ff41]"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
