import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-unze.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/api/, ''),
        configure: proxy => {
          proxy.on('proxyReq', request => request.removeHeader('origin'))
        },
      },
    },
  },
})
