import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function SplashScreenWithCustomLogo({ isOpen, onComplete }) {
  const [stage, setStage] = useState(0)
  const sparkleOffsets = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        delay: Math.random() * 0.8,
      })),
    []
  )

  useEffect(() => {
    if (!isOpen) return

    setStage(0)

    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 800),
      setTimeout(() => setStage(3), 1300),
      setTimeout(() => setStage(4), 2000),
      setTimeout(() => onComplete?.(), 3500),
    ]

    return () => timers.forEach(clearTimeout)
  }, [isOpen, onComplete])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#000000] overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Pulsing Orbs */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 2, 1.8, 2.2, 2],
              opacity: [0, 0.15, 0.1, 0.15, 0.12],
            }}
            transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff41] rounded-full blur-3xl"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 2.5, 2.2, 2.8, 2.5],
              opacity: [0, 0.12, 0.08, 0.12, 0.1],
            }}
            transition={{ duration: 3.5, ease: 'easeInOut', delay: 0.3, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-128 h-128 bg-[#00ff41] rounded-full blur-3xl"
          />

          {/* Radial Lines */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{
                opacity: [0, 0.3, 0],
                scaleX: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="absolute top-1/2 left-1/2 h-px w-64 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent origin-left"
              style={{
                transform: `rotate(${i * 30}deg)`,
                transformOrigin: 'left center',
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative flex flex-col items-center gap-8 px-6">
          {/* Logo Container */}
          <motion.div
            initial={{ scale: 0, rotateY: -180 }}
            animate={{
              scale: 1,
              rotateY: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              duration: 1,
            }}
            className="relative"
          >
            {/* Outer Glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-8 bg-gradient-to-r from-[#00ff41] via-[#00cc33] to-[#00ff41] rounded-full blur-2xl"
            />

            {/* Rotating Ring */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="absolute -inset-6 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent, #00ff41, transparent, #00ff41, transparent)',
                opacity: 0.4,
              }}
            />

            {/* Logo Background */}
            <motion.div
              className="relative w-52 h-52 rounded-3xl flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
              }}
              animate={{
                boxShadow: [
                  '0 0 30px rgba(0, 255, 65, 0.3)',
                  '0 0 50px rgba(0, 255, 65, 0.5)',
                  '0 0 30px rgba(0, 255, 65, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Animated Border */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{
                  background: 'conic-gradient(from 0deg, #00ff41, transparent, #00ff41)',
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />

              {/* Custom SVG Logo */}
              <motion.div
                initial={{ scale: 0, opacity: 0, rotateZ: -90 }}
                animate={{
                  scale: [0, 1.1, 1],
                  opacity: 1,
                  rotateZ: 0,
                }}
                transition={{
                  delay: 0.5,
                  duration: 0.8,
                  type: 'tween',
                  ease: 'easeOut',
                }}
                className="relative z-10"
              >
                <img
                  src="/image/logo.png"
                  alt="Torimo logo"
                  className="h-36 w-36 object-contain"
                />
              </motion.div>

              {/* Scanning Line */}
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                  type: 'tween',
                }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent opacity-50"
                style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}
              />
            </motion.div>

            {/* Orbiting Particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#00ff41] rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-4px',
                  marginTop: '-4px',
                }}
                animate={{
                  x: [
                    0,
                    Math.cos((i * Math.PI * 2) / 8) * 130,
                    Math.cos((i * Math.PI * 2) / 8 + Math.PI * 2) * 130,
                  ],
                  y: [
                    0,
                    Math.sin((i * Math.PI * 2) / 8) * 130,
                    Math.sin((i * Math.PI * 2) / 8 + Math.PI * 2) * 130,
                  ],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                  type: 'tween',
                }}
              />
            ))}
          </motion.div>

          {/* App Name */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 30 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3"
          >
            <motion.h1
              className="text-white text-6xl tracking-widest relative"
              style={{
                fontWeight: 900,
                textShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
              }}
              animate={{
                textShadow: [
                  '0 0 20px rgba(0, 255, 65, 0.5)',
                  '0 0 30px rgba(0, 255, 65, 0.8)',
                  '0 0 20px rgba(0, 255, 65, 0.5)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                type: 'tween',
              }}
            >
              TORIMO
            </motion.h1>

            {/* Animated Underline */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: stage >= 2 ? '100%' : 0,
                opacity: stage >= 2 ? 1 : 0,
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-1 rounded-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, transparent, #00ff41, transparent)',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </motion.div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : 10 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-gray-400 text-lg text-center tracking-wide"
          >
            あなたの健康を、毎日サポート
          </motion.p>

          {/* Loading Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 3 ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="w-64 mt-4"
          >
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00ff41] via-[#00cc33] to-[#00ff41] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: stage >= 3 ? '100%' : '0%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              >
                <motion.div
                  className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Sparkles */}
          <AnimatePresence>
            {stage >= 3 && (
              <>
                {sparkleOffsets.map((sparkle) => (
                  <motion.div
                    key={sparkle.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      x: [0, sparkle.x],
                      y: [0, sparkle.y],
                    }}
                    transition={{
                      duration: 2,
                      delay: sparkle.delay,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                      type: 'tween',
                    }}
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '40%',
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-[#00ff41]" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 4 ? 0.6 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-12 text-gray-500 text-sm flex items-center gap-2"
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, type: 'tween' }}
          >
            Powered by AI
          </motion.span>
          <span>•</span>
          <span>健康的な毎日を</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
