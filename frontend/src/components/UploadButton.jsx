import React, { useRef } from 'react'

export default function UploadButton({ onFile, accept, label, style }) {
  const ref = useRef()
  return (
    <>
      <button style={style} onClick={() => ref.current?.click()}>{label}</button>
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }}
        onChange={e => { onFile?.(e.target.files[0]); e.target.value = '' }} />
    </>
  )
}
