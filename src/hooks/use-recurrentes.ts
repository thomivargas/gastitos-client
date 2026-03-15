import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/api/recurrentes.api'
import type { TransaccionRecurrente } from '@/types'
import { extractApiError } from '@/lib/utils'

// ─── Cache helpers (lista simple) ────────────────────────

function agregarEnCacheLista(qc: QueryClient, item: TransaccionRecurrente) {
  qc.setQueriesData<TransaccionRecurrente[]>(
    { queryKey: ['recurrentes'], exact: false },
    (old) => old ? [item, ...old] : [item],
  )
}

function actualizarEnCacheLista(qc: QueryClient, item: TransaccionRecurrente) {
  qc.setQueriesData<TransaccionRecurrente[]>(
    { queryKey: ['recurrentes'], exact: false },
    (old) => old ? old.map((i) => (i.id === item.id ? item : i)) : old,
  )
}

function removerDeCacheLista(qc: QueryClient, id: string) {
  qc.setQueriesData<TransaccionRecurrente[]>(
    { queryKey: ['recurrentes'], exact: false },
    (old) => old ? old.filter((i) => i.id !== id) : old,
  )
}

// ─── Queries ─────────────────────────────────────────────

export function useRecurrentes() {
  return useQuery({
    queryKey: ['recurrentes'],
    queryFn: api.listar,
  })
}

// ─── Mutations ───────────────────────────────────────────

export function useCrearRecurrente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crear,
    onSuccess: (recurrente) => {
      agregarEnCacheLista(qc, recurrente)
      toast.success('Transaccion recurrente creada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al crear')),
  })
}

export function useActualizarRecurrente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: api.ActualizarRecurrenteData }) =>
      api.actualizar(id, data),
    onSuccess: (recurrente) => {
      actualizarEnCacheLista(qc, recurrente)
      toast.success('Recurrente actualizada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al actualizar')),
  })
}

export function useActivarRecurrente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.activar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['recurrentes'] })
      const prevQueries = qc.getQueriesData<TransaccionRecurrente[]>({
        queryKey: ['recurrentes'],
      })
      actualizarEnCacheLista(qc, {
        ...prevQueries.flatMap(([, data]) => data ?? []).find((i) => i.id === id)!,
        activa: true,
      })
      return { prevQueries }
    },
    onError: (_err, _id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      toast.error('Error al activar')
    },
    onSuccess: (recurrente) => {
      actualizarEnCacheLista(qc, recurrente)
      toast.success('Recurrente activada')
    },
  })
}

export function useDesactivarRecurrente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.desactivar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['recurrentes'] })
      const prevQueries = qc.getQueriesData<TransaccionRecurrente[]>({
        queryKey: ['recurrentes'],
      })
      actualizarEnCacheLista(qc, {
        ...prevQueries.flatMap(([, data]) => data ?? []).find((i) => i.id === id)!,
        activa: false,
      })
      return { prevQueries }
    },
    onError: (_err, _id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      toast.error('Error al desactivar')
    },
    onSuccess: (recurrente) => {
      actualizarEnCacheLista(qc, recurrente)
      toast.success('Recurrente desactivada')
    },
  })
}

export function useEliminarRecurrente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.eliminar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['recurrentes'] })
      const prevQueries = qc.getQueriesData<TransaccionRecurrente[]>({
        queryKey: ['recurrentes'],
      })
      removerDeCacheLista(qc, id)
      return { prevQueries }
    },
    onError: (_err, _id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      toast.error('Error al eliminar')
    },
    onSuccess: () => {
      toast.success('Recurrente eliminada')
    },
  })
}
