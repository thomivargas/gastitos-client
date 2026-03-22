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

  async function conectar(cuentaId: string) {
    try {
      const { data } = await apiClient.get<{ status: string; data: { url: string } }>(
        `/mercadopago/conectar?cuentaId=${cuentaId}`,
      )
      window.location.href = data.data.url
    } catch {
      toast.error('No se pudo iniciar la conexión con Mercado Pago')
    }
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
