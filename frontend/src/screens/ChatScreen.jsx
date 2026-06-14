import React, { useState, useRef, useEffect } from 'react'
import ChatBubble from '../components/ChatBubble'
import VoiceRecorder from '../components/VoiceRecorder'
import { diagnoseText } from '../services/api'
import { useVoice } from '../hooks/useVoice'

export default function ChatScreen({ messages, setMessages, category, skillLevel, loading, setLoading }) {
  const [input, setInput] = useState('')
  const msgsRef = useRef()
  const { listening, speaking, startBrowserSTT, stopSTT, speak } = useVoice()

  useEffect(() => { msgsRef.current?.scrollTo(0, msgsRef.current.scrollHeight) }, [messages])

  async function sendMessage(text) {
    const txt = (text || input).trim()
    if (!txt || loading) return
    setInput('')
    const userMsg = { role: 'user', message: txt, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const hist = messages.map(m => ({ role: m.role, content: m.message || '' }))
      const res = await diagnoseText({ message: txt, category, skillLevel, conversationHistory: hist })
      const aiMsg = { role: 'ai', ...res, timestamp: new Date().toISOString() }
      setMessages(prev => [...prev, aiMsg])
      if (res.warning) speak(res.warning)
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', message: `Error: ${e.message}`, timestamp: new Date().toISOString() }])
    } finally { setLoading(false) }
  }

  function handleVoice() {
    if (listening) { stopSTT(); return }
    startBrowserSTT(transcript => { setInput(transcript); setTimeout(() => sendMessage(transcript), 100) })
  }

  const isEmpty = messages.length === 0

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div ref={msgsRef} style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:18 }}>
        {isEmpty && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:40, gap:12 }}>
            <div style={{ fontSize:44, opacity:.2 }}>💬</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, opacity:.25 }}>Conversational Repair Assistant</div>
            <div style={{ fontSize:13, color:'#475569', maxWidth:280, lineHeight:1.65 }}>
              Upload an image first to start a diagnosis, or ask me anything about {category} repairs.
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7, justifyContent:'center', marginTop:8 }}>
              {['What tools do I need?', 'Is this dangerous?', 'Explain this in simple terms'].map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  style={{ background:'#0f1117', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 12px', fontSize:12, color:'#94a3b8', cursor:'pointer' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} {...m} onFollowup={sendMessage} />
        ))}
        {loading && (
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🔧</div>
            <div style={{ background:'#0f1117', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'4px 14px 14px 14px', padding:'12px 15px' }}>
              <div style={{ display:'flex', gap:4 }}>
                {[0,1,2].map(i => <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#475569', display:'inline-block', animation:`dot 1.2s ${i*.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:'14px 20px 18px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:8, alignItems:'flex-end', background:'#0f1117' }}>
        <VoiceRecorder listening={listening} onToggle={handleVoice} disabled={loading} />
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder="Ask a follow-up question…" rows={1}
          style={{ flex:1, background:'#161a22', border:'1px solid rgba(255,255,255,0.1)', borderRadius:11, color:'#f1f5f9', fontSize:13, padding:'10px 13px', outline:'none', resize:'none', minHeight:42, maxHeight:110, lineHeight:1.5 }} />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          style={{ width:42, height:42, background: input.trim()&&!loading?'#f97316':'#161a22', border:'none', borderRadius:10, color:'#fff', cursor: input.trim()&&!loading?'pointer':'not-allowed', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', flexShrink:0 }}>
          ➤
        </button>
      </div>
      <style>{`@keyframes dot{0%,80%,100%{opacity:.15}40%{opacity:1}}`}</style>
    </div>
  )
}
