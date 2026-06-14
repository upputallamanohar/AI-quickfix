import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // 1. Match your HTTP endpoints (/api/v1) cleanly
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // 2. Match your WebSocket endpoints (/ws/api/v1) cleanly
      '/ws': {
        target: 'http://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})