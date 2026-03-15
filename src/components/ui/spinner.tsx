import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  fullScreen?: boolean
}

export function Spinner({ className, fullScreen }: SpinnerProps) {
  const spinner = (
    <div className={cn('h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent', className)} />
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
