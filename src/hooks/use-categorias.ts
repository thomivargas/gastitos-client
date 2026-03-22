import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/api/categorias.api'
import type { ClasificacionCategoria, Categoria } from '@/types'
import { extractApiError } from '@/lib/utils'

// ─── Cache helpers ────────────────────────────────────────

function agregarEnCacheLista(qc: QueryClient, item: Categoria) {
  if (item.padreId) {
    // Es subcategoria: insertar dentro del padre en cache
    qc.setQueryData<Categoria[]>(
      ['categorias', item.clasificacion],
      (old) => {
        if (!Array.isArray(old)) return old
        return old.map((cat) =>
          cat.id === item.padreId
            ? { ...cat, subcategorias: [...(cat.subcategorias ?? []), item] }
            : cat,
        )
      },
    )
  } else {
    // Es categoria raiz
    qc.setQueryData<Categoria[]>(
      ['categorias', item.clasificacion],
      (old) => Array.isArray(old) ? [item, ...old] : [item],
    )
  }
}

function actualizarEnCacheLista(qc: QueryClient, item: Categoria) {
  qc.setQueriesData<Categoria[]>(
    { queryKey: ['categorias'], exact: false },
    (old) => {
      if (!Array.isArray(old)) return old
      return old.map((cat) => {
        if (cat.id === item.id) return { ...cat, ...item }
        if (cat.subcategorias) {
          return {
            ...cat,
            subcategorias: cat.subcategorias.map((s) => s.id === item.id ? { ...s, ...item } : s),
          }
        }
        return cat
      })
    },
  )
}

function removerDeCacheLista(qc: QueryClient, id: string) {
  qc.setQueriesData<Categoria[]>(
    { queryKey: ['categorias'], exact: false },
    (old) => {
      if (!Array.isArray(old)) return old
      const sinPadre = old.filter((i) => i.id !== id)
      // Si no estaba en el top level, buscar en subcategorias
      if (sinPadre.length !== old.length) return sinPadre
      return old.map((cat) => ({
        ...cat,
        subcategorias: cat.subcategorias?.filter((s) => s.id !== id),
      }))
    },
  )
}

// ─── Queries ─────────────────────────────────────────────

export function useCategorias(clasificacion?: ClasificacionCategoria, enabled = true) {
  return useQuery({
    queryKey: ['categorias', clasificacion],
    queryFn: () => api.listar(clasificacion),
    enabled,
  })
}

export function useCategoria(id: string) {
  return useQuery({
    queryKey: ['categorias', id],
    queryFn: () => api.obtener(id),
    enabled: !!id,
  })
}

// ─── Mutations ───────────────────────────────────────────

export function useCrearCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.crear,
    onSuccess: (categoria) => {
      agregarEnCacheLista(qc, categoria)
      qc.setQueryData(['categorias', categoria.id], categoria)
      toast.success('Categoria creada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al crear la categoria')),
  })
}

export function useActualizarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: api.ActualizarCategoriaData }) =>
      api.actualizar(id, data),
    onSuccess: (categoria) => {
      actualizarEnCacheLista(qc, categoria)
      qc.setQueryData(['categorias', categoria.id], categoria)
      toast.success('Categoria actualizada')
    },
    onError: (e) => toast.error(extractApiError(e, 'Error al actualizar la categoria')),
  })
}

export function useEliminarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.eliminar,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['categorias'] })
      const prevQueries = qc.getQueriesData<Categoria[]>({
        queryKey: ['categorias'],
      })
      removerDeCacheLista(qc, id)
      qc.removeQueries({ queryKey: ['categorias', id] })
      return { prevQueries }
    },
    onError: (_err, _id, context) => {
      context?.prevQueries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data)
      })
      toast.error('No se pudo eliminar. Puede tener transacciones asociadas.')
    },
    onSuccess: () => {
      toast.success('Categoria eliminada')
    },
  })
}
