import React, { useState } from 'react'
import { useVoice } from '../hooks/useVoice'
import { diagnoseText } from '../services/api'

export default function VoiceAssistantScreen({ category, skillLevel, messages, setMessages }) {
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const { listening, speaking, startBrowserSTT, stopSTT, speak, stopSpeaking } = useVoice()

  function toggleListening() {
    if (listening) { stopSTT(); return }
    startBrowserSTT(async (text) => {
      setTranscript(text)
      setLoading(true)
      const hist = messages.map(m => ({ role: m.role, content: m.message || '' }))
      try {
        const res = await diagnoseText({ message: text, category, skillLevel, conversationHistory: hist })
        setMessages(prev => [
          ...prev,
          { role: 'user', message: text, timestamp: new Date().toISOString() },
          { role: 'ai', ...res, timestamp: new Date().toISOString() },
        ])
        const toSpeak = res.warning ? `Warning: ${res.warning}` : res.message
        speak(toSpeak)
      } catch (e) { speak('Sorry, I encountered an error. Please try again.') }
      finally { setLoading(false) }
    })
  }

  const pulse = listening ? { animation: 'ripple 1.5s infinite' } : {}

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, gap:24, background:'#08090b' }}>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800 }}>🎙️ Voice Assistant</div>
      <div style={{ fontSize:13, color:'#94a3b8', textAlign:'center', maxWidth:300, lineHeight:1.65 }}>
        Tap the mic, describe your problem aloud. FixAI will analyze and speak back the diagnosis.
      </div>

      <div style={{ position:'relative', width:120, height:120 }}>
        {listening && (
          <div style={{ position:'absolute', inset:-16, borderRadius:'50%', border:'2px solid rgba(249,115,22,0.3)', animation:'ripple 1.5s infinite' }} />
        )}
        <button onClick={toggleListening}
          style={{ width:120, height:120, borderRadius:'50%', border:'none', cursor:'pointer', transition:'all .2s',
            background: listening?'#f97316':speaking?'#a78bfa':'#161a22',
            boxShadow: listening?'0 0 32px rgba(249,115,22,0.4)':speaking?'0 0 32px rgba(167,139,250,0.4)':'none',
            fontSize:42, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {loading ? '⏳' : listening ? '🔴' : speaking ? '🔊' : '🎤'}
        </button>
      </div>

      <div style={{ fontSize:12, color:'#475569', fontWeight:600, textTransform:'uppercase', letterSpacing:.8 }}>
        {loading ? 'Analyzing…' : listening ? 'Listening… (tap to stop)' : speaking ? 'Speaking…' : 'Tap to speak'}
      </div>

      {transcript && (
        <div style={{ background:'#0f1117', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'12px 16px', maxWidth:360, fontSize:13, color:'#94a3b8', textAlign:'center' }}>
          <span style={{ color:'#f97316', fontWeight:600 }}>You said: </span>{transcript}
        </div>
      )}

      {speaking && (
        <button onClick={stopSpeaking}
          style={{ padding:'8px 20px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'#0f1117', color:'#94a3b8', cursor:'pointer', fontSize:12 }}>
          ⏹ Stop Speaking
        </button>
      )}

      <div style={{ fontSize:11, color:'#475569', textAlign:'center', maxWidth:280 }}>
        Category: <strong style={{ color:'#f97316' }}>{category}</strong> · Level: <strong style={{ color:'#f97316' }}>{skillLevel}</strong>
      </div>

      <style>{`@keyframes ripple{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.4);opacity:0}}`}</style>
    </div>
  )
}
