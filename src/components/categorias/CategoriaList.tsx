import { ChevronRight, Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEliminarCategoria } from '@/hooks/use-categorias'
import type { Categoria } from '@/types'

interface CategoriaListProps {
  categorias: Categoria[]
  onEdit: (cat: Categoria) => void
  onAddSub: (padreId: string) => void
}

export function CategoriaList({ categorias, onEdit, onAddSub }: CategoriaListProps) {
  const eliminar = useEliminarCategoria()

  if (categorias.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">No hay categorias en esta clasificacion</p>
    )
  }

  return (
    <ul className="space-y-1">
      {categorias.map((cat) => (
        <li key={cat.id}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50 group">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: cat.color || '#667085' }}
            />
            <span className="flex-1 text-sm font-medium">{cat.nombre}</span>
            {cat.subcategorias && cat.subcategorias.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {cat.subcategorias.length}
              </Badge>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onAddSub(cat.id)}
                aria-label="Agregar subcategoria"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent cursor-pointer" aria-label="Opciones de categoria">
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(cat)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => eliminar.mutate(cat.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Subcategorias */}
          {cat.subcategorias && cat.subcategorias.length > 0 && (
            <ul className="ml-6 border-l pl-3 space-y-0.5">
              {cat.subcategorias.map((sub) => (
                <li key={sub.id} className="flex items-center gap-3 px-3 py-1.5 rounded-md hover:bg-accent/50 group/sub">
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: sub.color || '#667085' }}
                  />
                  <span className="flex-1 text-sm">{sub.nombre}</span>
                  <div className="opacity-0 group-hover/sub:opacity-100 transition-opacity flex gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent cursor-pointer" aria-label="Opciones de subcategoria">
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(sub)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => eliminar.mutate(sub.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}
