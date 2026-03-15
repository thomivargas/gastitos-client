import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  titulo?: string
  descripcion?: string
  textoConfirmar?: string
  textoCancelar?: string
  destructivo?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  titulo = 'Estas seguro?',
  descripcion = 'Esta accion no se puede deshacer.',
  textoConfirmar = 'Eliminar',
  textoCancelar = 'Cancelar',
  destructivo = true,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descripcion}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{textoCancelar}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructivo ? 'bg-destructive text-white hover:bg-destructive/90' : undefined}
          >
            {textoConfirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
