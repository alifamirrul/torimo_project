// ヘルプセンター簡易画面
import React from 'react'

export default function HelpCenter({ onBack, theme = 'light' }) {
  return (
    <div className="min-h-[calc(100dvh-96px)] px-4 pt-6 pb-28 max-w-md mx-auto bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg border border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          戻る
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">ヘルプ・サポート</h1>
      </div>
      <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-zinc-400 transition-colors">
        <p>よくある質問とガイドをご用意しています。</p>
        <ul className="list-disc pl-5">
          <li>ホームから各機能に移動できます。</li>
          <li>食事・運動・体調・目標の一部機能はプレミアム限定です。</li>
          <li>不明点はこのページからご確認ください。</li>
        </ul>
      </div>
    </div>
  )
}
