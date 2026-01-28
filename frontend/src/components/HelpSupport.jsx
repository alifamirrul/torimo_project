// ヘルプ・サポート画面
import { motion } from 'framer-motion'
import { HelpCircle, MessageCircle, Mail, Book, ChevronRight, Phone, ArrowLeft } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { ContactPage } from './ContactPage'
import { useState } from 'react'

export default function HelpSupport({ isPremium = false, theme = 'light', onUpgrade, onBack }) {
  const [showContactPage, setShowContactPage] = useState(false)

  const helpSections = [
    {
      id: 'contact',
      title: 'お問い合わせ',
      description: 'ご不明な点がございましたらお気軽にお問い合わせください',
      icon: Mail,
      color: '#5AC8FA',
      gradient: 'from-[#5AC8FA]/10 to-[#5AC8FA]/5',
      borderColor: 'border-[#5AC8FA]/30',
    },
    {
      id: 'chat',
      title: 'チャットサポート',
      description: '有料会員限定のチャットサポート',
      icon: MessageCircle,
      color: '#FF9500',
      gradient: 'from-[#FF9500]/10 to-[#FF9500]/5',
      borderColor: 'border-[#FF9500]/30',
      isPremium: true,
    },
    {
      id: 'phone',
      title: '電話サポート',
      description: '有料会員限定の電話サポート',
      icon: Phone,
      color: '#AF52DE',
      gradient: 'from-[#AF52DE]/10 to-[#AF52DE]/5',
      borderColor: 'border-[#AF52DE]/30',
      isPremium: true,
    },
  ]

  const faqs = [
    {
      question: 'アプリの使い方がわかりません',
      answer: 'ホーム画面から各機能にアクセスできます。栄養学は無料でご利用いただけます。',
    },
    {
      question: 'バーコードで追加した食品が表示されません',
      answer: 'ネットワーク接続を確認し、もう一度同期してください。改善しない場合はお問い合わせください。',
    },
    {
      question: '有料会員と無料会員の違いは？',
      answer: '有料会員は食事管理、運動アシスト、体重記録、目標設定など全機能をご利用いただけます。',
    },
    {
      question: 'データのバックアップは？',
      answer: 'すべてのデータは自動的にクラウドに保存されます。',
    },
    {
      question: 'アカウントを削除したい',
      answer: 'プロフィール設定からアカウント削除が可能です。',
    },
  ]

  const handleSectionClick = (sectionId, isLocked) => {
    if (isLocked && onUpgrade) {
      return
    }

    if (sectionId === 'contact') {
      setShowContactPage(true)
    }
  }

  if (showContactPage) {
    return <ContactPage theme={theme} onBack={() => setShowContactPage(false)} />
  }

  return (
    <div
      className={`min-h-screen pb-36 transition-colors ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-zinc-950 to-zinc-900'
          : 'bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec]'
      }`}
    >
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          {onBack && (
            <Button
              onClick={onBack}
              className="h-9 px-3 rounded-lg bg-white/90 text-gray-700 border border-gray-200 hover:bg-white dark:bg-zinc-900/80 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <HelpCircle className="w-16 h-16 mx-auto mb-4" style={{ color: theme === 'dark' ? '#00ff41' : '#34C759' }} />
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            ヘルプ・サポート
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            お困りのことがございましたらお気軽にお問い合わせください
          </p>
        </motion.div>

        <div className="space-y-4 mb-8">
          {helpSections.map((section, index) => {
            const Icon = section.icon
            const isLocked = section.isPremium && !isPremium

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => !isLocked && handleSectionClick(section.id, isLocked)}
                  className={`relative overflow-hidden rounded-2xl shadow-md border-2 transition-all ${
                    isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
                  } ${
                    theme === 'dark'
                      ? `bg-zinc-900 ${section.borderColor.replace(']/30', ']/20')}`
                      : `bg-white ${section.borderColor}`
                  }`}
                >
                  <div className="p-5 flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${section.gradient}`}
                    >
                      <Icon className="w-7 h-7" style={{ color: section.color }} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {section.title}
                        </h3>
                        {section.isPremium && (
                          <span className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full font-bold">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                        {section.description}
                      </p>
                    </div>

                    <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
                  </div>

                  {isLocked && onUpgrade && (
                    <div className="px-5 pb-4">
                      <Button
                        onClick={onUpgrade}
                        className="w-full bg-gradient-to-r from-[#34C759] to-[#30D158] dark:from-[#00ff41] dark:to-[#00cc33] dark:text-zinc-950 text-white hover:opacity-90 rounded-full transition-colors"
                      >
                        アップグレードして利用する
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            よくある質問
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card
                  className={`p-4 rounded-xl border transition-colors ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                  }`}
                >
                  <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Q: {faq.question}
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                    A: {faq.answer}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card
            className={`p-6 rounded-2xl border-2 transition-colors ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              お問い合わせ先
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              <p>メール: support@torimo-app.com</p>
              <p>営業時間: 平日 9:00-18:00</p>
              <p className="text-xs pt-2">※有料会員の方は24時間チャットサポートをご利用いただけます</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
