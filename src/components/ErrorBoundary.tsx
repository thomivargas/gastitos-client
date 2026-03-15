import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
          <h2 className="text-xl font-semibold">Algo salio mal</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Ocurrio un error inesperado. Podes intentar recargar la pagina o volver al inicio.
          </p>
          {this.state.error && (
            <pre className="text-xs text-destructive bg-destructive/10 p-3 rounded-md max-w-lg overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent" onClick={this.handleReset}>
              Reintentar
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { window.location.href = '/' }}>
              Ir al inicio
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
