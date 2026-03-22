import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { BASE_URL } from '@/api/client'

const GOOGLE_AUTH_URL = BASE_URL.replace('/api', '') + '/api/auth/google'

export function GoogleAuthButton() {
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const popupRef = useRef<Window | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    const channel = new BroadcastChannel('google-auth')
    channelRef.current = channel

    channel.onmessage = (event) => {
      if (event.data?.type !== 'google-auth-success') return
      const { accessToken, usuario } = event.data
      setAuth(accessToken, usuario)
      setPending(false)
      channel.close()
      navigate('/', { replace: true })
    }

    return () => channel.close()
  }, [setAuth, navigate])

  function handleClick() {
    // Cerrar popup anterior si sigue abierto
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close()
    }

    setPending(true)

    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      GOOGLE_AUTH_URL,
      'google-auth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
    )

    popupRef.current = popup

    // Si el popup se cierra sin autenticar, resetear el estado
    const interval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(interval)
        setPending(false)
      }
    }, 500)
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 gap-3 font-medium border-border/60 hover:bg-muted/50 transition-all duration-200"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      Continuar con Google
    </Button>
  )
}
