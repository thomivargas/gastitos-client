import { StrictMode } from 'react'
import './index.css'
// Inicializar stores con side-effects (conecta auth store al API client)
import '@/stores/auth.store'
import App from './App.tsx'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
