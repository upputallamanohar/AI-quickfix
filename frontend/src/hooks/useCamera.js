import { useState, useRef, useCallback } from 'react'

export function useCamera() {
  const [stream, setStream] = useState(null)
  const [capturing, setCapturing] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const startCamera = useCallback(async (facingMode = 'environment') => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
      setCapturing(true)
      return true
    } catch (e) {
      console.error('Camera error:', e)
      return false
    }
  }, [])

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setCapturing(false)
  }, [stream])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.9)
  }, [])

  const captureBlob = useCallback(async () => {
    const dataUrl = captureFrame()
    if (!dataUrl) return null
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return new File([blob], 'capture.jpg', { type: 'image/jpeg' })
  }, [captureFrame])

  return { stream, capturing, videoRef, canvasRef, startCamera, stopCamera, captureFrame, captureBlob }
}
