// プロフィール編集
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Camera,
  Trash2,
  Upload,
  Calendar,
  Ruler,
  Weight,
  Target,
  MessageSquare,
  Save,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Button from './ui/button.js'

// プロフィール編集画面
export default function ProfileEdit({
  onBack,
  theme,
  initialData,
  onSave,
  profileImage,
  onImageChange,
}) {
  // 画像プレビューとプロフィール情報
  const [profileImagePreview, setProfileImagePreview] = useState(profileImage || null)
  const [profileData, setProfileData] = useState(
    initialData || {
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

  // 画面表示時にトップへ移動
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // 画像アップロード
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      setProfileImagePreview(result)
      onImageChange && onImageChange(result)
    }
    reader.readAsDataURL(file)
  }

  // 画像削除
  const handleDeleteImage = () => {
    setProfileImagePreview(null)
    onImageChange && onImageChange(null)
  }

  // 保存（BMIを再計算して渡す）
  const handleSave = () => {
    const heightInMeters = profileData.height / 100 || 0.0001
    const calculatedBMI = profileData.weight / (heightInMeters * heightInMeters)
    const updatedData = { ...profileData, bmi: parseFloat(calculatedBMI.toFixed(1)) }
    onSave && onSave(updatedData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 pb-24 transition-colors">
      <div className="bg-gradient-to-r from-[#34C759] to-[#30D158] dark:from-zinc-900 dark:to-zinc-900 px-6 py-6 text-white transition-colors sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-semibold">プロフィールを編集</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border-4 border-[#34C759] dark:border-[#00ff41] transition-colors">
            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center transition-colors shadow-lg overflow-hidden border-4 border-[#34C759]/20 dark:border-[#00ff41]/20">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-7xl">👤</div>
                    )}
                  </div>
                  <motion.label
                    whileTap={{ scale: 0.9 }}
                    htmlFor="image-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 bg-[#34C759] dark:bg-[#00ff41] rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900 cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-white dark:text-zinc-900" />
                  </motion.label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {profileImagePreview && (
                  <motion.button
                    type="button"
                    onClick={handleDeleteImage}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    現在の画像を削除する
                  </motion.button>
                )}

                {!profileImagePreview && (
                  <p className="text-center text-gray-500 dark:text-zinc-400 text-sm">
                    現在画像は設定されていません
                  </p>
                )}

                <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-6 text-center hover:border-[#34C759] dark:hover:border-[#00ff41] transition-colors bg-gray-50 dark:bg-zinc-800/50">
                  <label htmlFor="image-upload-form" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 dark:text-zinc-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-zinc-300 mb-1">
                      新しい画像をアップロード
                    </p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">
                      クリックして画像を選択
                    </p>
                  </label>
                  <input
                    id="image-upload-form"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2l shadow-lg border-2 border-gray-200 dark:border-zinc-800 transition-colors">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  お名前
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl h-12 text-base px-3"
                  placeholder="例: 山田 太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  年齢
                </label>
                <input
                  type="number"
                  value={profileData.age}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      age: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl h-12 text-base px-3"
                  placeholder="例: 28"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  <Ruler className="w-4 h-4 inline mr-1" />
                  身長 (cm)
                </label>
                <input
                  type="number"
                  value={profileData.height}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      height: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl h-12 text-base px-3"
                  placeholder="例: 170"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  <Weight className="w-4 h-4 inline mr-1" />
                  体重 (kg)
                </label>
                <input
                  type="number"
                  value={profileData.weight}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      weight: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl h-12 text-base px-3"
                  placeholder="例: 70"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  目標体重 (kg)
                </label>
                <input
                  type="number"
                  value={profileData.goalWeight}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      goalWeight: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl h-12 text-base px-3"
                  placeholder="例: 65"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  メッセージ
                </label>
                <textarea
                  value={profileData.message}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      message: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl min-h-24 text-base resize-none p-3"
                  placeholder="あなたの目標や意気込みを入力してください"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-[#34C759] to-[#30D158] dark:from-[#00ff41] dark:to-[#00cc33] text-white dark:text-zinc-950 rounded-2xl h-16 text-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            保存する
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onBack}
            className="w-full h-14 border-2 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-2xl font-semibold"
          >
            キャンセル
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
