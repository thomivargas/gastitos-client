import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/api/cuentas.api'
import type { ListaCuentasParams } from '@/api/cuentas.api'
import type { PaginatedResponse, Cuenta } from '@/types'
import { extractApiError } from '@/lib/utils'

// ─── Cache helpers (paginado) ────────────────────────────

function agregarEnCache(qc: QueryClient, item: Cuenta) {
  qc.setQueriesData<PaginatedResponse<Cuenta>>(
    { queryKey: ['cuentas'], exact: false },
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

function actualizarEnCache(qc: QueryClient, item: Cuenta) {
  qc.setQueriesData<PaginatedResponse<Cuenta>>(
    { queryKey: ['cuentas'], exact: false },
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
  qc.setQueriesData<PaginatedResponse<Cuenta>>(
    { queryKey: ['cuentas'], exact: false },
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

export function useCuentas(params?: ListaCuentasParams, enabled = true) {
  return useQuery({
    queryKey: ['cuentas', params],
    queryFn: () => api.listar(params),
    enabled,
  })
}

export function useCuenta(id: string) {
  return useQuery({
    queryKey: ['cuentas', id],
    queryFn: () => api.obtener(id),
    enabled: !!id,
  })
}

export function useResumenCuentas(moneda?: string, tipoDolar?: string, soloMoneda?: boolean) {
  return useQuery({
    queryKey: ['cuentas', 'resumen', moneda, tipoDolar, soloMoneda],
    queryFn: () => api.obtenerResumen(moneda, tipoDolar, soloMoneda),
  })
}

// ─── Mutations ───────────────────────────────────────────

export function useCrearCuenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crear,
    onSuccess: (cuenta) => {
      agregarEnCache(qc, cuenta)
      qc.setQueryData(['cuentas', cuenta.id], cuenta)
      qc.invalidateQueries({ queryKey: ['cuentas', 'resumen'] })
      toast.success('Cuenta creada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al crear la cuenta')),
  })
}

export function useActualizarCuenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: api.ActualizarCuentaData }) =>
      api.actualizar(id, data),
    onSuccess: (cuenta) => {
      actualizarEnCache(qc, cuenta)
      qc.setQueryData(['cuentas', cuenta.id], cuenta)
      qc.invalidateQueries({ queryKey: ['cuentas', 'resumen'] })
      toast.success('Cuenta actualizada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al actualizar la cuenta')),
  })
}

export function useArchivarCuenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.archivar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['cuentas'] })
      const prevQueries = qc.getQueriesData<PaginatedResponse<Cuenta>>({
        queryKey: ['cuentas'],
      })
      const prevIndividual = qc.getQueryData<Cuenta>(['cuentas', id])
      if (prevIndividual) {
        const optimistic = { ...prevIndividual, estado: 'ARCHIVADA' as const }
        actualizarEnCache(qc, optimistic)
        qc.setQueryData(['cuentas', id], optimistic)
      }
      return { prevQueries, prevIndividual }
    },
    onError: (_err, id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      if (context?.prevIndividual) {
        qc.setQueryData(['cuentas', id], context.prevIndividual)
      }
      toast.error('Error al archivar la cuenta')
    },
    onSuccess: (cuenta) => {
      actualizarEnCache(qc, cuenta)
      qc.setQueryData(['cuentas', cuenta.id], cuenta)
      qc.invalidateQueries({ queryKey: ['cuentas', 'resumen'] })
      toast.success('Cuenta archivada')
    },
  })
}

export function useReactivarCuenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.reactivar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['cuentas'] })
      const prevQueries = qc.getQueriesData<PaginatedResponse<Cuenta>>({
        queryKey: ['cuentas'],
      })
      const prevIndividual = qc.getQueryData<Cuenta>(['cuentas', id])
      if (prevIndividual) {
        const optimistic = { ...prevIndividual, estado: 'ACTIVA' as const }
        actualizarEnCache(qc, optimistic)
        qc.setQueryData(['cuentas', id], optimistic)
      }
      return { prevQueries, prevIndividual }
    },
    onError: (_err, id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      if (context?.prevIndividual) {
        qc.setQueryData(['cuentas', id], context.prevIndividual)
      }
      toast.error('Error al reactivar la cuenta')
    },
    onSuccess: (cuenta) => {
      actualizarEnCache(qc, cuenta)
      qc.setQueryData(['cuentas', cuenta.id], cuenta)
      qc.invalidateQueries({ queryKey: ['cuentas', 'resumen'] })
      toast.success('Cuenta reactivada')
    },
  })
}

export function useEliminarCuenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.eliminar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['cuentas'] })
      const prevQueries = qc.getQueriesData<PaginatedResponse<Cuenta>>({
        queryKey: ['cuentas'],
      })
      removerDeCache(qc, id)
      qc.removeQueries({ queryKey: ['cuentas', id] })
      return { prevQueries }
    },
    onError: (_err, _id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      toast.error('No se pudo eliminar. Puede tener transacciones asociadas.')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cuentas', 'resumen'] })
      toast.success('Cuenta eliminada')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['cuentas'] })
    },
  })
}
