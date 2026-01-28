// プロフィール設定画面
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Crown,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Activity,
  TrendingUp,
  Target,
  Ruler,
  Weight,
  Calendar,
} from 'lucide-react'
import Button from './ui/button.js'
import { Badge } from './ui/badge.jsx'

// プロフィール設定画面
export default function ProfileSettings({
  onLogout,
  isPremium,
  theme,
  onToggleTheme,
  onEditProfile,
  profileImage = null,
  profileData: externalProfileData,
  onStartDiagnosis,
  onHelpSupport,
}) {
  // プロフィール情報（外部データがあればそれを使う）
  const [profileData, setProfileData] = useState(
    externalProfileData || {
      name: '山田 太郎',
      age: 28,
      height: 170,
      weight: 70,
      goalWeight: 65,
      bodyType: '標準型',
      bmi: 24.2,
      message: '健康的に痩せたいです！',
    },
  )

  // 目標体重までの残り
  const remainingWeight = profileData.weight - profileData.goalWeight

  // 外部データが更新されたら反映する
  useEffect(() => {
    if (externalProfileData) {
      setProfileData(externalProfileData)
    }
    window.scrollTo(0, 0)
  }, [externalProfileData])

  // BMIの状態を判定する
  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { status: '低体重', color: '#5AC8FA' }
    if (bmi < 25) return { status: '標準体重', color: '#34C759' }
    if (bmi < 30) return { status: '肥満（1度）', color: '#FF9500' }
    return { status: '肥満（2度以上）', color: '#FF3B30' }
  }

  const bmiInfo = getBMIStatus(profileData.bmi)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 pb-24 transition-colors">
      <div className="bg-gradient-to-r from-[#34C759] to-[#30D158] dark:from-zinc-900 dark:to-zinc-900 px-6 py-10 text-white transition-colors">
        <div className="flex flex-col items-center gap-4 mb-4">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-32 h-32 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center transition-colors shadow-lg overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-7xl">👤</div>
              )}
            </div>
          </motion.div>

          <div className="text-center">
            <h2 className="text-white mb-2">{profileData.name}</h2>
            {isPremium ? (
              <Badge className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                Premium会員
              </Badge>
            ) : (
              <Badge className="bg-white/20 text-white border-0">無料プラン</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6 -mt-8 text-[15px] leading-relaxed">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border-4 border-[#34C759]/20 dark:border-[#00ff41]/20 transition-colors">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="p-4 bg-gradient-to-br from-[#34C759]/10 to-[#30D158]/5 dark:from-[#00ff41]/10 dark:to-[#00cc33]/5 rounded-xl border-2 border-[#34C759]/20 dark:border-[#00ff41]/20"
                  whileHover={{ scale: 1.03, borderColor: 'rgba(52, 199, 89, 0.4)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#34C759] dark:text-[#00ff41]" />
                    <span className="text-sm text-gray-600 dark:text-zinc-400 font-medium">年齢</span>
                  </div>
                  <p className="text-2xl text-gray-900 dark:text-white font-bold">{profileData.age}歳</p>
                </motion.div>

                <motion.div
                  className="p-4 bg-gradient-to-br from-[#5AC8FA]/10 to-[#007AFF]/5 dark:from-[#5AC8FA]/10 dark:to-[#007AFF]/5 rounded-xl border-2 border-[#5AC8FA]/20"
                  whileHover={{ scale: 1.03, borderColor: 'rgba(90, 200, 250, 0.4)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="w-4 h-4 text-[#5AC8FA]" />
                    <span className="text-sm text-gray-600 dark:text-zinc-400 font-medium">身長</span>
                  </div>
                  <p className="text-2xl text-gray-900 dark:text-white font-bold">{profileData.height}cm</p>
                </motion.div>

                <motion.div
                  className="p-4 bg-gradient-to-br from-[#FF9500]/10 to-[#FF6B00]/5 dark:from-[#FF9500]/10 dark:to-[#FF6B00]/5 rounded-xl border-2 border-[#FF9500]/20"
                  whileHover={{ scale: 1.03, borderColor: 'rgba(255, 149, 0, 0.4)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Weight className="w-4 h-4 text-[#FF9500]" />
                    <span className="text-sm text-gray-600 dark:text-zinc-400 font-medium">体重</span>
                  </div>
                  <p className="text-2xl text-gray-900 dark:text-white font-bold">{profileData.weight}kg</p>
                </motion.div>

                <motion.div
                  className="p-4 bg-gradient-to-br from-[#AF52DE]/10 to-[#BF5AF2]/5 dark:from-[#AF52DE]/10 dark:to-[#BF5AF2]/5 rounded-xl border-2 border-[#AF52DE]/20"
                  whileHover={{ scale: 1.03, borderColor: 'rgba(175, 82, 222, 0.4)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-[#AF52DE]" />
                    <span className="text-sm text-gray-600 dark:text-zinc-400 font-medium">目標体重</span>
                  </div>
                  <p className="text-2xl text-gray-900 dark:text-white font-bold">{profileData.goalWeight}kg</p>
                  {remainingWeight > 0 && (
                    <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">あと {remainingWeight}kg</p>
                  )}
                </motion.div>
              </div>

              <motion.div
                className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-800 rounded-xl border-2 border-gray-200 dark:border-zinc-700"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" style={{ color: bmiInfo.color }} />
                    <span className="text-sm text-gray-600 dark:text-zinc-400 font-semibold">BMI</span>
                  </div>
                  <Badge
                    className="border-0 px-3 py-1"
                    style={{
                      backgroundColor: `${bmiInfo.color}20`,
                      color: bmiInfo.color,
                      fontWeight: 600,
                    }}
                  >
                    {bmiInfo.status}
                  </Badge>
                </div>
                <p className="text-4xl text-gray-900 dark:text-white font-bold">{profileData.bmi}</p>
              </motion.div>

              <div className="space-y-3">
                <motion.div
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700"
                  whileHover={{ scale: 1.01 }}
                >
                  <span className="text-sm text-gray-600 dark:text-zinc-400 font-medium">体質タイプ：</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{profileData.bodyType}</span>
                </motion.div>
                <motion.div
                  className="p-4 bg-[#34C759]/5 dark:bg-[#00ff41]/5 rounded-xl border-2 border-[#34C759]/20 dark:border-[#00ff41]/20"
                  whileHover={{ scale: 1.01 }}
                >
                  <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
                    <span className="text-2xl mr-2">💭</span>
                    {profileData.message}
                  </p>
                </motion.div>
              </div>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={onStartDiagnosis}
                  className="w-full h-12 mt-4 rounded-xl bg-white/90 text-[#007AFF] border border-[#007AFF]/15 shadow-sm hover:bg-[#007AFF] hover:text-white hover:border-[#007AFF]/40 transition-colors text-sm font-semibold flex items-center justify-center"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  体質診断を受ける
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 transition-colors">
            <h3 className="text-gray-900 dark:text-white mb-4 font-semibold">利用状況</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <motion.div whileHover={{ scale: 1.05 }}>
                <p className="text-3xl text-[#34C759] dark:text-[#00ff41] mb-1 font-bold">45</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">利用日数</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <p className="text-3xl text-[#5AC8FA] mb-1 font-bold">128</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">食事記録</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <p className="text-3xl text-[#FF9500] mb-1 font-bold">67</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">運動回数</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div>
          <h4 className="text-gray-700 dark:text-zinc-300 px-2 mb-3 font-semibold">アカウント</h4>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors">
            <button
              type="button"
              onClick={onEditProfile}
              className="w-full flex items-center justify-between p-4 transition-colors border-b border-gray-100 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#34C759]/10 to-[#30D158]/10 dark:from-[#00ff41]/10 dark:to-[#00cc33]/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#34C759] dark:text-[#00ff41]" />
                </div>
                <div className="text-left">
                  <p className="text-gray-900 dark:text-white font-medium">プロフィール編集</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">名前、年齢、目標体重</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-zinc-600" />
            </button>

            <button
              className="w-full flex items-center justify-between p-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#5AC8FA]/10 to-[#007AFF]/10 dark:from-[#5AC8FA]/10 dark:to-[#007AFF]/10 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#007AFF] dark:text-[#5AC8FA]" />
                </div>
                <div className="text-left">
                  <p className="text-gray-900 dark:text-white font-medium">アカウント設定</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">パスワード、セキュリティ</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-zinc-600" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-gray-700 dark:text-zinc-300 px-2 mb-3 font-semibold">設定</h4>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF9500]/10 to-[#FF6B00]/10 dark:from-[#FFD700]/10 dark:to-[#FFA500]/10 rounded-full flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-[#FFD700] dark:text-[#FFD700]" />
                  ) : (
                    <Sun className="w-5 h-5 text-[#FF9500]" />
                  )}
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">ダークモード</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">外観を変更</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className={
                  `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ` +
                  (theme === 'dark'
                    ? 'bg-[#00ff41]/40'
                    : 'bg-gray-300')
                }
              >
                <span
                  className={
                    'inline-block h-5 w-5 transform rounded-full bg-white transition-transform ' +
                    (theme === 'dark' ? 'translate-x-5' : 'translate-x-1')
                  }
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF3B30]/10 to-[#FF6B6B]/10 dark:from-[#FF3B30]/10 dark:to-[#FF6B6B]/10 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#FF3B30] dark:text-[#FF6B6B]" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">通知設定</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">リマインダー、お知らせ</p>
                </div>
              </div>
              <button
                type="button"
                className={
                  `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ` +
                  (theme === 'dark'
                    ? 'bg-[#00ff41]/40'
                    : 'bg-[#34C759]')
                }
              >
                <span className="inline-block h-5 w-5 transform translate-x-5 rounded-full bg-white" />
              </button>
            </div>

            <button
              type="button"
              onClick={onHelpSupport}
              className="w-full flex items-center justify-between p-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#AF52DE]/10 to-[#BF5AF2]/10 dark:from-[#AF52DE]/10 dark:to-[#BF5AF2]/10 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-[#AF52DE] dark:text-[#BF5AF2]" />
                </div>
                <div className="text-left">
                  <p className="text-gray-900 dark:text-white font-medium">ヘルプ・サポート</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">よくある質問、お問い合わせ</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-zinc-600" />
            </button>
          </div>
        </div>

        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="p-6 bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/10 dark:from-[#00ff41]/10 dark:to-[#00ff41]/5 rounded-2xl border-2 border-[#FFD700]/30 dark:border-[#00ff41]/30 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#FFA500] dark:from-[#00ff41] dark:to-[#00cc33] rounded-full flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white mb-2 font-semibold">
                    プレミアムプランで、
                    <br />
                    できることが広がります
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-zinc-400 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-[#34C759] dark:text-[#00ff41] mt-0.5">✓</span>
                      <span>食事管理・PFC自動計算</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#34C759] dark:text-[#00ff41] mt-0.5">✓</span>
                      <span>運動アシスト・回数カウント</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#34C759] dark:text-[#00ff41] mt-0.5">✓</span>
                      <span>体重記録・進捗グラフ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#34C759] dark:text-[#00ff41] mt-0.5">✓</span>
                      <span>目標設定・モチベーション管理</span>
                    </li>
                  </ul>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button className="w-full h-12 rounded-xl bg-[#34C759] text-white dark:bg-[#00c63a] dark:text-zinc-950 shadow-sm hover:bg-[#2fb150] dark:hover:bg-[#00ff41] text-sm font-semibold flex items-center justify-center">
                      <Crown className="w-4 h-4 mr-2" />
                      プレミアムにアップグレード
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="text-center space-y-2">
          <p className="text-xs text-gray-400 dark:text-zinc-600">TORIMO バージョン 1.0.0</p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <button className="text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">
              利用規約
            </button>
            <span className="text-gray-300 dark:text-zinc-700">|</span>
            <button className="text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">
              プライバシーポリシー
            </button>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            onClick={onLogout}
            className="w-full h-12 bg-white/90 text-[#FF3B30] border border-[#FF3B30]/15 rounded-xl hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30]/40 text-sm font-semibold flex items-center justify-center shadow-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ログアウト
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
