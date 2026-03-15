import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/api/presupuestos.api'
import type { ListaPresupuestosParams } from '@/api/presupuestos.api'
import type { PaginatedResponse, Presupuesto } from '@/types'
import { extractApiError } from '@/lib/utils'

// ─── Cache helpers (paginado) ────────────────────────────

function agregarEnCache(qc: QueryClient, item: Presupuesto) {
  qc.setQueriesData<PaginatedResponse<Presupuesto>>(
    { queryKey: ['presupuestos'], exact: false },
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

function actualizarEnCache(qc: QueryClient, item: Presupuesto) {
  qc.setQueriesData<PaginatedResponse<Presupuesto>>(
    { queryKey: ['presupuestos'], exact: false },
    (old) => {
      if (!old) return old
      return {
        ...old,
        data: old.data.map((i) => (i.id === item.id ? item : i)),
      }
    },
  )
}

function removerDeCache(qc: QueryClient, id: string) {
  qc.setQueriesData<PaginatedResponse<Presupuesto>>(
    { queryKey: ['presupuestos'], exact: false },
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

function invalidarDerivadas(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ['presupuestos', 'actual'] })
}

// ─── Queries ─────────────────────────────────────────────

export function usePresupuestos(params?: ListaPresupuestosParams) {
  return useQuery({
    queryKey: ['presupuestos', params],
    queryFn: () => api.listar(params),
  })
}

export function usePresupuesto(id: string) {
  return useQuery({
    queryKey: ['presupuestos', id],
    queryFn: () => api.obtener(id),
    enabled: !!id,
  })
}

export function usePresupuestoActual() {
  return useQuery({
    queryKey: ['presupuestos', 'actual'],
    queryFn: api.obtenerActual,
    retry: false,
  })
}

export function useProgresoPresupuesto(id: string) {
  return useQuery({
    queryKey: ['presupuestos', id, 'progreso'],
    queryFn: () => api.obtenerProgreso(id),
    enabled: !!id,
  })
}

// ─── Mutations ───────────────────────────────────────────

export function useCrearPresupuesto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crear,
    onSuccess: (presupuesto) => {
      agregarEnCache(qc, presupuesto)
      qc.setQueryData(['presupuestos', presupuesto.id], presupuesto)
      invalidarDerivadas(qc)
      toast.success('Presupuesto creado')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al crear el presupuesto')),
  })
}

export function useActualizarPresupuesto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: api.ActualizarPresupuestoData }) =>
      api.actualizar(id, data),
    onSuccess: (presupuesto) => {
      actualizarEnCache(qc, presupuesto)
      qc.setQueryData(['presupuestos', presupuesto.id], presupuesto)
      invalidarDerivadas(qc)
      qc.invalidateQueries({ queryKey: ['presupuestos', presupuesto.id, 'progreso'] })
      toast.success('Presupuesto actualizado')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al actualizar el presupuesto')),
  })
}

export function useCopiarPresupuesto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, fechaInicio, fechaFin }: { id: string; fechaInicio: string; fechaFin: string }) =>
      api.copiar(id, fechaInicio, fechaFin),
    onSuccess: (presupuesto) => {
      agregarEnCache(qc, presupuesto)
      qc.setQueryData(['presupuestos', presupuesto.id], presupuesto)
      invalidarDerivadas(qc)
      toast.success('Presupuesto copiado')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al copiar el presupuesto')),
  })
}

export function useEliminarPresupuesto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.eliminar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['presupuestos'] })
      const prevQueries = qc.getQueriesData<PaginatedResponse<Presupuesto>>({
        queryKey: ['presupuestos'],
      })
      removerDeCache(qc, id)
      qc.removeQueries({ queryKey: ['presupuestos', id] })
      return { prevQueries }
    },
    onError: (_err, _id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      toast.error('Error al eliminar el presupuesto')
    },
    onSuccess: () => {
      invalidarDerivadas(qc)
      toast.success('Presupuesto eliminado')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['presupuestos'] })
    },
  })
}

export function useAsignarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, categoriaId, monto }: { id: string; categoriaId: string; monto: number }) =>
      api.asignarCategoria(id, categoriaId, monto),
    onSuccess: (_data, { id }) => {
      // asignarCategoria retorna unknown, invalidar para refrescar
      qc.invalidateQueries({ queryKey: ['presupuestos', id] })
      qc.invalidateQueries({ queryKey: ['presupuestos', id, 'progreso'] })
      invalidarDerivadas(qc)
      toast.success('Categoria asignada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al asignar la categoria')),
  })
}

export function useEliminarCategoriaPresupuesto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, categoriaId }: { id: string; categoriaId: string }) =>
      api.eliminarCategoria(id, categoriaId),
    onSuccess: (_data, { id }) => {
      // eliminarCategoria retorna void, invalidar para refrescar
      qc.invalidateQueries({ queryKey: ['presupuestos', id] })
      qc.invalidateQueries({ queryKey: ['presupuestos', id, 'progreso'] })
      invalidarDerivadas(qc)
      toast.success('Categoria removida')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al remover la categoria')),
  })
}
