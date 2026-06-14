import React, { useState, useRef } from 'react'
import CameraComponent from '../components/CameraComponent'
import UploadButton from '../components/UploadButton'

export default function UploadScreen({ category, skillLevel, setSkillLevel, description, setDescription, onAnalyze, loading }) {
  const [mode, setMode] = useState('image')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [frames, setFrames] = useState([])
  const [selFrame, setSelFrame] = useState(-1)
  const [extracting, setExtracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showCamera, setShowCamera] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  function handleFile(f) {
    if (!f) return
    setFile(f); setFrames([]); setSelFrame(-1)
    if (mode === 'image') {
      const r = new FileReader(); r.onload = e => setPreview(e.target.result); r.readAsDataURL(f)
      setVideoUrl(null)
    } else {
      setVideoUrl(URL.createObjectURL(f)); setPreview(null)
    }
  }

  function clearMedia() { setFile(null); setPreview(null); setVideoUrl(null); setFrames([]); setSelFrame(-1) }

  async function extractFrames() {
    if (!file) return
    setExtracting(true); setFrames([]); setSelFrame(-1); setProgress(0)
    const video = document.createElement('video'); video.muted = true
    video.src = URL.createObjectURL(file)
    await new Promise(r => { video.onloadedmetadata = r })
    const dur = video.duration
    const count = Math.min(6, Math.max(3, Math.floor(dur)))
    const times = Array.from({ length: count }, (_, i) => (dur / (count + 1)) * (i + 1))
    const canvas = document.createElement('canvas'); canvas.width = 480; canvas.height = 300
    const ctx = canvas.getContext('2d')
    const extracted = []
    for (let i = 0; i < times.length; i++) {
      setProgress(Math.round(((i + 1) / times.length) * 100))
      await new Promise(r => { video.currentTime = times[i]; video.onseeked = r })
      ctx.drawImage(video, 0, 0, 480, 300)
      extracted.push({ dataUrl: canvas.toDataURL('image/jpeg', 0.85), time: times[i].toFixed(1) })
    }
    URL.revokeObjectURL(video.src)
    setFrames(extracted); setSelFrame(0); setExtracting(false)
  }

  async function handleAnalyze() {
    let imageFile = file; let isVideoFrame = false
    if (mode === 'video' && selFrame >= 0) {
      const res = await fetch(frames[selFrame].dataUrl)
      const blob = await res.blob()
      imageFile = new File([blob], 'frame.jpg', { type: 'image/jpeg' })
      isVideoFrame = true
    }
    onAnalyze({ imageFile, category, skillLevel, description, isVideoFrame })
  }

  const canAnalyze = mode === 'image' ? !!file : selFrame >= 0

  const sw = { background:'#0f1117', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:20, display:'flex', flexDirection:'column', gap:14 }
  const btn = (active, col='blue') => ({
    flex:1, padding:'8px 10px', borderRadius:8, border:`1px solid ${active?(col==='blue'?'rgba(59,130,246,0.3)':'rgba(167,139,250,0.25)'):'transparent'}`,
    background: active?(col==='blue'?'rgba(59,130,246,0.1)':'rgba(167,139,250,0.08)'):'none',
    color: active?(col==='blue'?'#60a5fa':'#a78bfa'):'#94a3b8',
    fontWeight:600, fontSize:12, cursor:'pointer', transition:'all .15s',
  })

  return (
    <div style={{ flex:1, overflow:'auto', padding:20, display:'flex', flexDirection:'column', gap:14 }}>
      <div style={sw}>
        <div style={{ display:'flex', gap:4, background:'#1c2130', borderRadius:9, padding:4 }}>
          <button style={btn(mode==='image')} onClick={() => { setMode('image'); clearMedia() }}>📷 Image</button>
          <button style={btn(mode==='video','purple')} onClick={() => { setMode('video'); clearMedia() }}>📹 Video</button>
          <button style={btn(false)} onClick={() => setShowCamera(!showCamera)}>📸 Camera</button>
        </div>

        {showCamera && <CameraComponent onCapture={f => { setMode('image'); handleFile(f); setShowCamera(false) }} onClose={() => setShowCamera(false)} />}

        {!preview && !videoUrl && !showCamera && (
          <div onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current?.click()}
            style={{ border:`1.5px dashed ${dragOver?'#3b82f6':'rgba(255,255,255,0.12)'}`, borderRadius:12, padding:'28px 20px', textAlign:'center', cursor:'pointer', background: dragOver?'rgba(59,130,246,0.06)':'transparent', transition:'all .2s' }}>
            <input ref={fileRef} type="file" accept={mode==='image'?'image/*':'video/*'} style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ fontSize:28, marginBottom:8 }}>{mode==='image'?'📁':'🎬'}</div>
            <div style={{ fontWeight:600, marginBottom:4, color:'#f1f5f9' }}>Drop {mode} here</div>
            <div style={{ fontSize:12, color:'#94a3b8' }}>or click to browse</div>
          </div>
        )}

        {preview && (
          <div style={{ position:'relative', borderRadius:10, overflow:'hidden' }}>
            <img src={preview} style={{ width:'100%', display:'block', maxHeight:180, objectFit:'cover' }} alt="preview" />
            <button onClick={clearMedia} style={{ position:'absolute', top:6, right:6, width:22, height:22, borderRadius:'50%', border:'none', background:'rgba(0,0,0,0.65)', color:'#fff', cursor:'pointer', fontSize:11 }}>✕</button>
          </div>
        )}

        {videoUrl && (
          <div style={{ position:'relative', borderRadius:10, overflow:'hidden', background:'#000' }}>
            <video src={videoUrl} controls muted style={{ width:'100%', maxHeight:160 }} />
            <button onClick={clearMedia} style={{ position:'absolute', top:6, right:6, width:22, height:22, borderRadius:'50%', border:'none', background:'rgba(0,0,0,0.65)', color:'#fff', cursor:'pointer', fontSize:11 }}>✕</button>
          </div>
        )}

        {videoUrl && (
          <div style={{ background:'#08090b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:11, textTransform:'uppercase', letterSpacing:.8, color:'#94a3b8', fontWeight:600 }}>🎞️ Key Frames</span>
              <button onClick={extractFrames} disabled={extracting}
                style={{ padding:'4px 10px', borderRadius:6, border:'1px solid rgba(167,139,250,0.25)', background:'rgba(167,139,250,0.08)', color:'#a78bfa', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                {extracting ? `${progress}%` : frames.length ? 'Re-extract' : 'Extract'}
              </button>
            </div>
            {extracting && <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:3 }}><div style={{ height:3, borderRadius:3, background:'#a78bfa', width:`${progress}%` }} /></div>}
            {frames.length > 0 && (
              <div style={{ display:'flex', gap:4, overflowX:'auto', marginTop:8 }}>
                {frames.map((fr, i) => (
                  <img key={i} src={fr.dataUrl} onClick={() => setSelFrame(i)} alt=""
                    style={{ width:56, height:38, objectFit:'cover', borderRadius:5, flexShrink:0, cursor:'pointer', border:`2px solid ${selFrame===i?'#3b82f6':'transparent'}`, opacity: selFrame===i?1:.55 }} />
                ))}
              </div>
            )}
            {frames.length > 0 && <div style={{ fontSize:10, color:'#94a3b8', marginTop:6 }}>{selFrame>=0?`Frame at ${frames[selFrame].time}s selected`:'Click a frame to select'}</div>}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:.7, color:'#94a3b8', fontWeight:600 }}>Issue Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What are you seeing or hearing?"
            style={{ background:'#08090b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#f1f5f9', fontSize:13, padding:'8px 10px', outline:'none', resize:'vertical' }} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          <label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:.7, color:'#94a3b8', fontWeight:600 }}>Skill Level</label>
          <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)}
            style={{ background:'#08090b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#f1f5f9', fontSize:13, padding:'8px 10px', outline:'none' }}>
            <option value="beginner">🟢 Beginner</option>
            <option value="intermediate">🟡 Intermediate</option>
            <option value="advanced">🔴 Advanced</option>
          </select>
        </div>

        <button onClick={handleAnalyze} disabled={!canAnalyze || loading}
          style={{ padding:13, borderRadius:10, border:'none', background: canAnalyze&&!loading?'#3b82f6':'#1c2130', color: canAnalyze&&!loading?'#fff':'#64748b', fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, cursor: canAnalyze&&!loading?'pointer':'not-allowed', transition:'all .2s' }}>
          {loading ? '⏳ Analyzing…' : '🔍 Analyze & Diagnose'}
        </button>
      </div>
    </div>
  )
}