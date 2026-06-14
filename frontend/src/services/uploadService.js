/**
 * Upload service — handles direct file uploads to the backend.
 */
import axios from 'axios'
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export async function uploadImageFile(file, onProgress) {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await axios.post(`${BASE_URL}/upload/image`, fd, {
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
  })
  return data
}

export async function uploadVideoFile(file, onProgress) {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await axios.post(`${BASE_URL}/upload/video`, fd, {
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
  })
  return data
}
