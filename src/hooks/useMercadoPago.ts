import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { toast } from 'sonner'

interface EstadoMP {
  conectado: boolean
  cuentaId?: string
}

async function fetchEstado(): Promise<EstadoMP> {
  const { data } = await apiClient.get<{ status: string; data: EstadoMP }>(
    '/mercadopago/estado',
  )
  return data.data
}

async function desconectarMP(): Promise<void> {
  await apiClient.delete('/mercadopago/desconectar')
}

export function useMercadoPago() {
  const queryClient = useQueryClient()

  const estadoQuery = useQuery({
    queryKey: ['mp-estado'],
    queryFn: fetchEstado,
  })

  const desconectarMutation = useMutation({
    mutationFn: desconectarMP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mp-estado'] })
      toast.success('Mercado Pago desconectado')
    },
    onError: () => {
      toast.error('Error al desconectar Mercado Pago')
    },
  })

  function conectar(cuentaId: string) {
    // VITE_API_URL ya incluye /api (ej: http://localhost:3000/api)
    // Se remueve el sufijo /api para obtener la URL base del servidor
    const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api$/, '') ?? 'http://localhost:3000'
    window.location.href = `${base}/api/mercadopago/conectar?cuentaId=${cuentaId}`
  }

  return {
    conectado: estadoQuery.data?.conectado ?? false,
    cuentaId: estadoQuery.data?.cuentaId,
    isLoading: estadoQuery.isLoading,
    conectar,
    desconectar: desconectarMutation.mutate,
    isDesconectando: desconectarMutation.isPending,
  }
}
