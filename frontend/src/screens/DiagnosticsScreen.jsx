import React, { useEffect, useState } from 'react'
import SafetyWarning from '../components/SafetyWarning'
import { getHistory, deleteHistoryItem } from '../services/api'

const sevColor = s => s==='High'?'#f87171':s==='Medium'?'#fbbf24':'#34d399'

function StepsView({ steps, tools, warning }) {
  if (!steps?.length && !warning) return <div style={{ fontSize:13, color:'#475569', padding:16, textAlign:'center' }}>No steps recorded yet.</div>
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <SafetyWarning warning={warning} />
      {steps?.map((s, i) => (
        <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', background:'#0f1117', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'12px 14px' }}>
          <div style={{ width:26, height:26, borderRadius:7, background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', color:'#f97316', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
          <div style={{ fontSize:13, lineHeight:1.65, marginTop:2, color:'#f1f5f9' }}>{s}</div>
        </div>
      ))}
      {tools?.length > 0 && (
        <div>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:.7, color:'#475569', fontWeight:600, marginBottom:8 }}>🛠️ Tools & Parts</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {tools.map((t, i) => <span key={i} style={{ background:'#1c2130', border:'1px solid rgba(255,255,255,0.1)', borderRadius:5, padding:'3px 9px', fontSize:11, color:'#94a3b8' }}>{t}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}

function HistoryPanel({ history, onDelete }) {
  if (!history.length) return <div style={{ fontSize:13, color:'#475569', padding:20, textAlign:'center' }}>No history yet.</div>
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {history.map(h => (
        <div key={h.id} style={{ background:'#0f1117', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'flex-start', gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ fontWeight:600, fontSize:13 }}>{h.issue || 'Unknown issue'}</span>
              {h.severity && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'rgba(0,0,0,.3)', color: sevColor(h.severity), fontWeight:600 }}>{h.severity}</span>}
            </div>
            <div style={{ fontSize:11, color:'#475569' }}>{h.category} · {h.created_at ? new Date(h.created_at).toLocaleString() : ''}</div>
          </div>
          <button onClick={() => onDelete(h.id)} style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', fontSize:13 }}>🗑️</button>
        </div>
      ))}
    </div>
  )
}

export default function DiagnosticsScreen({ latestResult }) {
  const [tab, setTab] = useState('steps')
  const [history, setHistory] = useState([])
  const [loadingHist, setLoadingHist] = useState(false)

  useEffect(() => { if (tab === 'history') loadHistory() }, [tab])

  async function loadHistory() {
    setLoadingHist(true)
    try { const d = await getHistory(); setHistory(d.history || []) } catch {}
    setLoadingHist(false)
  }

  async function handleDelete(id) {
    try { await deleteHistoryItem(id); setHistory(h => h.filter(x => x.id !== id)) } catch {}
  }

  const tabStyle = (active) => ({
    padding:'7px 16px', borderRadius:7, fontWeight:500, fontSize:12, cursor:'pointer', border:'none',
    background: active?'rgba(249,115,22,0.08)':'none',
    color: active?'#f97316':'#475569',
    borderBottom: active?'1px solid rgba(249,115,22,0.2)':'1px solid transparent',
  })

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {latestResult?.diagnosis && (
        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'#0f1117' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, marginBottom:8 }}>📋 Latest Diagnosis</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {[['Issue', latestResult.diagnosis.issue],['Component', latestResult.diagnosis.component],['Severity', latestResult.diagnosis.severity, sevColor(latestResult.diagnosis.severity)]].map(([k,v,c]) => v && (
              <div key={k} style={{ background:'#161a22', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'6px 12px' }}>
                <div style={{ fontSize:10, color:'#475569', marginBottom:2, textTransform:'uppercase', letterSpacing:.6 }}>{k}</div>
                <div style={{ fontSize:12, fontWeight:600, color: c||'#f1f5f9' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:2, padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <button style={tabStyle(tab==='steps')} onClick={() => setTab('steps')}>📋 Repair Steps</button>
        <button style={tabStyle(tab==='history')} onClick={() => setTab('history')}>🕓 History</button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:20 }}>
        {tab === 'steps' && <StepsView steps={latestResult?.steps} tools={latestResult?.tools} warning={latestResult?.warning} />}
        {tab === 'history' && (loadingHist ? <div style={{ color:'#475569', textAlign:'center', padding:20 }}>Loading…</div> : <HistoryPanel history={history} onDelete={handleDelete} />)}
      </div>
    </div>
  )
}