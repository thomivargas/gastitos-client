import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/api/transferencias.api'
import type { ListaTransferenciasParams, TransferenciaDetalle } from '@/api/transferencias.api'
import type { PaginatedResponse } from '@/types'
import { extractApiError } from '@/lib/utils'

// ─── Cache helpers (paginado) ────────────────────────────

function agregarEnCache(qc: QueryClient, item: TransferenciaDetalle) {
  qc.setQueriesData<PaginatedResponse<TransferenciaDetalle>>(
    { queryKey: ['transferencias'], exact: false },
    (old) => {
      if (!old) return old
      return {
        ...old,
        data: [item, ...old.data],
        meta: { ...old.meta, total: old.meta.total + 1 },
      }
    },
  )
}

function removerDeCache(qc: QueryClient, id: string) {
  qc.setQueriesData<PaginatedResponse<TransferenciaDetalle>>(
    { queryKey: ['transferencias'], exact: false },
    (old) => {
      if (!old) return old
      return {
        ...old,
        data: old.data.filter((i) => i.id !== id),
        meta: { ...old.meta, total: old.meta.total - 1 },
      }
    },
  )
}

// ─── Queries ─────────────────────────────────────────────

export function useTransferencias(params?: ListaTransferenciasParams) {
  return useQuery({
    queryKey: ['transferencias', params],
    queryFn: () => api.listar(params),
  })
}

export function useTransferencia(id: string) {
  return useQuery({
    queryKey: ['transferencias', id],
    queryFn: () => api.obtener(id),
    enabled: !!id,
  })
}

// ─── Mutations ───────────────────────────────────────────

export function useCrearTransferencia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crear,
    onSuccess: (transferencia) => {
      agregarEnCache(qc, transferencia)
      qc.setQueryData(['transferencias', transferencia.id], transferencia)
      // Derivadas: transferencias afectan balances de cuentas y generan transacciones
      qc.invalidateQueries({ queryKey: ['cuentas'] })
      qc.invalidateQueries({ queryKey: ['transacciones'] })
      toast.success('Transferencia realizada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al crear la transferencia')),
  })
}

export function useEliminarTransferencia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.eliminar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['transferencias'] })
      const prevQueries = qc.getQueriesData<PaginatedResponse<TransferenciaDetalle>>({
        queryKey: ['transferencias'],
      })
      removerDeCache(qc, id)
      qc.removeQueries({ queryKey: ['transferencias', id] })
      return { prevQueries }
    },
    onError: (_err, _id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      toast.error('Error al eliminar la transferencia')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cuentas'] })
      qc.invalidateQueries({ queryKey: ['transacciones'] })
      toast.success('Transferencia eliminada')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['transferencias'] })
    },
  })
}
