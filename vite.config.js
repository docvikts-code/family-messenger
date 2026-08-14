import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Базовий шлях для GitHub Pages: репозиторій публікується за адресою
// https://<username>.github.io/<repo-name>/ — тому base має відповідати назві репозиторію.
// Якщо деплоїте на Netlify/Vercel або власний домен, поставте base: '/'.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Родинний чат',
        short_name: 'Родина',
        description: 'Приватний месенджер для родини — повідомлення, фото, відео.',
        theme_color: '#1b1f3b',
        background_color: '#1b1f3b',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
