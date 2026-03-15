import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
      // No precargar chunks pesados que no se usan en la primera pagina
      resolveDependencies: (url, deps) => {
        // Solo precargar lo esencial para el primer render
        // Los chunks lazy se cargan bajo demanda cuando se necesitan
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
            // Orden importa: checks mas especificos primero
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
