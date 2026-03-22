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

async function sincronizarMP(): Promise<number> {
  const { data } = await apiClient.post<{ status: string; data: { importados: number } }>(
    '/mercadopago/sincronizar',
  )
  return data.data.importados
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

  const sincronizarMutation = useMutation({
    mutationFn: sincronizarMP,
    onSuccess: (importados) => {
      queryClient.invalidateQueries({ queryKey: ['transacciones'] })
      queryClient.invalidateQueries({ queryKey: ['cuentas'] })
      if (importados > 0) {
        toast.success(`${importados} transacción${importados !== 1 ? 'es' : ''} importada${importados !== 1 ? 's' : ''}`)
      } else {
        toast.info('Sin transacciones nuevas')
      }
    },
    onError: () => {
      toast.error('Error al sincronizar Mercado Pago')
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
    sincronizar: sincronizarMutation.mutate,
    isSincronizando: sincronizarMutation.isPending,
  }
}
