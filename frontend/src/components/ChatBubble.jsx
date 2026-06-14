import React from 'react'
import SafetyWarning from './SafetyWarning'

const S = {
  row: (isUser) => ({
    display: 'flex', gap: 10,
    flexDirection: isUser ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
  }),
  avatar: (isUser) => ({
    width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 2,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
    background: isUser ? 'rgba(96,165,250,0.08)' : 'rgba(59,130,246,0.08)',
    border: `1px solid ${isUser ? 'rgba(96,165,250,0.2)' : 'rgba(59,130,246,0.2)'}`,
  }),
  body: (isUser) => ({
    maxWidth: '76%', display: 'flex', flexDirection: 'column',
    gap: 4, alignItems: isUser ? 'flex-end' : 'flex-start',
  }),
  meta: { fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' },
  bubble: (isUser) => ({
    background: isUser ? '#161a22' : '#0f1117',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
    padding: '12px 15px', fontSize: 13.5, lineHeight: 1.7, color: '#f1f5f9',
  }),
  videoBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)',
    color: '#a78bfa', borderRadius: 5, padding: '2px 8px',
    fontSize: 10, fontWeight: 600, marginBottom: 6,
  },
  diagCard: {
    background: '#161a22', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '10px 14px', marginTop: 10,
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  diagRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 },
  confBar: { height: 4, background: '#1c2130', borderRadius: 4, marginTop: 2 },
  confFill: (pct) => ({ height: 4, borderRadius: 4, background: '#3b82f6', width: `${pct}%`, transition: 'width .7s' }),
  steps: { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 },
  stepRow: { display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13 },
  stepNum: {
    width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 2,
    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
    color: '#3b82f6', fontSize: 10, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  toolsRow: { display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  tool: {
    background: '#1c2130', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 5, padding: '3px 9px', fontSize: 11, color: '#94a3b8',
  },
  fqBtns: { display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 },
  fqBtn: {
    background: '#161a22', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 7, padding: '7px 11px', fontSize: 12, color: '#f1f5f9',
    textAlign: 'left', cursor: 'pointer', transition: 'all .15s',
  },
}

const sevColor = (s) => s === 'High' ? '#f87171' : s === 'Medium' ? '#fbbf24' : '#34d399'

export default function ChatBubble({ role, message, diagnosis, warning, steps, tools, followups, isVideoFrame, timestamp, onFollowup }) {
  const isUser = role === 'user'
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div style={S.row(isUser)}>
      <div style={S.avatar(isUser)}>{isUser ? '👤' : '🔧'}</div>
      <div style={S.body(isUser)}>
        <div style={S.meta}>{isUser ? 'You' : 'FixAI'}{time ? ` · ${time}` : ''}</div>
        <div style={S.bubble(isUser)}>
          {isVideoFrame && <div style={S.videoBadge}>📹 Video frame analysis</div>}
          <div style={{ whiteSpace: 'pre-wrap' }}>{message}</div>

          {diagnosis && (
            <div style={S.diagCard}>
              <div style={S.diagRow}><span style={{ color: '#94a3b8' }}>Issue</span><strong style={{ fontSize: 12 }}>{diagnosis.issue}</strong></div>
              <div style={S.diagRow}><span style={{ color: '#94a3b8' }}>Component</span><strong style={{ fontSize: 12 }}>{diagnosis.component}</strong></div>
              <div style={S.diagRow}><span style={{ color: '#94a3b8' }}>Severity</span>
                <strong style={{ fontSize: 12, color: sevColor(diagnosis.severity) }}>{diagnosis.severity}</strong>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>
                  <span>Confidence</span><span>{diagnosis.confidence}%</span>
                </div>
                <div style={S.confBar}><div style={S.confFill(diagnosis.confidence)} /></div>
              </div>
            </div>
          )}

          <SafetyWarning warning={warning} />

          {steps?.length > 0 && (
            <div style={S.steps}>
              {steps.map((s, i) => (
                <div key={i} style={S.stepRow}>
                  <div style={S.stepNum}>{i + 1}</div>
                  <div>{s}</div>
                </div>
              ))}
            </div>
          )}

          {tools?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.7px', color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>🛠️ Tools & Parts</div>
              <div style={S.toolsRow}>{tools.map((t, i) => <span key={i} style={S.tool}>{t}</span>)}</div>
            </div>
          )}

          {followups?.length > 0 && !isUser && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.7px', color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>💬 Follow-ups</div>
              <div style={S.fqBtns}>
                {followups.map((q, i) => (
                  <button key={i} style={S.fqBtn}
                    onMouseEnter={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.color = '#3b82f6' }}
                    onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.color = '#f1f5f9' }}
                    onClick={() => onFollowup?.(q)}>{q}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}