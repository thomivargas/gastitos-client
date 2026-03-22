import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'

export default function GoogleExitoPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const u = params.get('u')

    if (token && u) {
      try {
        const usuario = JSON.parse(atob(decodeURIComponent(u)))

        const channel = new BroadcastChannel('google-auth')
        channel.postMessage({ type: 'google-auth-success', accessToken: token, usuario })
        channel.close()

        window.close()
        // Fallback si window.close() no funciona (pestaña no abierta via window.open)
        setTimeout(() => { window.location.href = '/' }, 500)
      } catch {
        window.location.href = '/login'
      }
    } else {
      window.location.href = '/login'
    }
  }, [])

  return <Spinner fullScreen />
}
