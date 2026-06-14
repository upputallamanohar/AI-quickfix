import React, { useEffect } from 'react'
import { useCamera } from '../hooks/useCamera'

const S = {
  wrap: { position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000' },
  video: { width: '100%', display: 'block', maxHeight: 200, objectFit: 'cover' },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    display: 'flex', justifyContent: 'center', padding: 10, gap: 8,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
  },
  btn: (color) => ({
    padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: color, color: '#fff', fontWeight: 600, fontSize: 12,
  }),
}

export default function CameraComponent({ onCapture, onClose }) {
  const { capturing, videoRef, canvasRef, startCamera, stopCamera, captureBlob } = useCamera()

  useEffect(() => { startCamera(); return () => stopCamera() }, [])

  async function handleCapture() {
    const file = await captureBlob()
    if (file) { onCapture(file); stopCamera(); onClose?.() }
  }

  return (
    <div style={S.wrap}>
      <video ref={videoRef} autoPlay playsInline muted style={S.video} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={S.overlay}>
        <button style={S.btn('#f97316')} onClick={handleCapture}>📸 Capture</button>
        <button style={S.btn('#475569')} onClick={() => { stopCamera(); onClose?.() }}>✕ Close</button>
      </div>
    </div>
  )
}
