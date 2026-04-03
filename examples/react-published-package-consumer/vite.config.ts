import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')
  const base = environment.VITE_BASE_PATH?.trim() || '/'

  return {
    base,
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 4175,
    },
    preview: {
      host: '127.0.0.1',
      port: 4175,
    },
  }
})
