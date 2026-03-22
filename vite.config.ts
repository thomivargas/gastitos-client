import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Gastitos',
        short_name: 'Gastitos',
        description: 'Finanzas personales',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#d4721a',
        background_color: '#ffffff',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      '@tanstack/react-query',
      'axios',
      'zustand',
      'sonner',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
    ],
  },
  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
    modulePreload: {
      resolveDependencies: (url, deps) => {
        const isEntry = url.includes('index-')
        if (!isEntry) return []
        return deps.filter((dep) =>
          dep.includes('vendor-react') ||
          dep.includes('vendor-ui') ||
          dep.includes('vendor-http'),
        )
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-'))
              return 'vendor-recharts'
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod/'))
              return 'vendor-forms'
            if (id.includes('@tanstack/react-query'))
              return 'vendor-query'
            if (id.includes('lucide-react'))
              return 'vendor-icons'
            if (id.includes('date-fns'))
              return 'vendor-date'
            if (id.includes('axios'))
              return 'vendor-http'
            if (id.includes('@base-ui') || id.includes('@floating-ui') || id.includes('@reduxjs') || id.includes('react-redux'))
              return 'vendor-baseui'
            if (id.includes('sonner') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge'))
              return 'vendor-ui'
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/'))
              return 'vendor-react'
          }
        },
      },
    },
  },
})
