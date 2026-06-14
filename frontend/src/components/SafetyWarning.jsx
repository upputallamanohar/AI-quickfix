import React from 'react'

const styles = {
  box: {
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
    borderRadius: 10,
    padding: '12px 16px',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: 10,
  },
  icon: { fontSize: 18, flexShrink: 0, marginTop: 1 },
  body: { flex: 1 },
  title: { fontWeight: 700, color: '#f87171', fontSize: 13, marginBottom: 4 },
  text: { color: '#fca5a5', fontSize: 13, lineHeight: 1.6 },
}

export default function SafetyWarning({ warning }) {
  if (!warning) return null
  return (
    <div style={styles.box}>
      <span style={styles.icon}>⚠️</span>
      <div style={styles.body}>
        <div style={styles.title}>Safety Warning</div>
        <div style={styles.text}>{warning}</div>
      </div>
    </div>
  )
}
