import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/api/transacciones.api'
import type { ListaTransaccionesParams } from '@/api/transacciones.api'
import type { PaginatedResponse, Transaccion } from '@/types'
import { extractApiError } from '@/lib/utils'

// ─── Cache helpers (paginado) ────────────────────────────

function esPaginado(data: unknown): data is PaginatedResponse<Transaccion> {
  return !!data && typeof data === 'object' && 'meta' in data && Array.isArray((data as any).data)
}

function agregarEnCache(qc: QueryClient, item: Transaccion) {
  qc.setQueriesData<PaginatedResponse<Transaccion>>(
    { queryKey: ['transacciones'], exact: false },
    (old) => {
      if (!esPaginado(old)) return old
      return {
        ...old,
        data: [item, ...old.data],
        meta: { ...old.meta, total: old.meta.total + 1 },
      }
    },
  )
}

function actualizarEnCache(qc: QueryClient, item: Transaccion) {
  qc.setQueriesData<PaginatedResponse<Transaccion>>(
    { queryKey: ['transacciones'], exact: false },
    (old) => {
      if (!esPaginado(old)) return old
      return {
        ...old,
        data: old.data.map((i) => (i.id === item.id ? item : i)),
      }
    },
  )
}

function removerDeCache(qc: QueryClient, id: string) {
  qc.setQueriesData<PaginatedResponse<Transaccion>>(
    { queryKey: ['transacciones'], exact: false },
    (old) => {
      if (!esPaginado(old)) return old
      return {
        ...old,
        data: old.data.filter((i) => i.id !== id),
        meta: { ...old.meta, total: old.meta.total - 1 },
      }
    },
  )
}

function invalidarDerivadas(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ['cuentas'] })
  qc.invalidateQueries({ queryKey: ['reportes'] })
  qc.invalidateQueries({ queryKey: ['presupuestos'] })
}

// ─── Queries ─────────────────────────────────────────────

export function useTransacciones(params?: ListaTransaccionesParams) {
  return useQuery({
    queryKey: ['transacciones', params],
    queryFn: () => api.listar(params),
  })
}

export function useTransaccion(id: string) {
  return useQuery({
    queryKey: ['transacciones', id],
    queryFn: () => api.obtener(id),
    enabled: !!id,
  })
}

// ─── Mutations ───────────────────────────────────────────

export function useCrearTransaccion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crear,
    onSuccess: (transaccion) => {
      agregarEnCache(qc, transaccion)
      qc.setQueryData(['transacciones', transaccion.id], transaccion)
      invalidarDerivadas(qc)
      toast.success('Transaccion creada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al crear la transaccion')),
  })
}

export function useActualizarTransaccion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: api.ActualizarTransaccionData }) =>
      api.actualizar(id, data),
    onSuccess: (transaccion) => {
      actualizarEnCache(qc, transaccion)
      qc.setQueryData(['transacciones', transaccion.id], transaccion)
      invalidarDerivadas(qc)
      toast.success('Transaccion actualizada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al actualizar la transaccion')),
  })
}

export function useEliminarTransaccion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.eliminar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['transacciones'] })
      const prevQueries = qc.getQueriesData<PaginatedResponse<Transaccion>>({
        queryKey: ['transacciones'],
      })
      removerDeCache(qc, id)
      qc.removeQueries({ queryKey: ['transacciones', id] })
      return { prevQueries }
    },
    onError: (_err, _id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      toast.error('No se pudo eliminar. Puede ser parte de una transferencia.')
    },
    onSuccess: () => {
      invalidarDerivadas(qc)
      toast.success('Transaccion eliminada')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['transacciones'] })
    },
  })
}
