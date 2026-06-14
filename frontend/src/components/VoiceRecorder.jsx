import React from 'react'

const S = {
  btn: (active) => ({
    width: 42, height: 42, border: 'none', borderRadius: 10, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
    background: active ? 'rgba(248,113,113,0.1)' : '#161a22',
    border: `1px solid ${active ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.1)'}`,
    color: active ? '#f87171' : '#94a3b8',
    animation: active ? 'pulse 1s infinite' : 'none',
    transition: 'all .15s',
  }),
}

export default function VoiceRecorder({ listening, onToggle, disabled }) {
  return (
    <button
      style={S.btn(listening)}
      onClick={onToggle}
      disabled={disabled}
      title={listening ? 'Stop listening' : 'Start voice input'}
    >
      {listening ? '⏹' : '🎤'}
    </button>
  )
}
