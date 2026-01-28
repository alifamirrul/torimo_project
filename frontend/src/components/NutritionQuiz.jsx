// 栄養クイズ
import { useEffect, useMemo, useState } from 'react'
import { Award, Brain, ChevronRight } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

// 栄養学クイズ画面
export default function NutritionQuiz({ theme = 'light', onBack }) {
  // 問題リスト（useMemoで毎回作らない）
  const questions = useMemo(
    () => [
      {
        question: 'タンパク質1gあたりのカロリーは？',
        options: ['4kcal', '7kcal', '9kcal', '12kcal'],
        answerIndex: 0,
        explanation: 'タンパク質は1gあたり4kcalです。',
      },
      {
        question: '脂質1gあたりのカロリーは？',
        options: ['4kcal', '7kcal', '9kcal', '12kcal'],
        answerIndex: 2,
        explanation: '脂質は1gあたり9kcalです。',
      },
      {
        question: '低GI食品の特徴は？',
        options: ['血糖値が急上昇', '腹持ちが良い', '食物繊維が少ない', '水分が少ない'],
        answerIndex: 1,
        explanation: '低GI食品は血糖値の上昇が緩やかで腹持ちが良い傾向があります。',
      },
      {
        question: '水分の目安摂取量（一般的な成人）は？',
        options: ['0.5L', '1.0L', '1.5〜2.0L', '3.0L以上'],
        answerIndex: 2,
        explanation: '一般的に1日1.5〜2リットルが目安です。',
      },
      {
        question: '良い脂質の代表例は？',
        options: ['ショートニング', 'マーガリン', 'オリーブオイル', 'ラード'],
        answerIndex: 2,
        explanation: 'オリーブオイルは不飽和脂肪酸が多い良い脂質です。',
      },
      {
        question: 'PFCバランスのPは何を指す？',
        options: ['Protein', 'Potassium', 'Probiotic', 'Phosphate'],
        answerIndex: 0,
        explanation: 'PはProtein（タンパク質）を指します。',
      },
      {
        question: 'ビタミンCが多い食品は？',
        options: ['ピーマン', 'チーズ', '白米', '豚脂'],
        answerIndex: 0,
        explanation: 'ピーマンなどの野菜はビタミンCが豊富です。',
      },
      {
        question: '食物繊維が豊富な食品は？',
        options: ['白パン', 'ごぼう', '清涼飲料水', 'バター'],
        answerIndex: 1,
        explanation: 'ごぼうは食物繊維が豊富な野菜です。',
      },
      {
        question: 'カルシウムの主な役割は？',
        options: ['視力維持', '骨と歯の形成', '血糖値上昇', '脂質代謝'],
        answerIndex: 1,
        explanation: 'カルシウムは骨と歯の形成に重要です。',
      },
      {
        question: '水溶性ビタミンに該当するのは？',
        options: ['ビタミンA', 'ビタミンD', 'ビタミンE', 'ビタミンB群'],
        answerIndex: 3,
        explanation: 'ビタミンB群は水溶性ビタミンです。',
      },
      {
        question: '炭水化物の主な役割は？',
        options: ['ホルモンの材料', 'エネルギー源', '骨の形成', '酸素運搬'],
        answerIndex: 1,
        explanation: '炭水化物は体の主要なエネルギー源です。',
      },
      {
        question: 'オメガ3が多い食品は？',
        options: ['青魚', '白砂糖', '白米', '菓子パン'],
        answerIndex: 0,
        explanation: '青魚にはDHA・EPAなどのオメガ3が含まれます。',
      },
      {
        question: 'ミネラルの一種ではないのは？',
        options: ['鉄', '亜鉛', 'マグネシウム', 'ビタミンC'],
        answerIndex: 3,
        explanation: 'ビタミンCはビタミンで、ミネラルではありません。',
      },
      {
        question: '食物繊維が血糖値に与える影響は？',
        options: ['急上昇させる', '上昇を緩やかにする', '変化をなくす', '下降させるだけ'],
        answerIndex: 1,
        explanation: '食物繊維は血糖値の上昇を緩やかにする働きがあります。',
      },
      {
        question: 'タンパク質不足のサインではないものは？',
        options: ['免疫力低下', '髪や爪が弱くなる', '筋肉量増加', '疲れやすい'],
        answerIndex: 2,
        explanation: 'タンパク質不足で筋肉量は増加しません。',
      },
      {
        question: '理想的なオメガ3:オメガ6の比率は？',
        options: ['1:1', '1:2', '1:4', '1:10'],
        answerIndex: 2,
        explanation: 'オメガ3とオメガ6の比率は1:4が理想です。',
      },
      {
        question: '水分不足のサインではないものは？',
        options: ['尿の色が薄い', '頭痛', 'めまい', '疲労感'],
        answerIndex: 0,
        explanation: '尿の色が薄い場合は水分が足りているサインです。',
      },
      {
        question: '良い炭水化物の例は？',
        options: ['白パン', '玄米', '清涼飲料水', '菓子パン'],
        answerIndex: 1,
        explanation: '玄米は食物繊維が多い良い炭水化物です。',
      },
      {
        question: 'ビタミンDの働きは？',
        options: ['カルシウム吸収のサポート', '脂質の増加', '血糖値上昇', '食物繊維増加'],
        answerIndex: 0,
        explanation: 'ビタミンDはカルシウムの吸収を助けます。',
      },
      {
        question: 'ナトリウムの過剰摂取で起こりやすいことは？',
        options: ['血圧上昇', '骨密度増加', '免疫力向上', '血糖値低下'],
        answerIndex: 0,
        explanation: '塩分過多は血圧上昇につながります。',
      },
    ],
    []
  )

  // クイズ進行の状態
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [resultRecorded, setResultRecorded] = useState(false)

  // 現在の問題
  const current = questions[currentIndex]

  // 選択肢を選んだときの処理
  const handleSelect = (index) => {
    if (selectedIndex !== null) return
    setSelectedIndex(index)
    if (index === current.answerIndex) {
      setScore((prev) => prev + 1)
    }
  }

  // 次の問題へ進む
  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setShowResult(true)
      return
    }
    setSelectedIndex(null)
    setCurrentIndex((prev) => prev + 1)
  }

  // 最初からやり直す
  const handleRetry = () => {
    setCurrentIndex(0)
    setSelectedIndex(null)
    setScore(0)
    setShowResult(false)
    setResultRecorded(false)
  }

  // 進捗（%）
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100)

  // 結果表示後に完了回数を保存
  useEffect(() => {
    if (!showResult || resultRecorded) return
    const stored = localStorage.getItem('nutritionQuizCompletions')
    const currentCount = stored ? Number(stored) : 0
    const nextCount = Number.isFinite(currentCount) ? currentCount + 1 : 1
    localStorage.setItem('nutritionQuizCompletions', String(nextCount))
    localStorage.setItem('nutritionQuizLastCompleted', new Date().toISOString())
    setResultRecorded(true)
  }, [showResult, resultRecorded])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 pb-24 transition-colors">
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-6 py-4 transition-colors sticky top-0 z-10">
        <Button onClick={onBack} className="rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 mb-2 w-10 h-10">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFCC00]/20 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-[#FFCC00]" />
          </div>
          <div>
            <Badge className="mb-2">栄養学クイズ</Badge>
            <h1 className="text-gray-900 dark:text-white">学びをチェックしよう</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">{progress}% 完了</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {showResult ? (
          <Card className="p-6 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-[#FFCC00]" />
              <h2 className="text-gray-900 dark:text-white">結果</h2>
            </div>
            <p className="text-gray-700 dark:text-zinc-300 text-lg">
              {questions.length}問中 <span className="font-semibold">{score}</span>問 正解！
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleRetry} className="rounded-xl bg-gray-900 text-white px-5">
                もう一度
              </Button>
              <Button onClick={onBack} className="rounded-xl bg-gray-100 dark:bg-zinc-800 px-5">
                戻る
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Badge>
                問題 {currentIndex + 1} / {questions.length}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-zinc-400">スコア {score}</span>
            </div>
            <h2 className="text-gray-900 dark:text-white mb-4">{current.question}</h2>
            <div className="space-y-3">
              {current.options.map((option, index) => {
                const isSelected = selectedIndex === index
                const isCorrect = selectedIndex !== null && index === current.answerIndex
                const isWrong = isSelected && index !== current.answerIndex
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(index)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      isCorrect
                        ? 'border-[#34C759] bg-[#34C759]/10'
                        : isWrong
                        ? 'border-[#FF3B30] bg-[#FF3B30]/10'
                        : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-gray-800 dark:text-zinc-200">{option}</span>
                  </button>
                )
              })}
            </div>
            {selectedIndex !== null && (
              <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800">
                <p className="text-sm text-gray-700 dark:text-zinc-300">{current.explanation}</p>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleNext}
                className="rounded-xl bg-[#FFCC00] text-zinc-950 px-6"
                disabled={selectedIndex === null}
              >
                {currentIndex === questions.length - 1 ? '結果を見る' : '次へ'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
