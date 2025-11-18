import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Torimo',
        short_name: 'Torimo',
        description: 'Fitness & Diet Tracker',
        theme_color: '#ffffff',
        background_color: '#f8faf9',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' }
        ]
      }
    })
  ],
  server: {
    host: true, // expose on LAN
    port: 5173,
    strictPort: false, // auto-pick 5174 if busy
  }
})
