import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const http = axios.create({ baseURL: BASE_URL })

// ── Diagnostics ──────────────────────────────────────────────────────────────
export async function diagnoseImage({ imageFile, category, skillLevel, description, isVideoFrame, conversationHistory, sessionId }) {
  const fd = new FormData()
  fd.append('image', imageFile)
  fd.append('category', category)
  fd.append('skill_level', skillLevel)
  fd.append('description', description || '')
  fd.append('is_video_frame', isVideoFrame ? 'true' : 'false')
  fd.append('conversation_history', JSON.stringify(conversationHistory || []))
  if (sessionId) fd.append('session_id', sessionId)
  const { data } = await http.post('/diagnostics/image', fd)
  return data
}

export async function diagnoseText({ message, category, skillLevel, conversationHistory }) {
  const { data } = await http.post('/diagnostics/text', {
    message, category, skill_level: skillLevel,
    conversation_history: conversationHistory || [],
  })
  return data
}

export async function getHistory(limit = 30) {
  const { data } = await http.get('/diagnostics/history', { params: { limit } })
  return data
}

export async function deleteHistoryItem(id) {
  const { data } = await http.delete(`/diagnostics/history/${id}`)
  return data
}

export async function getCategories() {
  const { data } = await http.get('/diagnostics/categories')
  return data
}

// ── Chat ─────────────────────────────────────────────────────────────────────
export async function sendChatMessage({ sessionId, message, category, skillLevel, conversationHistory }) {
  const { data } = await http.post('/chat/message', {
    session_id: sessionId,
    message,
    category,
    skill_level: skillLevel,
    conversation_history: conversationHistory || [],
  })
  return data
}

export async function getSessionHistory(sessionId) {
  const { data } = await http.get(`/chat/session/${sessionId}/history`)
  return data
}

// ── Voice ─────────────────────────────────────────────────────────────────────
export async function transcribeAudio(audioBlob, language = 'en') {
  const fd = new FormData()
  fd.append('audio', audioBlob, 'recording.wav')
  fd.append('language', language)
  const { data } = await http.post('/voice/transcribe', fd)
  return data
}

export async function synthesizeSpeech(text, lang = 'en') {
  const fd = new FormData()
  fd.append('text', text)
  fd.append('lang', lang)
  const response = await http.post('/voice/synthesize', fd, { responseType: 'blob' })
  return URL.createObjectURL(response.data)
}
