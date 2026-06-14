import { useState, useRef, useCallback } from 'react'
import { transcribeAudio, synthesizeSpeech } from '../services/api'

export function useVoice() {
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)

  // ── Browser Speech Recognition (no server) ────────────────────────────────
  const startBrowserSTT = useCallback((onResult) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return false
    const r = new SR()
    r.lang = 'en-US'; r.continuous = false; r.interimResults = false
    r.onresult = (e) => { onResult(e.results[0][0].transcript); setListening(false) }
    r.onerror = r.onend = () => setListening(false)
    r.start()
    recognitionRef.current = r
    setListening(true)
    return true
  }, [])

  const stopSTT = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  // ── Whisper server STT (via MediaRecorder) ────────────────────────────────
  const startWhisperSTT = useCallback((onResult) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream)
      const chunks = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunks, { type: 'audio/wav' })
        try {
          const { transcript } = await transcribeAudio(blob)
          onResult(transcript)
        } catch (e) { console.error('Whisper STT error:', e) }
        setListening(false)
      }
      recorder.start()
      setListening(true)
      recognitionRef.current = recorder
    })
  }, [])

  const stopWhisper = useCallback(() => {
    recognitionRef.current?.stop?.()
    setListening(false)
  }, [])

  // ── TTS (browser or server) ───────────────────────────────────────────────
  const speak = useCallback(async (text, useServer = false) => {
    if (useServer) {
      try {
        const url = await synthesizeSpeech(text)
        const audio = new Audio(url)
        audioRef.current = audio
        setSpeaking(true)
        audio.onended = () => setSpeaking(false)
        audio.play()
      } catch { console.error('Server TTS failed') }
    } else {
      if (!window.speechSynthesis) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text.substring(0, 300))
      u.rate = 0.9; u.pitch = 1.0
      u.onend = () => setSpeaking(false)
      setSpeaking(true)
      window.speechSynthesis.speak(u)
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel()
    audioRef.current?.pause()
    setSpeaking(false)
  }, [])

  return { listening, speaking, startBrowserSTT, startWhisperSTT, stopSTT, stopWhisper, speak, stopSpeaking }
}
