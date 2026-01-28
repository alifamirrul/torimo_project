import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import {
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  Video,
  Trophy,
  Zap,
  TrendingUp,
  Camera,
  Check,
  Undo2,
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { supabase, SUPABASE_ENABLED } from '../supabaseClient'

const exercises = [
  {
    id: 'burpee',
    name: 'Burpee',
    nameJa: 'バーピー',
    icon: '🏃',
    color: '#FF6B6B',
    gradient: 'from-[#FF6B6B] to-[#FF8787]',
    difficulty: 'advanced',
    calories: 10,
    description: '全身運動で効果的にカロリー消費',
  },
  {
    id: 'boxjump',
    name: 'Box Jump',
    nameJa: 'ボックスジャンプ',
    icon: '📦',
    color: '#FF9500',
    gradient: 'from-[#FF9500] to-[#FFB84D]',
    difficulty: 'intermediate',
    calories: 8,
    description: '下半身の爆発的なパワーを鍛える',
  },
  {
    id: 'jumpingjack',
    name: 'Jumping Jack',
    nameJa: 'ジャンピングジャック',
    icon: '⭐',
    color: '#34C759',
    gradient: 'from-[#34C759] to-[#30D158]',
    difficulty: 'beginner',
    calories: 5,
    description: '有酸素運動で心肺機能向上',
  },
  {
    id: 'legraise',
    name: 'Leg Raise',
    nameJa: 'レッグレイズ',
    icon: '🦵',
    color: '#5AC8FA',
    gradient: 'from-[#5AC8FA] to-[#64D2FF]',
    difficulty: 'intermediate',
    calories: 6,
    description: '下腹部を集中的に鍛える',
  },
  {
    id: 'pushup',
    name: 'Push-up',
    nameJa: '腕立て伏せ',
    icon: '💪',
    color: '#AF52DE',
    gradient: 'from-[#AF52DE] to-[#BF5AF2]',
    difficulty: 'beginner',
    calories: 4,
    description: '上半身の基本トレーニング',
  },
  {
    id: 'squat',
    name: 'Squat',
    nameJa: 'スクワット',
    icon: '🏋️',
    color: '#FF2D55',
    gradient: 'from-[#FF2D55] to-[#FF6B81]',
    difficulty: 'beginner',
    calories: 7,
    description: '下半身全体を強化',
  },
  {
    id: 'lunge',
    name: 'Lunge',
    nameJa: 'ランジ',
    icon: '🚶',
    color: '#0FB9B1',
    gradient: 'from-[#0FB9B1] to-[#00CEC9]',
    difficulty: 'intermediate',
    calories: 6,
    description: 'バランスと下半身を鍛える',
  },
]

const difficultyLabels = {
  beginner: { ja: '初級', color: 'bg-green-500' },
  intermediate: { ja: '中級', color: 'bg-yellow-500' },
  advanced: { ja: '上級', color: 'bg-red-500' },
}

const detectionConfigs = {
  burpee: {
    downThreshold: 300,
    upThreshold: 200,
    minConfidence: 0.5,
    keypoints: ['left_hip', 'right_hip'],
    aggregation: 'average',
  },
  squat: {
    angleBased: true,
    downAngle: 100,
    upAngle: 160,
    minConfidence: 0.5,
    keypoints: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle'],
    anglePoints: {
      left: ['left_hip', 'left_knee', 'left_ankle'],
      right: ['right_hip', 'right_knee', 'right_ankle'],
    },
  },
  lunge: {
    angleBased: true,
    downAngle: 95,
    upAngle: 155,
    minConfidence: 0.5,
    keypoints: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle'],
    anglePoints: {
      left: ['left_hip', 'left_knee', 'left_ankle'],
      right: ['right_hip', 'right_knee', 'right_ankle'],
    },
  },
  pushup: {
    angleBased: true,
    downAngle: 90,
    upAngle: 165,
    minConfidence: 0.5,
    keypoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
    anglePoints: {
      left: ['left_shoulder', 'left_elbow', 'left_wrist'],
      right: ['right_shoulder', 'right_elbow', 'right_wrist'],
    },
  },
  legraise: {
    downThreshold: 350,
    upThreshold: 250,
    minConfidence: 0.5,
    keypoints: ['left_ankle', 'right_ankle'],
    aggregation: 'min',
  },
  boxjump: {
    downThreshold: 360,
    upThreshold: 240,
    minConfidence: 0.5,
    keypoints: ['left_ankle', 'right_ankle'],
    aggregation: 'min',
  },
  jumpingjack: {
    downThreshold: 340,
    upThreshold: 230,
    minConfidence: 0.5,
    keypoints: ['left_wrist', 'right_wrist'],
    aggregation: 'min',
  },
}

const formatTime = (seconds) => {
  // 秒を「分:秒」に変換する
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// ラジアンを度に変換する
const toDegrees = (radians) => (radians * 180) / Math.PI

// 3点(a-b-c)の角度を求める（bが頂点）
const angleBetween = (a, b, c) => {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const magAb = Math.hypot(ab.x, ab.y)
  const magCb = Math.hypot(cb.x, cb.y)
  if (!magAb || !magCb) return null
  const cosine = Math.min(1, Math.max(-1, dot / (magAb * magCb)))
  return toDegrees(Math.acos(cosine))
}

// 指定した名前のキーポイントを探す
const getKeypoint = (keypoints, name) => keypoints.find((point) => point.name === name)

// 値をmin〜maxの範囲に収める
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

// 配列の平均値を計算する
const average = (values) => {
  if (!values.length) return null
  const total = values.reduce((sum, v) => sum + v, 0)
  return total / values.length
}

// ある値がターゲット付近（許容範囲内）かを判定する
const within = (value, target, tolerance) => Math.abs(value - target) <= tolerance

// 設定に合わせて左右どちらかの関節角度を取得する
const getAngleForConfig = (keypoints, config) => {
  if (!config?.anglePoints) return null
  const minConfidence = config.minConfidence ?? 0.5
  const [la, lb, lc] = config.anglePoints.left
  const [ra, rb, rc] = config.anglePoints.right

  const leftA = getKeypoint(keypoints, la)
  const leftB = getKeypoint(keypoints, lb)
  const leftC = getKeypoint(keypoints, lc)

  const rightA = getKeypoint(keypoints, ra)
  const rightB = getKeypoint(keypoints, rb)
  const rightC = getKeypoint(keypoints, rc)

  const leftOk = leftA && leftB && leftC && leftA.score > minConfidence && leftB.score > minConfidence && leftC.score > minConfidence
  const rightOk = rightA && rightB && rightC && rightA.score > minConfidence && rightB.score > minConfidence && rightC.score > minConfidence

  if (leftOk) {
    return angleBetween(leftA, leftB, leftC)
  }
  if (rightOk) {
    return angleBetween(rightA, rightB, rightC)
  }
  return null
}

const drawLine = (ctx, a, b, color = 'rgba(16, 185, 129, 0.9)') => {
  if (!a || !b) return
  ctx.strokeStyle = color
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.stroke()
}

const getAngleColor = (angle, config) => {
  if (angle == null || !config?.angleBased) return 'rgba(255, 99, 99, 0.9)'
  if (angle < config.downAngle) return 'rgba(16, 185, 129, 0.9)'
  if (angle > config.upAngle) return 'rgba(239, 68, 68, 0.9)'
  return 'rgba(245, 158, 11, 0.9)'
}

// 1回のカウントを安定して数えるためのカスタムフック
const useRepCounter = () => {
  const stateRef = useRef('IDLE')
  const stageRef = useRef('standing')
  const angleBufferRef = useRef([])
  const stableFramesRef = useRef(0)
  const cooldownUntilRef = useRef(0)
  const lastAngleRef = useRef(null)
  const movementMinRef = useRef(null)
  const movementMaxRef = useRef(null)

  // カウント状態を初期化する
  const reset = useCallback(() => {
    stateRef.current = 'IDLE'
    stageRef.current = 'standing'
    angleBufferRef.current = []
    stableFramesRef.current = 0
    cooldownUntilRef.current = 0
    lastAngleRef.current = null
    movementMinRef.current = null
    movementMaxRef.current = null
  }, [])

  // 角度の移動平均（ブレを減らす）
  const updateAngleBuffer = useCallback((angle, windowSize) => {
    if (angle == null) return null
    const buffer = angleBufferRef.current
    buffer.push(angle)
    if (buffer.length > windowSize) buffer.shift()
    angleBufferRef.current = buffer
    return average(buffer)
  }, [])

  // 条件が連続で満たされた回数を確認する
  const bumpStable = useCallback((conditionMet, framesRequired) => {
    if (conditionMet) {
      stableFramesRef.current += 1
    } else {
      stableFramesRef.current = 0
    }
    return stableFramesRef.current >= framesRequired
  }, [])

  // 連続カウントを防ぐためのクールダウン
  const applyCooldown = useCallback((ms) => {
    cooldownUntilRef.current = Date.now() + ms
  }, [])

  // クールダウン中かどうか
  const inCooldown = useCallback(() => Date.now() < cooldownUntilRef.current, [])

  // 関節角度ベースの運動（腕立て・スクワット等）の判定
  const processAngleBased = useCallback((keypoints, config) => {
    const minConfidence = config.minConfidence ?? 0.5
    const [la, lb, lc] = config.anglePoints.left
    const [ra, rb, rc] = config.anglePoints.right
    const leftA = getKeypoint(keypoints, la)
    const leftB = getKeypoint(keypoints, lb)
    const leftC = getKeypoint(keypoints, lc)
    const rightA = getKeypoint(keypoints, ra)
    const rightB = getKeypoint(keypoints, rb)
    const rightC = getKeypoint(keypoints, rc)

    const leftOk = leftA && leftB && leftC && leftA.score > minConfidence && leftB.score > minConfidence && leftC.score > minConfidence
    const rightOk = rightA && rightB && rightC && rightA.score > minConfidence && rightB.score > minConfidence && rightC.score > minConfidence

    let angle = null
    if (leftOk && rightOk) {
      const leftAngle = angleBetween(leftA, leftB, leftC)
      const rightAngle = angleBetween(rightA, rightB, rightC)
      if (leftAngle != null && rightAngle != null) {
        angle = Math.min(leftAngle, rightAngle)
        lastAngleRef.current = angle
      }
    } else if (leftOk) {
      angle = angleBetween(leftA, leftB, leftC)
      lastAngleRef.current = angle
    } else if (rightOk) {
      angle = angleBetween(rightA, rightB, rightC)
      lastAngleRef.current = angle
    } else {
      angle = lastAngleRef.current
    }

    const smoothed = updateAngleBuffer(angle, 5)
    return smoothed
  }, [updateAngleBuffer])

  // 位置（Y座標）ベースの運動の判定準備
  const processThresholdBased = useCallback((measurementY, canvasHeight) => {
    const minY = movementMinRef.current
    const maxY = movementMaxRef.current
    const nextMin = minY == null ? measurementY : Math.min(minY, measurementY)
    const nextMax = maxY == null ? measurementY : Math.max(maxY, measurementY)
    movementMinRef.current = nextMin
    movementMaxRef.current = nextMax

    const range = nextMax - nextMin
    if (stateRef.current === 'IDLE' && range > 0) {
      movementMinRef.current = nextMin + (measurementY - nextMin) * 0.02
      movementMaxRef.current = nextMax + (measurementY - nextMax) * 0.02
    }

    const adaptiveReady = range > canvasHeight * 0.12
    const adaptiveDown = nextMin + range * 0.7
    const adaptiveUp = nextMin + range * 0.3

    return {
      down: adaptiveReady ? adaptiveDown : null,
      up: adaptiveReady ? adaptiveUp : null,
    }
  }, [])

  // バーピー専用のステージ判定
  const processBurpee = useCallback((keypoints, config, canvas) => {
    const minConf = config.minConfidence ?? 0.5
    const leftHip = getKeypoint(keypoints, 'left_hip')
    const rightHip = getKeypoint(keypoints, 'right_hip')
    const leftShoulder = getKeypoint(keypoints, 'left_shoulder')
    const rightShoulder = getKeypoint(keypoints, 'right_shoulder')
    const leftAnkle = getKeypoint(keypoints, 'left_ankle')
    const rightAnkle = getKeypoint(keypoints, 'right_ankle')
    const leftKnee = getKeypoint(keypoints, 'left_knee')
    const rightKnee = getKeypoint(keypoints, 'right_knee')

    if (!leftHip || !rightHip || !leftShoulder || !rightShoulder || !leftAnkle || !rightAnkle) {
      return false
    }

    const points = [leftHip, rightHip, leftShoulder, rightShoulder, leftAnkle, rightAnkle]
    const ok = points.every((p) => p.score > minConf)
    if (!ok) return false

    const hipY = (leftHip.y + rightHip.y) / 2
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2
    const ankleY = (leftAnkle.y + rightAnkle.y) / 2
    const bodyHeight = Math.max(1, ankleY - shoulderY)

    const minY = movementMinRef.current
    const maxY = movementMaxRef.current
    const nextMin = minY == null ? hipY : Math.min(minY, hipY)
    const nextMax = maxY == null ? hipY : Math.max(maxY, hipY)
    movementMinRef.current = nextMin
    movementMaxRef.current = nextMax

    const hipRange = nextMax - nextMin
    const adaptiveReady = hipRange > bodyHeight * 0.2
    const hipDownThreshold = adaptiveReady
      ? nextMin + hipRange * 0.75
      : shoulderY + bodyHeight * 0.7
    const hipUpThreshold = adaptiveReady
      ? nextMin + hipRange * 0.35
      : shoulderY + bodyHeight * 0.45

    let kneeAngle = null
    const leftKneeOk = leftKnee && leftKnee.score > minConf && leftHip.score > minConf && leftAnkle.score > minConf
    const rightKneeOk = rightKnee && rightKnee.score > minConf && rightHip.score > minConf && rightAnkle.score > minConf
    if (leftKneeOk) kneeAngle = angleBetween(leftHip, leftKnee, leftAnkle)
    if (rightKneeOk) {
      const rightAngle = angleBetween(rightHip, rightKnee, rightAnkle)
      if (rightAngle != null) {
        kneeAngle = kneeAngle == null ? rightAngle : Math.min(kneeAngle, rightAngle)
      }
    }

    const squatByHip = hipY > hipDownThreshold
    const squatByKnee = kneeAngle != null && kneeAngle < 120
    const squatDown = squatByHip || squatByKnee
    const plank = Math.abs(shoulderY - hipY) < bodyHeight * 0.12 && hipY > hipDownThreshold * 0.95
    const jumpUp = hipY < hipUpThreshold

    switch (stageRef.current) {
      case 'standing':
        if (bumpStable(squatDown, 3)) stageRef.current = 'squat'
        break
      case 'squat':
        if (bumpStable(plank, 3)) stageRef.current = 'plank'
        break
      case 'plank':
        if (bumpStable(squatDown, 2)) stageRef.current = 'squat_return'
        break
      case 'squat_return':
        if (bumpStable(jumpUp, 2)) {
          stageRef.current = 'standing'
          applyCooldown(250)
          return true
        }
        break
      default:
        stageRef.current = 'standing'
    }

    return false
  }, [applyCooldown, bumpStable])

  // 1フレーム分の判定を行い、カウントするか決める
  const processFrame = useCallback(({ exerciseId, keypoints, config, canvas }) => {
    if (!config) return false
    if (inCooldown()) return false

    if (exerciseId === 'burpee') {
      return processBurpee(keypoints, config, canvas)
    }

    if (config.angleBased) {
      const angle = processAngleBased(keypoints, config)
      if (angle == null) return false
      const downAngle = config.downAngle
      const upAngle = config.upAngle

      if (stateRef.current === 'IDLE') {
        if (bumpStable(angle < downAngle, 3)) {
          stateRef.current = 'DOWN'
          stableFramesRef.current = 0
        }
        return false
      }

      if (stateRef.current === 'DOWN') {
        if (bumpStable(angle > upAngle, 3)) {
          stateRef.current = 'COUNT'
          applyCooldown(250)
          stateRef.current = 'IDLE'
          return true
        }
        return false
      }
      return false
    }

    const yValues = (config.keypoints || []).map((name) => {
      const point = getKeypoint(keypoints, name)
      return point?.y
    }).filter((val) => typeof val === 'number')

    if (!yValues.length || !canvas?.height) return false
    const measurementY =
      config.aggregation === 'min'
        ? Math.min(...yValues)
        : config.aggregation === 'max'
          ? Math.max(...yValues)
          : yValues.reduce((acc, value) => acc + value, 0) / yValues.length

    const adaptive = processThresholdBased(measurementY, canvas.height)
    const downThreshold = adaptive.down ?? config.downThreshold
    const upThreshold = adaptive.up ?? config.upThreshold

    if (stateRef.current === 'IDLE') {
      if (bumpStable(measurementY > downThreshold, 3)) {
        stateRef.current = 'DOWN'
        stableFramesRef.current = 0
      }
      return false
    }

    if (stateRef.current === 'DOWN') {
      if (bumpStable(measurementY < upThreshold, 3)) {
        stateRef.current = 'COUNT'
        applyCooldown(250)
        stateRef.current = 'IDLE'
        return true
      }
    }
    return false
  }, [applyCooldown, bumpStable, inCooldown, processAngleBased, processBurpee, processThresholdBased])

  return { processFrame, reset }
}

// メイン画面コンポーネント
export default function WorkoutAutoCount({ theme = 'light', onBack, userId, onHistorySaved }) {
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [count, setCount] = useState(0)
  const [bestRecord, setBestRecord] = useState(0)
  const [sessionTime, setSessionTime] = useState(0)
  const [cameraReady, setCameraReady] = useState(false)
  const [goalInput, setGoalInput] = useState('')
  const [goalCount, setGoalCount] = useState(null)
  const [historySaving, setHistorySaving] = useState(false)
  const [historyFeedback, setHistoryFeedback] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [flashEffect, setFlashEffect] = useState(false)
  const goalAudioRef = useRef(null)
  const sessionTimerRef = useRef(null)
  const autoCountRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const poseCtxRef = useRef(null)
  const poseAnimationFrameRef = useRef(null)
  const detectorRef = useRef(null)
  const movementDownRef = useRef(false)
  const goalCountRef = useRef(null)
  const sessionSavedRef = useRef(false)
  const movementMinRef = useRef(null)
  const movementMaxRef = useRef(null)
  const burpeeStageRef = useRef('standing')
  const containerRef = useRef(null)
  const lastExerciseIdRef = useRef(null)
  const lastStartPopupAtRef = useRef(0)
  const cameraInitRef = useRef(false)
  const startPopupShownRef = useRef(false)
  const lastPopupRef = useRef({ message: '', at: 0 })
  const detectionConfig = selectedExercise ? detectionConfigs[selectedExercise.id] : null
  const usesPoseDetection = Boolean(detectionConfig)
  const repCounter = useRepCounter()

  // ポップアップとフラッシュ演出を表示する
  const triggerFlashAndPopup = useCallback((message) => {
    const now = Date.now()
    if (lastPopupRef.current.message === message && now - lastPopupRef.current.at < 2000) {
      return
    }
    lastPopupRef.current = { message, at: now }
    setPopupMessage(message)
    setShowPopup(true)
    setFlashEffect(true)
    setTimeout(() => setFlashEffect(false), 500)
    setTimeout(() => setShowPopup(false), 1500)
  }, [])

  // 目標達成時の効果音を鳴らす
  const playGoalSound = useCallback(() => {
    try {
      const audio = goalAudioRef.current
      if (!audio) return
      audio.currentTime = 0
      audio.play().catch(() => {})
    } catch (err) {
      // ignore audio errors
    }
  }, [])

  // 効果音の初期化
  useEffect(() => {
    if (typeof window === 'undefined') return
    const audio = new Audio('/sounds/clear.mp3')
    audio.preload = 'auto'
    goalAudioRef.current = audio
    return () => {
      goalAudioRef.current = null
    }
  }, [])

  // 画面フェードとボタンのクリック演出
  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    container.style.opacity = '0'
    container.style.transition = 'opacity 0.8s ease'

    const fadeTimeout = setTimeout(() => {
      container.style.opacity = '1'
    }, 100)

    const handleButtonClick = (event) => {
      const btn = event.currentTarget
      if (!btn) {
        return
      }
      btn.style.transform = 'scale(0.95)'
      btn.style.opacity = '0.8'
      setTimeout(() => {
        btn.style.transform = ''
        btn.style.opacity = ''
      }, 200)
    }

    const buttons = Array.from(container.querySelectorAll('button'))
    buttons.forEach((btn) => btn.addEventListener('click', handleButtonClick))

    return () => {
      clearTimeout(fadeTimeout)
      buttons.forEach((btn) => btn.removeEventListener('click', handleButtonClick))
    }
  }, [selectedExercise])

  // 種目変更時に各種状態をリセット
  useEffect(() => {
    if (selectedExercise) {
      const now = Date.now()
      const isNewExercise = lastExerciseIdRef.current !== selectedExercise.id
      if (isNewExercise) {
        startPopupShownRef.current = false
      }
      lastExerciseIdRef.current = selectedExercise.id
      lastStartPopupAtRef.current = now
      movementMinRef.current = null
      movementMaxRef.current = null
      burpeeStageRef.current = 'standing'
      repCounter.reset()
    }
  }, [selectedExercise, repCounter])

  // ポーズ描画用キャンバスをクリアする
  const clearPoseCanvas = () => {
    if (poseCtxRef.current && canvasRef.current) {
      poseCtxRef.current.clearRect(0, 0, canvasRef.current.width || 0, canvasRef.current.height || 0)
    }
  }

  // セッションの経過時間をカウントする
  useEffect(() => {
    if (isActive) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime((prev) => prev + 1)
      }, 1000)
    } else if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current)
      sessionTimerRef.current = null
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
    }
  }, [isActive])

  // 目標回数の参照を常に最新にする
  useEffect(() => {
    goalCountRef.current = goalCount
  }, [goalCount])

  // 種目の変更に合わせてカメラ/カウントを初期化
  useEffect(() => {
    movementDownRef.current = false
    sessionSavedRef.current = false
    setHistoryFeedback('')
    if (!usesPoseDetection) {
      setGoalCount(null)
      setGoalInput('')
      if (poseAnimationFrameRef.current) {
        cancelAnimationFrame(poseAnimationFrameRef.current)
        poseAnimationFrameRef.current = null
      }
      clearPoseCanvas()
    } else {
      setGoalCount(null)
      setGoalInput('')
    }
  }, [usesPoseDetection, detectionConfig])

  // カメラを使わない場合の簡易カウント
  useEffect(() => {
    if (isActive && !usesPoseDetection) {
      autoCountRef.current = setInterval(() => {
        setCount((prev) => {
          const newCount = prev + 1
          setBestRecord((prevBest) => Math.max(prevBest, newCount))
          return newCount
        })
      }, 2000)
    } else if (autoCountRef.current) {
      clearInterval(autoCountRef.current)
      autoCountRef.current = null
    }

    return () => {
      if (autoCountRef.current) {
        clearInterval(autoCountRef.current)
      }
    }
  }, [isActive, usesPoseDetection])

  // カメラの起動と停止
  useEffect(() => {
    if (!selectedExercise || typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setCameraReady(false)
      return
    }
    if (cameraInitRef.current && streamRef.current) {
      setCameraReady(true)
      return
    }

    cameraInitRef.current = true
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          streamRef.current = stream
          videoRef.current.srcObject = stream
          videoRef.current.onloadeddata = () => {
            setCameraReady(true)
            if (!startPopupShownRef.current) {
              triggerFlashAndPopup('スタート！')
              startPopupShownRef.current = true
            }
          }
        }
      })
      .catch(() => {
        setCameraReady(false)
        cameraInitRef.current = false
      })

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      cameraInitRef.current = false
      setCameraReady(false)
      startPopupShownRef.current = false
      clearPoseCanvas()
    }
  }, [selectedExercise])

  // MoveNetモデルの初期化
  useEffect(() => {
    if (!usesPoseDetection) {
      return
    }

    let cancelled = false

    const initDetector = async () => {
      try {
        await tf.ready()
        if (tf.getBackend() !== 'webgl') {
          try {
            await tf.setBackend('webgl')
          } catch {
            await tf.setBackend('cpu')
          }
        }
        if (!detectorRef.current && !cancelled) {
          detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          })
        }
      } catch (error) {
        console.error('Failed to initialize MoveNet detector', error)
      }
    }

    initDetector()

    return () => {
      cancelled = true
    }
  }, [usesPoseDetection])

  // ポーズ推定のループ処理
  useEffect(() => {
    if (!usesPoseDetection || !cameraReady || !isActive || !detectionConfig) {
      if (poseAnimationFrameRef.current) {
        cancelAnimationFrame(poseAnimationFrameRef.current)
        poseAnimationFrameRef.current = null
      }
      clearPoseCanvas()
      return
    }

    let cancelled = false

    const detectPose = async () => {
      if (!detectorRef.current || !videoRef.current || !canvasRef.current) {
        if (!cancelled) {
          poseAnimationFrameRef.current = requestAnimationFrame(detectPose)
        }
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current

      if (video.videoWidth && video.videoHeight) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }
      }

      const ctx = poseCtxRef.current || canvas.getContext('2d')
      poseCtxRef.current = ctx
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      try {
        const poses = await detectorRef.current.estimatePoses(video)
        if (poses.length > 0) {
          const keypoints = poses[0].keypoints || []
          const targetPoints = detectionConfig.keypoints || []
          const detectedPoints = targetPoints.map((name) => keypoints.find((point) => point.name === name))
          const hasAllPoints =
            detectedPoints.length === targetPoints.length &&
            detectedPoints.every((point) => point && point.score > detectionConfig.minConfidence)

          if (hasAllPoints) {
            const counted = repCounter.processFrame({
              exerciseId: selectedExercise?.id,
              keypoints,
              config: detectionConfig,
              canvas,
            })
            if (counted) {
              setCount((prev) => {
                const newCount = prev + 1
                setBestRecord((prevBest) => Math.max(prevBest, newCount))
                if (goalCountRef.current && newCount >= goalCountRef.current) {
                  playGoalSound()
                  triggerFlashAndPopup('目標達成おめでとう！')
                  goalCountRef.current = null
                  setGoalCount(null)
                  setGoalInput('')
                  return 0
                }
                return newCount
              })
            }

            const angle = detectionConfig.angleBased ? getAngleForConfig(keypoints, detectionConfig) : null
            const lineColor = getAngleColor(angle, detectionConfig)

            if (detectionConfig.angleBased && detectionConfig.anglePoints) {
              const [la, lb, lc] = detectionConfig.anglePoints.left
              const [ra, rb, rc] = detectionConfig.anglePoints.right
              const leftA = getKeypoint(keypoints, la)
              const leftB = getKeypoint(keypoints, lb)
              const leftC = getKeypoint(keypoints, lc)
              const rightA = getKeypoint(keypoints, ra)
              const rightB = getKeypoint(keypoints, rb)
              const rightC = getKeypoint(keypoints, rc)
              drawLine(ctx, leftA, leftB, lineColor)
              drawLine(ctx, leftB, leftC, lineColor)
              drawLine(ctx, rightA, rightB, lineColor)
              drawLine(ctx, rightB, rightC, lineColor)
            }

            ctx.fillStyle = lineColor
            detectedPoints.forEach((point) => {
              ctx.beginPath()
              ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI)
              ctx.fill()
            })
          } else {
            movementDownRef.current = false
          }
        } else {
          movementDownRef.current = false
        }
      } catch (error) {
        console.error('Pose detection error', error)
      }

      if (!cancelled) {
        poseAnimationFrameRef.current = requestAnimationFrame(detectPose)
      }
    }

    poseAnimationFrameRef.current = requestAnimationFrame(detectPose)

    return () => {
      cancelled = true
      if (poseAnimationFrameRef.current) {
        cancelAnimationFrame(poseAnimationFrameRef.current)
        poseAnimationFrameRef.current = null
      }
      clearPoseCanvas()
    }
  }, [usesPoseDetection, cameraReady, isActive, detectionConfig])

  // コンポーネント破棄時の後始末
  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
      if (autoCountRef.current) {
        clearInterval(autoCountRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (poseAnimationFrameRef.current) {
        cancelAnimationFrame(poseAnimationFrameRef.current)
        poseAnimationFrameRef.current = null
      }
      if (detectorRef.current?.dispose) {
        detectorRef.current.dispose()
        detectorRef.current = null
      }
      clearPoseCanvas()
    }
  }, [])

  // 運動履歴をSupabaseに保存する
  const persistSession = useCallback(async (reason = 'manual') => {
    if (!SUPABASE_ENABLED || !userId || !selectedExercise || count === 0 || sessionSavedRef.current) {
      return false
    }
    try {
      setHistorySaving(true)
      setHistoryFeedback('保存中...')
      const durationSeconds = Math.max(0, sessionTime)
      const numericGoal = Number(goalCount)
      const sets = Number.isFinite(numericGoal) && numericGoal > 0 ? Math.max(1, Math.ceil(count / numericGoal)) : 1
      const caloriesBurned = Math.max(0, Math.round(count * (selectedExercise?.calories ?? 6)))
      const payload = {
        user_id: userId,
        exercise_id: selectedExercise.id,
        exercise_name: selectedExercise.nameJa,
        reps: count,
        sets,
        duration_seconds: durationSeconds,
        calories_burned: caloriesBurned,
      }
      const { error } = await supabase.from('exercise_history').insert(payload)
      if (error) {
        throw error
      }
      if (SUPABASE_ENABLED && userId) {
        const durationMinutes = Math.max(0, Math.round(durationSeconds / 60))
        const calories = Math.max(0, caloriesBurned)
        const workoutPayload = {
          user_id: userId,
          workout_type: selectedExercise.nameJa,
          duration_minutes: durationMinutes,
          calories,
        }
        await supabase.from('workout_history').insert(workoutPayload)

        const today = new Date().toISOString().slice(0, 10)
        const { data: workouts } = await supabase
          .from('workout_history')
          .select('duration_minutes, calories, created_at')
          .eq('user_id', userId)
          .gte('created_at', `${today}T00:00:00Z`)
          .lte('created_at', `${today}T23:59:59Z`)

        if (workouts) {
          const totalMinutes = workouts.reduce((sum, item) => sum + (item.duration_minutes || 0), 0)
          const totalCalories = workouts.reduce((sum, item) => sum + (item.calories || 0), 0)
          const steps = totalMinutes * 100
          await supabase
            .from('daily_summary')
            .upsert(
              {
                user_id: userId,
                date: today,
                steps,
                exercise_minutes: totalMinutes,
                calories: totalCalories,
              },
              { onConflict: 'user_id,date' }
            )
        }
      }
      sessionSavedRef.current = true
      setHistoryFeedback('運動記録を保存しました')
      onHistorySaved?.()
      return true
    } catch (error) {
      console.error('Failed to save exercise history', error, { reason })
      setHistoryFeedback('記録の保存に失敗しました。通信環境をご確認ください。')
      return false
    } finally {
      setHistorySaving(false)
    }
  }, [userId, selectedExercise, count, goalCount, sessionTime, onHistorySaved])

  // 計測開始
  const handleStart = () => {
    if (!cameraReady) {
      return
    }
    movementMinRef.current = null
    movementMaxRef.current = null
    movementDownRef.current = false
    burpeeStageRef.current = 'standing'
    sessionSavedRef.current = false
    setHistoryFeedback('')
    setIsActive(true)
  }

  // 一時停止
  const handlePause = () => {
    setIsActive(false)
  }

  // リセット（必要なら保存）
  const handleReset = async () => {
    if (SUPABASE_ENABLED && userId && count > 0 && selectedExercise && !sessionSavedRef.current) {
      const saved = await persistSession('reset')
      if (!saved) {
        return
      }
    }
    setIsActive(false)
    setCount(0)
    setSessionTime(0)
    movementDownRef.current = false
    sessionSavedRef.current = false
    clearPoseCanvas()
  }

  // 1回戻す
  const handleUndo = () => {
    setCount((prev) => Math.max(prev - 1, 0))
  }

  // 目標回数を設定
  const handleSetGoal = () => {
    const value = Number(goalInput)
    if (Number.isFinite(value) && value > 0) {
      setGoalCount(value)
    }
  }

  // 戻る（必要なら保存）
  const handleBack = async () => {
    if (SUPABASE_ENABLED && userId && count > 0 && selectedExercise && !sessionSavedRef.current) {
      const saved = await persistSession('back')
      if (!saved) {
        return
      }
    }
    setSelectedExercise(null)
    setIsActive(false)
    setCount(0)
    setSessionTime(0)
    movementDownRef.current = false
    sessionSavedRef.current = false
    clearPoseCanvas()
  }

  if (!selectedExercise) {
    return (
      <div
        ref={containerRef}
        className={`min-h-screen transition-colors ${flashEffect ? 'flash-effect' : ''} ${
          theme === 'dark' ? 'bg-gradient-to-b from-zinc-950 to-zinc-900' : 'bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec]'
        }`}
      >
        {flashEffect && <div className="flash-overlay" />}
        {showPopup && (
          <div className="popup-toast">
            <span>{popupMessage}</span>
          </div>
        )}
        <div className="max-w-3xl mx-auto px-6 py-8 pb-32 sm:pb-40">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Dumbbell
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: theme === 'dark' ? '#00ff41' : '#FF9500' }}
            />
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>運動カウント</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              AIが自動でカウント。運動を選んで開始しましょう
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <Card
              className={`p-4 rounded-xl border-2 text-center transition-colors ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
              }`}
            >
              <Trophy className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#FFD700]'}`} />
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{bestRecord}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>ベスト記録</div>
            </Card>

            <Card
              className={`p-4 rounded-xl border-2 text-center transition-colors ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
              }`}
            >
              <Zap className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#FF9500]'}`} />
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{count * 7}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>総消費カロリー</div>
            </Card>

            <Card
              className={`p-4 rounded-xl border-2 text-center transition-colors ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
              }`}
            >
              <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#34C759]'}`} />
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>12</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>完了セッション</div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Card
                  onClick={() => setSelectedExercise(exercise)}
                  className={`relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
                    theme === 'dark'
                      ? 'bg-zinc-900 border-zinc-800 hover:border-[#00ff41]/50'
                      : 'bg-white border-gray-200 hover:border-[#34C759]/50'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${exercise.gradient} opacity-10`} />
                  <div className="relative p-5">
                    <div className="text-5xl mb-3 text-center">{exercise.icon}</div>
                    <h3 className={`text-lg font-bold text-center mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {exercise.nameJa}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Badge className={`${difficultyLabels[exercise.difficulty].color} text-white border-0 text-xs`}>
                        {difficultyLabels[exercise.difficulty].ja}
                      </Badge>
                    </div>
                    <div className={`text-xs text-center mb-3 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      {exercise.description}
                    </div>
                    <div className={`text-center text-sm font-bold ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#FF9500]'}`}>
                      🔥 {exercise.calories} kcal/回
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Card
              className={`p-4 rounded-xl border-2 transition-colors ${
                theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <Camera className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#34C759]'}`} />
                <div className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  <p className="font-bold mb-1">カメラ使用について</p>
                  <p>
                    運動を自動でカウントするため、カメラへのアクセスを許可してください。
                    撮影したデータは保存されません。
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {onBack && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 text-center">
              <button
                onClick={onBack}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors mx-auto ${
                  theme === 'dark'
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                    : 'bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-bold">戻る</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-screen transition-colors ${flashEffect ? 'flash-effect' : ''} ${
        theme === 'dark' ? 'bg-gradient-to-b from-zinc-950 to-zinc-900' : 'bg-gradient-to-b from-[#f8faf9] to-[#e8f5ec]'
      }`}
    >
      {flashEffect && <div className="flash-overlay" />}
      {showPopup && (
        <div className="popup-toast">
          <span>{popupMessage}</span>
        </div>
      )}
      <div className="max-w-2xl mx-auto px-6 py-6 pb-32 sm:pb-40">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold">戻る</span>
          </button>
          <div className="text-2xl">{selectedExercise.icon}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {selectedExercise.nameJa}
          </h2>
          <Badge className={`${difficultyLabels[selectedExercise.difficulty].color} text-white border-0`}>
            {difficultyLabels[selectedExercise.difficulty].ja}
          </Badge>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="mb-6">
          <Card
            className={`relative overflow-hidden rounded-2xl border-2 aspect-[3/4] ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
            }`}
          >
            <div className="absolute inset-0">
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            </div>

            {!cameraReady && (
              <div className={`absolute inset-0 flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                <Video className={`w-16 h-16 mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>カメラを準備中...</p>
              </div>
            )}

            <div className="absolute top-4 left-0 right-0 flex justify-center">
              <motion.div
                key={count}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-md ${
                  theme === 'dark' ? 'bg-black/60 border-2 border-[#00ff41]/50' : 'bg-white/80 border-2 border-[#34C759]/50'
                }`}
              >
                <div className={`text-6xl font-bold bg-gradient-to-r ${selectedExercise.gradient} bg-clip-text text-transparent`}>
                  {count}
                </div>
                <div className={`text-xs text-center mt-1 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}>回</div>
              </motion.div>
            </div>

            {isActive && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-red-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-xs font-bold">計測中</span>
              </motion.div>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <div className={`flex-1 px-4 py-3 rounded-xl backdrop-blur-md ${
                theme === 'dark' ? 'bg-black/60 border border-zinc-700' : 'bg-white/80 border border-gray-300'
              }`}>
                <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>経過時間</div>
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatTime(sessionTime)}</div>
              </div>

              <div className={`flex-1 px-4 py-3 rounded-xl backdrop-blur-md ${
                theme === 'dark' ? 'bg-black/60 border border-zinc-700' : 'bg-white/80 border border-gray-300'
              }`}>
                <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>消費カロリー</div>
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#FF9500]'}`}>
                  {count * selectedExercise.calories} kcal
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {usesPoseDetection && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4">
            <Card
              className={`p-4 rounded-2xl border-2 ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>目標回数</p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                    現在の目標: {goalCount ?? '-'} 回
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="number"
                    min="1"
                    value={goalInput}
                    onChange={(event) => setGoalInput(event.target.value)}
                    placeholder="例: 20"
                    className={`w-full rounded-xl border px-4 py-2 text-sm outline-none sm:w-40 ${
                      theme === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#00ff41]'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#34C759]'
                    }`}
                  />
                  <Button
                    type="button"
                    onClick={handleSetGoal}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl font-bold text-sm sm:text-base ${
                      theme === 'dark' ? 'bg-[#00ff41] text-zinc-950 hover:bg-[#00ff41]/90' : 'bg-[#34C759] text-white hover:opacity-90'
                    }`}
                  >
                    目標を設定
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          <Button
            onClick={isActive ? handlePause : handleStart}
            disabled={!cameraReady}
            className={`group relative w-full rounded-2xl font-bold transition-all py-5 sm:py-6 text-base sm:text-lg overflow-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 ${
              !cameraReady
                ? 'opacity-50 cursor-not-allowed bg-gray-400'
                : isActive
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/40'
                  : theme === 'dark'
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-300 text-zinc-950 shadow-lg shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-[#34C759] to-[#30D158] text-white shadow-lg shadow-emerald-400/40'
            }`}
          >
            {isActive ? (
              <div className="flex items-center justify-center gap-2">
                <Pause className="w-6 h-6" fill="currentColor" />
                一時停止
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Play className="w-6 h-6" fill="currentColor" />
                {count > 0 ? '再開' : '開始'}
              </div>
            )}
          </Button>

          <Button
            onClick={handleReset}
            className={`w-full rounded-full font-semibold transition-all py-3.5 sm:py-4 text-sm sm:text-base border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-zinc-900/80 to-zinc-900/60 border-zinc-800 text-white hover:from-zinc-800 hover:to-zinc-700'
                : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 text-gray-700 hover:from-gray-50 hover:to-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />
              <span>リセット</span>
            </div>
          </Button>

          <Button
            onClick={handleUndo}
            disabled={count === 0}
            className={`w-full py-4 rounded-2xl font-bold transition-all ${
              theme === 'dark'
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-50'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Undo2 className="w-5 h-5" />
              <span>やり直し</span>
            </div>
          </Button>

          {SUPABASE_ENABLED && userId && selectedExercise && !isActive && count > 0 && !sessionSavedRef.current && (
            <Button
              onClick={() => persistSession('manual')}
              disabled={historySaving}
              className={`w-full rounded-full font-semibold transition-all py-3 text-sm sm:text-base ${
                theme === 'dark'
                  ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {historySaving ? '保存中…' : 'このセッションを記録する'}
            </Button>
          )}

          {historyFeedback && (
            <p className={`text-xs text-center ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}>
              {historyFeedback}
            </p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6">
          <Card
            className={`p-4 rounded-xl border-2 transition-colors ${
              theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/50 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-[#00ff41]' : 'text-[#34C759]'}`} />
              <div className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                <p className="font-bold mb-1">正確にカウントするコツ</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>全身がカメラに映るように立ってください</li>
                  <li>明るい場所で行ってください</li>
                  <li>正しいフォームでゆっくり行ってください</li>
                  <li>バーピー・腕立て・レッグレイズは横向きで撮影してください</li>
                  <li>カメラは床と水平（横から）に設置してください</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
