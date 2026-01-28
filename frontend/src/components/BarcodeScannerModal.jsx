// バーコードスキャナー用モーダル
import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { CameraOff, X, Sparkles } from 'lucide-react'

export default function BarcodeScannerModal({ onClose, onDetected }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const controlsRef = useRef(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader
    let currentStream

    const cleanup = () => {
      if (controlsRef.current?.stop) {
        try {
          controlsRef.current.stop()
        } catch (stopErr) {
          console.warn('Scanner controls stop failed', stopErr)
        }
        controlsRef.current = null
      }
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop())
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }

    const startScanner = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('この端末ではカメラを利用できません。手入力モードを使用してください。')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        currentStream = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setReady(true)
        }
        try {
          const controls = await reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
            if (!result || cancelled) {
              return
            }
            cleanup()
            onDetected(result.getText())
          })
          if (cancelled) {
            controls?.stop?.()
          } else {
            controlsRef.current = controls
          }
        } catch (decodeErr) {
          console.error(decodeErr)
          setError('バーコードスキャナーの初期化に失敗しました。')
        }
      } catch (err) {
        console.error(err)
        setError('カメラにアクセスできません。ブラウザの権限設定を確認してください。')
      }
    }

    startScanner()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-300" />
          <p className="text-sm">バーコードを枠内に収めてください</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-10 border-2 border-dashed border-emerald-400 rounded-3xl pointer-events-none" />
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
              <p>カメラを初期化しています...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white px-6">
            <CameraOff size={48} className="text-red-300" />
            <p className="text-base font-semibold">{error}</p>
            <p className="text-sm opacity-80">カメラ権限を許可したあと、もう一度お試しください。</p>
          </div>
        )}
      </div>
    </div>
  )
}
