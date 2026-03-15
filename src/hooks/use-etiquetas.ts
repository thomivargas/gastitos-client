import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/api/etiquetas.api'
import type { Etiqueta } from '@/types'
import { extractApiError } from '@/lib/utils'

// ─── Cache helpers (lista simple) ────────────────────────

function agregarEnCacheLista(qc: QueryClient, item: Etiqueta) {
  qc.setQueriesData<Etiqueta[]>(
    { queryKey: ['etiquetas'], exact: false },
    (old) => old ? [item, ...old] : [item],
  )
}

function actualizarEnCacheLista(qc: QueryClient, item: Etiqueta) {
  qc.setQueriesData<Etiqueta[]>(
    { queryKey: ['etiquetas'], exact: false },
    (old) => old ? old.map((i) => (i.id === item.id ? item : i)) : old,
  )
}

function removerDeCacheLista(qc: QueryClient, id: string) {
  qc.setQueriesData<Etiqueta[]>(
    { queryKey: ['etiquetas'], exact: false },
    (old) => old ? old.filter((i) => i.id !== id) : old,
  )
}

// ─── Queries ─────────────────────────────────────────────

export function useEtiquetas() {
  return useQuery({
    queryKey: ['etiquetas'],
    queryFn: api.listar,
  })
}

// ─── Mutations ───────────────────────────────────────────

export function useCrearEtiqueta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crear,
    onSuccess: (etiqueta) => {
      agregarEnCacheLista(qc, etiqueta)
      toast.success('Etiqueta creada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al crear la etiqueta')),
  })
}

export function useActualizarEtiqueta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: api.ActualizarEtiquetaData }) =>
      api.actualizar(id, data),
    onSuccess: (etiqueta) => {
      actualizarEnCacheLista(qc, etiqueta)
      toast.success('Etiqueta actualizada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al actualizar la etiqueta')),
  })
}

export function useEliminarEtiqueta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.eliminar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['etiquetas'] })
      const prevQueries = qc.getQueriesData<Etiqueta[]>({
        queryKey: ['etiquetas'],
      })
      removerDeCacheLista(qc, id)
      return { prevQueries }
    },
    onError: (_err, _id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      toast.error('Error al eliminar la etiqueta')
    },
    onSuccess: () => {
      toast.success('Etiqueta eliminada')
    },
  })
}
