import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/api/reglas.api'
import type { ReglaCategorizacion } from '@/types'
import { extractApiError } from '@/lib/utils'

// ─── Cache helpers (lista simple) ────────────────────────

function agregarEnCacheLista(qc: QueryClient, item: ReglaCategorizacion) {
  qc.setQueriesData<ReglaCategorizacion[]>(
    { queryKey: ['reglas'], exact: false },
    (old) => old ? [item, ...old] : [item],
  )
}

function actualizarEnCacheLista(qc: QueryClient, item: ReglaCategorizacion) {
  qc.setQueriesData<ReglaCategorizacion[]>(
    { queryKey: ['reglas'], exact: false },
    (old) => old ? old.map((i) => (i.id === item.id ? item : i)) : old,
  )
}

function removerDeCacheLista(qc: QueryClient, id: string) {
  qc.setQueriesData<ReglaCategorizacion[]>(
    { queryKey: ['reglas'], exact: false },
    (old) => old ? old.filter((i) => i.id !== id) : old,
  )
}

// ─── Queries ─────────────────────────────────────────────

export function useReglas() {
  return useQuery({
    queryKey: ['reglas'],
    queryFn: api.listar,
  })
}

// ─── Mutations ───────────────────────────────────────────

export function useCrearRegla() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crear,
    onSuccess: (regla) => {
      agregarEnCacheLista(qc, regla)
      toast.success('Regla creada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al crear la regla')),
  })
}

export function useActualizarRegla() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: api.ActualizarReglaData }) =>
      api.actualizar(id, data),
    onSuccess: (regla) => {
      actualizarEnCacheLista(qc, regla)
      toast.success('Regla actualizada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al actualizar la regla')),
  })
}

export function useEliminarRegla() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.eliminar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['reglas'] })
      const prevQueries = qc.getQueriesData<ReglaCategorizacion[]>({
        queryKey: ['reglas'],
      })
      removerDeCacheLista(qc, id)
      return { prevQueries }
    },
    onError: (_err, _id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      toast.error('Error al eliminar la regla')
    },
    onSuccess: () => {
      toast.success('Regla eliminada')
    },
  })
}

export function useAplicarReglas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.aplicar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transacciones'] })
      toast.success('Reglas aplicadas')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al aplicar reglas')),
  })
}
