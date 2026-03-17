import { useState } from 'react'
import { ChevronDown, Pencil, Trash2, Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useEliminarCategoria } from '@/hooks/use-categorias'
import type { Categoria } from '@/types'
import { cn } from '@/lib/utils'

interface CategoriaListProps {
  categorias: Categoria[]
  onEdit: (cat: Categoria) => void
  onAddSub: (padreId: string) => void
}

export function CategoriaList({ categorias, onEdit, onAddSub }: CategoriaListProps) {
  if (categorias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
          <Plus className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Sin categorias</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {categorias.map((cat, i) => (
        <CategoriaItem
          key={cat.id}
          categoria={cat}
          onEdit={onEdit}
          onAddSub={onAddSub}
          index={i}
        />
      ))}
    </div>
  )
}

function CategoriaItem({
  categoria,
  onEdit,
  onAddSub,
  index,
}: {
  categoria: Categoria
  onEdit: (cat: Categoria) => void
  onAddSub: (padreId: string) => void
  index: number
}) {
  const eliminar = useEliminarCategoria()
  const [expandido, setExpandido] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmSubId, setConfirmSubId] = useState<string | null>(null)

  const hasSubs = categoria.subcategorias && categoria.subcategorias.length > 0
  const color = categoria.color || '#667085'

  return (
    <div
      className="stagger-item"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Categoria padre */}
      <div className="group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/50 transition-colors">
        {/* Color indicator */}
        <div
          className="h-7 w-7 rounded-lg shrink-0 flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, boxShadow: `0 0 0 1px ${color}30` }}
        >
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Expand toggle — solo si tiene subcategorias */}
        {hasSubs ? (
          <button
            type="button"
            onClick={() => setExpandido(v => !v)}
            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
          >
            <span className="text-sm font-medium truncate">{categoria.nombre}</span>
            <span className="text-[10px] tabular-nums text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 shrink-0">
              {categoria.subcategorias!.length}
            </span>
            <ChevronDown
              className={cn(
                'h-3 w-3 text-muted-foreground transition-transform duration-200 shrink-0',
                expandido && 'rotate-180',
              )}
            />
          </button>
        ) : (
          <span className="text-sm font-medium truncate flex-1 min-w-0">{categoria.nombre}</span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onAddSub(categoria.id)}
            aria-label="Agregar subcategoria"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Opciones">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(categoria)}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Subcategorias — expandible */}
      {hasSubs && expandido && (
        <div className="ml-5 pl-4 border-l border-border/50 space-y-0.5 py-0.5">
          {categoria.subcategorias!.map((sub) => (
            <div
              key={sub.id}
              className="group/sub flex items-center gap-2.5 rounded-md px-2.5 py-1.5 hover:bg-muted/40 transition-colors"
            >
              <div
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: sub.color || color }}
              />
              <span className="text-[13px] text-muted-foreground flex-1 min-w-0 truncate">
                {sub.nombre}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon" className="h-5 w-5" aria-label="Opciones">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(sub)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setConfirmSubId(sub.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => { eliminar.mutate(categoria.id); setConfirmOpen(false) }}
        titulo="Eliminar categoria"
        descripcion={`Se eliminara "${categoria.nombre}"${hasSubs ? ` y sus ${categoria.subcategorias!.length} subcategorias` : ''}. Esta accion no se puede deshacer.`}
      />
      {confirmSubId && (
        <ConfirmDialog
          open={!!confirmSubId}
          onOpenChange={(open) => { if (!open) setConfirmSubId(null) }}
          onConfirm={() => { eliminar.mutate(confirmSubId); setConfirmSubId(null) }}
          titulo="Eliminar subcategoria"
          descripcion="Esta accion no se puede deshacer."
        />
      )}
    </div>
  )
}
