// 体質診断フォーム
import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './ui/button.js'
import Progress from './ui/Progress.jsx'

const questions = [
  { id: 1, text: '朝起きるのがつらいと感じますか？' },
  { id: 2, text: '手足が冷えやすいですか？' },
  { id: 3, text: '汗をかきやすいですか？' },
  { id: 4, text: 'ストレスを感じやすいですか？' },
  { id: 5, text: '食欲が安定していますか？' },
  { id: 6, text: '便通は良い方ですか？' },
  { id: 7, text: '疲れやすいと感じますか？' },
  { id: 8, text: '体重が増えやすい体質ですか？' },
  { id: 9, text: '睡眠の質は良いですか？' },
  { id: 10, text: '運動するのは好きですか？' },
]

export default function BodyDiagnosis({ onBack, theme, onComplete }) {
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setError('')
  }

  const calculateProgress = () => {
    return (Object.keys(answers).length / questions.length) * 100
  }

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      setError('すべての質問に回答してください')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0)

    let bodyType = ''
    if (totalScore <= 20) {
      bodyType = '虚弱型'
    } else if (totalScore <= 30) {
      bodyType = '標準型'
    } else if (totalScore <= 40) {
      bodyType = '活動型'
    } else {
      bodyType = '熱型'
    }

    onComplete && onComplete(bodyType, totalScore)
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 pb-24 transition-colors">
      <div className="bg-gradient-to-r from-[#34C759] to-[#30D158] dark:from-zinc-900 dark:to-zinc-900 px-6 py-6 text-white transition-colors sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">体質診断</h1>
            <p className="text-sm text-white/80 mt-1">全10問</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              {Object.keys(answers).length} / {questions.length} 回答済み
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-5 bg-gradient-to-br from-[#5AC8FA]/10 to-[#007AFF]/5 dark:from-[#5AC8FA]/10 dark:to-[#007AFF]/5 border-2 border-[#5AC8FA]/30 dark:border-[#5AC8FA]/30 transition-colors rounded-2xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#5AC8FA] flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 dark:text-zinc-300 font-medium">回答の目安</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <p className="text-red-600 dark:text-red-400 font-semibold">とても当てはまる = 5</p>
                    <p className="text-orange-600 dark:text-orange-400 font-semibold">当てはまる = 4</p>
                    <p className="text-gray-600 dark:text-zinc-400 font-semibold">ふつう = 3</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">あまり当てはまらない = 2</p>
                    <p className="text-blue-700 dark:text-blue-500 font-semibold">当てはまらない = 1</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-center font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {questions.map((question, index) => {
          const isAnswered = answers[question.id] !== undefined

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div
                className={`p-6 rounded-2xl transition-all ${
                  isAnswered
                    ? 'bg-white dark:bg-zinc-900 border-2 border-[#34C759]/40 dark:border-[#00ff41]/40 shadow-lg'
                    : 'bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                        isAnswered
                          ? 'bg-[#34C759] dark:bg-[#00ff41] text-white dark:text-zinc-900'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                      }`}
                    >
                      {isAnswered ? <CheckCircle2 className="w-5 h-5" /> : question.id}
                    </div>
                    <p className="flex-1 text-gray-900 dark:text-white font-medium leading-relaxed pt-1">
                      {question.text}
                    </p>
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const isSelected = answers[question.id] === value
                      let bgColor = 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                      let hoverColor = 'hover:bg-gray-200 dark:hover:bg-zinc-700'
                      let borderColor = 'border-2 border-transparent'

                      if (isSelected) {
                        if (value >= 4) {
                          bgColor =
                            'bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white'
                          borderColor = 'border-2 border-red-600 dark:border-red-500'
                        } else if (value === 3) {
                          bgColor =
                            'bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 text-white'
                          borderColor = 'border-2 border-yellow-600 dark:border-yellow-500'
                        } else {
                          bgColor =
                            'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white'
                          borderColor = 'border-2 border-blue-600 dark:border-blue-500'
                        }
                      }

                      return (
                        <motion.button
                          key={value}
                          type="button"
                          onClick={() => handleAnswerChange(question.id, value)}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex-1 h-14 rounded-xl font-bold text-lg transition-all ${bgColor} ${hoverColor} ${borderColor} ${
                            isSelected ? 'shadow-lg' : 'shadow-sm'
                          }`}
                        >
                          {value}
                        </motion.button>
                      )
                    })}
                  </div>

                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-center text-sm font-medium text-gray-600 dark:text-zinc-400"
                    >
                      {answers[question.id] === 5 && '✓ とても当てはまる'}
                      {answers[question.id] === 4 && '✓ 当てはまる'}
                      {answers[question.id] === 3 && '✓ ふつう'}
                      {answers[question.id] === 2 && '✓ あまり当てはまらない'}
                      {answers[question.id] === 1 && '✓ 当てはまらない'}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="pt-4"
        >
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
            whileHover={Object.keys(answers).length === questions.length ? { scale: 1.02 } : {}}
            whileTap={Object.keys(answers).length === questions.length ? { scale: 0.98 } : {}}
            className={`w-full h-16 rounded-2xl font-bold text-lg transition-all shadow-lg ${
              Object.keys(answers).length === questions.length
                ? 'bg-gradient-to-r from-[#34C759] to-[#30D158] dark:from-[#00ff41] dark:to-[#00cc33] text-white dark:text-zinc-950 hover:shadow-xl cursor-pointer'
                : 'bg-gray-300 dark:bg-zinc-800 text-gray-500 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            {Object.keys(answers).length === questions.length
              ? '診断結果を見る'
              : `あと ${questions.length - Object.keys(answers).length} 問回答してください`}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Button
            onClick={onBack}
            className="w-full h-14 border-2 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-2xl font-semibold"
          >
            プロフィールに戻る
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
