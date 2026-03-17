import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/api/instituciones.api'
import type { ListarInstitucionesParams } from '@/api/instituciones.api'
import { extractApiError } from '@/lib/utils'

export function useInstituciones(params?: ListarInstitucionesParams) {
  return useQuery({
    queryKey: ['instituciones', params],
    queryFn: () => api.listar(params),
  })
}

export function useCrearInstitucion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crear,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instituciones'] })
      toast.success('Institución creada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al crear la institución')),
  })
}

export function useActualizarInstitucion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: api.ActualizarInstitucionData }) =>
      api.actualizar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instituciones'] })
      toast.success('Institución actualizada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al actualizar la institución')),
  })
}

export function useEliminarInstitucion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.eliminar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instituciones'] })
      toast.success('Institución eliminada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al eliminar la institución')),
  })
}
