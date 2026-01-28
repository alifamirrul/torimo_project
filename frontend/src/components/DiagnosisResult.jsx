// 体質診断の結果表示
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from './ui/button.js'
import { CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react'

const bodyTypeResults = {
  虚弱型: {
    result: 'あなたの体質は「虚弱型」です',
    advice: 'エネルギー不足気味の体質です。十分な休息と栄養補給を心がけましょう。',
    advice2:
      'たんぱく質とビタミンB群を意識的に摂取し、軽い運動から始めて徐々に強度を上げていくことをおすすめします。',
  },
  標準型: {
    result: 'あなたの体質は「標準型」です',
    advice: 'バランスの取れた健康的な体質です。現状維持を心がけましょう。',
    advice2:
      '規則正しい生活リズムとバランスの良い食事を継続し、適度な運動習慣（週3-4回）を保つことで、より健康的な状態を維持できます。',
  },
  活動型: {
    result: 'あなたの体質は「活動型」です',
    advice: '活動的でエネルギッシュな体質です。オーバーワークに注意しましょう。',
    advice2:
      '質の高い休息を意識的に取り、エネルギー源となる炭水化物を適切に摂取してください。ストレッチやヨガでリラックスする時間も大切です。',
  },
  熱型: {
    result: 'あなたの体質は「熱型」です',
    advice: '代謝が高く熱がこもりやすい体質です。クールダウンを意識しましょう。',
    advice2:
      '身体を冷やす食材（きゅうり、トマト等）を取り入れ、辛い食べ物や刺激物を控えましょう。こまめな水分補給とリラックスできる時間を作ることが重要です。',
  },
}

export default function DiagnosisResult({ bodyType, score, onBack, onReturnToProfile }) {
  const info = bodyTypeResults[bodyType] || bodyTypeResults['標準型']

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#96e0a4] to-[#7ad189] dark:from-zinc-950 dark:to-zinc-900 p-6 transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 text-center transition-colors border-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#34C759] to-[#30D158] dark:from-[#00ff41] dark:to-[#00cc33] rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white dark:text-zinc-950" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
          >
            診断結果
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">{info.result}</p>
            <div className="space-y-4 text-gray-700 dark:text-zinc-300">
              <p className="leading-relaxed">{info.advice}</p>
              <p className="leading-relaxed">{info.advice2}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-[#34C759]/10 to-[#30D158]/10 dark:from-[#00ff41]/10 dark:to-[#00cc33]/10 rounded-xl border-2 border-[#34C759]/30 dark:border-[#00ff41]/30">
              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">あなたのスコア</p>
              <p className="text-3xl font-bold text-[#34C759] dark:text-[#00ff41]">{score} / 50</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onBack}
                className="w-full h-12 bg-gradient-to-r from-[#429bd6] to-[#3a8bc4] hover:from-[#274585] hover:to-[#1f3665] text-white rounded-xl font-semibold shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                もう一度診断する
              </Button>
            </motion.div>

            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onReturnToProfile}
                className="w-full h-12 bg-gradient-to-r from-[#51ba68] to-[#42a858] hover:from-[#164f20] hover:to-[#0f3a18] text-white rounded-xl font-semibold shadow-md transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                プロフィールに戻る
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800"
          >
            <p className="text-xs text-gray-500 dark:text-zinc-500">
              ※ この診断結果は目安です。気になる症状がある場合は医療機関にご相談ください。
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
