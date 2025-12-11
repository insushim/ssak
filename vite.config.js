import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // 🚀 서비스 워커 즉시 활성화 + 항상 최신 버전
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // 🚀 JS/CSS는 캐시하지 않음 (항상 최신 버전 로드)
        globPatterns: ['**/*.{html,ico,png,svg}'],
        runtimeCaching: [
          {
            // 🚀 JS/CSS는 NetworkFirst - 항상 네트워크 먼저 시도
            urlPattern: /\.(?:js|css)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-assets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1시간만 캐시
              },
              networkTimeoutSeconds: 3
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: '싹',
        short_name: '싹',
        description: 'AI 글쓰기 학습 플랫폼',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><defs><linearGradient id="bg" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:%2310b981"/><stop offset="100%25" style="stop-color:%2306b6d4"/></linearGradient></defs><rect width="192" height="192" fill="url(%23bg)" rx="32"/><g transform="translate(96,96)"><path d="M 0,-40 Q -8,-35 -10,-25 Q -12,-15 -8,-5 Q -4,5 0,10 L 0,-40 Z" fill="%2334d399" stroke="%23059669" stroke-width="2"/><path d="M 0,-40 Q 8,-35 10,-25 Q 12,-15 8,-5 Q 4,5 0,10 L 0,-40 Z" fill="%2334d399" stroke="%23059669" stroke-width="2"/><circle cx="0" cy="12" r="8" fill="%236366f1"/><circle cx="0" cy="12" r="4" fill="%23818cf8"/><text x="0" y="48" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">싹</text></g></svg>',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="bg2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:%2310b981"/><stop offset="100%25" style="stop-color:%2306b6d4"/></linearGradient></defs><rect width="512" height="512" fill="url(%23bg2)" rx="80"/><g transform="translate(256,256)"><path d="M 0,-120 Q -25,-100 -30,-70 Q -35,-40 -25,-10 Q -15,20 0,35 L 0,-120 Z" fill="%2334d399" stroke="%23059669" stroke-width="6"/><path d="M 0,-120 Q 25,-100 30,-70 Q 35,-40 25,-10 Q 15,20 0,35 L 0,-120 Z" fill="%2334d399" stroke="%23059669" stroke-width="6"/><circle cx="0" cy="40" r="24" fill="%236366f1"/><circle cx="0" cy="40" r="12" fill="%23818cf8"/><text x="0" y="140" font-family="Arial,sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle">싹</text></g></svg>',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    assetsInlineLimit: 0,
    cssCodeSplit: true
  }
})
