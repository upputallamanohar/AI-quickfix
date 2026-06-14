import React from 'react'

const NAV_ITEMS = [
  { id: 'home',  icon: '🏠', label: 'Home' },
  { id: 'upload', icon: '📁', label: 'Upload' },
  { id: 'chat',  icon: '💬', label: 'Chat' },
  { id: 'diagnostics', icon: '📋', label: 'Steps' },
  { id: 'voice', icon: '🎤', label: 'Voice' },
]

export default function AppNavigator({ activeScreen, onNavigate, hasResult }) {
  return (
    <nav style={{
      display:'flex', alignItems:'center', justifyContent:'space-around',
      padding:'10px 8px', borderTop:'1px solid rgba(255,255,255,0.06)',
      background:'#0f1117', flexShrink:0,
    }}>
      {NAV_ITEMS.map(item => {
        const active = activeScreen === item.id
        const dot = item.id === 'diagnostics' && hasResult
        return (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', padding:'4px 8px', position:'relative' }}>
            <span style={{ fontSize:20, opacity: active ? 1 : 0.4, transition:'all .15s' }}>{item.icon}</span>
            <span style={{ fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:.6, color: active?'#f97316':'#475569', transition:'color .15s' }}>{item.label}</span>
            {dot && <span style={{ position:'absolute', top:2, right:6, width:6, height:6, borderRadius:'50%', background:'#f97316' }} />}
          </button>
        )
      })}
    </nav>
  )
}
