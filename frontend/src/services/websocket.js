/**
 * WebSocket client for real-time chat with FixAI backend.
 */
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/chat/ws'

export class FixAIWebSocket {
  constructor(sessionId, onMessage, onError, onClose) {
    this.sessionId = sessionId
    this.onMessage = onMessage
    this.onError = onError
    this.onClose = onClose
    this.ws = null
  }

  connect() {
    this.ws = new WebSocket(`${WS_BASE}/${this.sessionId}`)
    this.ws.onopen = () => console.log('[WS] Connected:', this.sessionId)
    this.ws.onmessage = (e) => {
      try { this.onMessage(JSON.parse(e.data)) } catch { this.onMessage(e.data) }
    }
    this.ws.onerror = (e) => this.onError?.(e)
    this.ws.onclose = () => this.onClose?.()
  }

  send(payload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload))
    }
  }

  disconnect() {
    this.ws?.close()
  }
}
