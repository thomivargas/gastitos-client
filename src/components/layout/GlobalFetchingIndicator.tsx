import { useIsFetching, useIsMutating } from '@tanstack/react-query'

export function GlobalFetchingIndicator() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const isActive = isFetching > 0 || isMutating > 0

  if (!isActive) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-100 h-0.5">
      <div className="h-full w-full bg-primary/20 overflow-hidden">
        <div className="h-full bg-primary animate-[loading-bar_1.5s_ease-in-out_infinite] origin-left" />
      </div>
    </div>
  )
}
