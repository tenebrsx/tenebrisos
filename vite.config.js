import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '#shared': '/shared',
      '#components': '/shared/components',
      '#pages': '/shared/pages',
      '#utils': '/shared/utils',
      '#contexts': '/shared/contexts',
      '#hooks': '/shared/hooks',
      '#firebase': '/shared/firebase',
      '#services': '/shared/services'
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
  server: {
    port: 3000,
    open: true
  }
})
