import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      resizeOptions: { background: '#ffffff', fit: 'contain' },
      padding: 0.3,
    },
    apple: {
      sizes: [180],
      resizeOptions: { background: '#ffffff', fit: 'contain' },
      padding: 0.1,
    },
  },
  images: ['public/logo.png'],
})
