import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

export default function MpCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const status = params.get('status')
    if (status === 'ok') {
      toast.success('Mercado Pago conectado correctamente')
    } else {
      toast.error('No se pudo conectar Mercado Pago. Intentá de nuevo.')
    }
    navigate('/', { replace: true })
  }, [params, navigate])

  return null
}
