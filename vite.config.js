import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/bank-advice/',
  server: {
    port: 3000
  }
})
