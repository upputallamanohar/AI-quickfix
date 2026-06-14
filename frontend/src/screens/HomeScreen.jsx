import React from 'react'
const CATEGORIES = [
  { id: 'Automobile', icon: '🚗', label: 'Automobile', desc: 'Cars, trucks, vans' },
  { id: 'Motorcycle', icon: '🏍️', label: 'Motorcycle', desc: 'Bikes, scooters' },
  { id: 'Electronics', icon: '📱', label: 'Electronics', desc: 'Phones, TVs, PCBs' },
  { id: 'Home Appliance', icon: '🏠', label: 'Home Appliance', desc: 'Washers, HVAC, ovens' },
  { id: 'Plumbing', icon: '🚰', label: 'Plumbing', desc: 'Pipes, taps, drains' },
  { id: 'Networking Device', icon: '📡', label: 'Networking', desc: 'Routers, switches' },
  { id: 'Industrial Machinery', icon: '⚙️', label: 'Industrial', desc: 'Motors, compressors' },
  { id: 'Computer / Hardware', icon: '💻', label: 'Computer', desc: 'PCs, laptops, GPUs' },
]

export default function HomeScreen({ onStart }) {
  const [selected, setSelected] = React.useState('Automobile')
  return (
    <div style={{ flex:1, overflow:'auto', padding:'40px 32px', background:'#08090b' }}>
      <div style={{ textAlign:'center', marginBottom:48 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:52, height:52, background:'#3b82f6', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🔧</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:32, fontWeight:800, letterSpacing:-1, color:'#f1f5f9' }}>AI Quick<span style={{ color:'#3b82f6' }}> Fix</span></div>
        </div>
        <p style={{ fontSize:16, color:'#cbd5e1', maxWidth:480, margin:'0 auto', lineHeight:1.6 }}>
          Upload a photo or video of any broken device. Get AI-powered visual diagnosis + step-by-step repair guidance instantly.
        </p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:14, maxWidth:900, margin:'0 auto' }}>
        {CATEGORIES.map(c => (
          <div key={c.id} onClick={() => setSelected(c.id)}
            style={{ background: selected===c.id ? 'rgba(59,130,246,0.08)' : '#0f1117',
              border: `1px solid ${selected===c.id ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius:14, padding:'22px 18px', cursor:'pointer', textAlign:'center', transition:'all .18s' }}>
            <div style={{ fontSize:32, marginBottom:10 }}>{c.icon}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, marginBottom:4, color:'#f1f5f9' }}>{c.label}</div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>{c.desc}</div>
          </div>
        ))}
      </div>
      <button onClick={() => onStart(selected)}
        style={{ display:'block', margin:'40px auto 0', padding:'14px 48px', borderRadius:12, border:'none',
          background:'#3b82f6', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:800, cursor:'pointer', letterSpacing:.3 }}>
        🔍 Start Diagnosis →
      </button>
    </div>
  )
}
