import React from 'react'
import { X, Check, Crown } from 'lucide-react'
import Button from './ui/button.js'

// プレミアム案内モーダル
export default function UpgradeModal({ isOpen, onClose, onUpgrade, isProcessing = false, theme = 'light' }) {
  // モーダルが閉じている時は描画しない
  if (!isOpen) return null

  // 無料プランの機能一覧
  const freePlanFeatures = [
    { text: '栄養学教養コンテンツ' },
    { text: '栄養学クイズ' },
    { text: '食材検索' },
    { text: '基本的な称号' },
  ]

  // プレミアムプランの機能一覧
  const premiumFeatures = [
    { text: '全ての無料機能' },
    { text: '食事管理・PFC自動計算' },
    { text: '運動アシスト機能' },
    { text: '体重・体調記録' },
    { text: '目標設定・進捗管理' },
    { text: 'ランクアップシステム' },
    { text: '体質タイプ診断' },
    { text: '回数自動カウント機能' },
    { text: 'パーソナルトレーニング提案' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-4xl max-h-[90vh] w-full bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors">
        {/* 閉じるボタン */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-zinc-300" />
        </button>

        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-[#34C759] to-[#30D158] dark:from-[#00ff41]/30 dark:to-[#00ff41]/10 p-8 text-white text-center transition-colors">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-white text-xl md:text-2xl font-semibold mb-2">
            TORIMOプレミアムにアップグレード
          </h2>
          <p className="text-white/90 text-sm">
            すべての機能を開放して、あなたの健康目標を達成しましょう
          </p>
        </div>

        {/* プラン比較 */}
        <div className="p-6 md:p-8 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* 無料プラン */}
            <div className="border-2 border-gray-200 dark:border-zinc-800 rounded-2xl p-6 transition-colors">
              <div className="text-center mb-6">
                <h3 className="text-gray-900 dark:text-white mb-2 font-semibold">無料プラン</h3>
                <div className="mb-4">
                  <span className="text-gray-900 dark:text-white text-4xl font-bold">¥0</span>
                  <span className="text-gray-500 dark:text-zinc-400 text-sm">/月</span>
                </div>
              </div>

              <ul className="space-y-3">
                {freePlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-400 dark:text-zinc-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-zinc-400">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* プレミアムプラン */}
            <div className="border-2 border-[#34C759] dark:border-[#00ff41]/40 rounded-2xl p-6 bg-gradient-to-br from-[#34C759]/5 to-white dark:from-[#00ff41]/10 dark:to-zinc-900 relative overflow-hidden transition-colors">
              <div className="absolute top-4 right-4">
                <div className="bg-[#34C759] text-white dark:bg-[#00ff41] dark:text-zinc-950 text-xs px-3 py-1 rounded-full transition-colors">
                  おすすめ
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-gray-900 dark:text-white mb-2 font-semibold">プレミアムプラン</h3>
                <div className="mb-4">
                  <span className="text-[#34C759] dark:text-[#00ff41] text-4xl font-bold">¥980</span>
                  <span className="text-gray-500 dark:text-zinc-400 text-sm">/月</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#34C759] dark:text-[#00ff41] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-zinc-300">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={onUpgrade}
                disabled={isProcessing}
                className="w-full bg-[#34C759] hover:bg-[#2fb350] dark:bg-[#00ff41] dark:hover:bg-[#00e63a] dark:text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 md:py-6 rounded-xl text-sm md:text-base font-semibold flex items-center justify-center transition-colors"
              >
                <Crown className="w-5 h-5 mr-2" />
                {isProcessing ? '処理中…' : '今すぐアップグレード'}
              </Button>
            </div>
          </div>

          {/* プレミアムのメリット */}
          <div className="bg-gray-50 dark:bg-zinc-900/60 rounded-2xl p-6 transition-colors">
            <h4 className="text-gray-900 dark:text-white mb-4 text-center font-semibold text-sm md:text-base">
              プレミアムで得られること
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#5AC8FA]/10 dark:bg-[#5AC8FA]/20 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                  <span className="text-2xl">📊</span>
                </div>
                <h5 className="text-sm text-gray-900 dark:text-white mb-1 font-medium">詳細な分析</h5>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  PFC計算、進捗グラフで健康管理を最適化
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FF9500]/10 dark:bg-[#FF9500]/20 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                  <span className="text-2xl">🎯</span>
                </div>
                <h5 className="text-sm text-gray-900 dark:text-white mb-1 font-medium">パーソナライズ</h5>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  あなたに最適な運動プランを提案
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#34C759]/10 dark:bg-[#00ff41]/20 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                  <span className="text-2xl">⚡</span>
                </div>
                <h5 className="text-sm text-gray-900 dark:text-white mb-1 font-medium">モチベーション維持</h5>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  称号システムで楽しく継続
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
