import { HelpCircle, Table2, Building2 } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function AyudaModal() {
  return (
    <Dialog>
      <DialogTrigger
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
          border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30
          transition-colors duration-150"
        aria-label="Ayuda"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Ayuda</span>
      </DialogTrigger>
      <DialogContent
        className="
          sm:max-w-lg w-full max-h-[90vh] overflow-y-auto
          bg-white! text-[#0a0a0a]! ring-black/10!
          p-0
        "
      >
        <div className="sticky top-0 z-10 bg-white border-b border-[#e5e5e5] px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#0a0a0a] flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#737373]" />
              ¿Cómo funciona Importar?
            </DialogTitle>
            <p className="text-xs text-[#737373] mt-0.5">
              Todo lo que necesitás saber para importar transacciones.
            </p>
          </DialogHeader>
        </div>

        <div
          className="px-2 pb-4"
          style={{ '--muted-foreground': '#525252', '--foreground': '#0a0a0a', '--border': '#e5e5e5', '--muted': '#f5f5f5' } as React.CSSProperties}
        >
          <Accordion multiple defaultValue={['importar-csv']} className="divide-y divide-[#e5e5e5]">

            <AccordionItem value="importar-csv" className="border-0 px-4">
              <AccordionTrigger className="text-sm py-4 hover:no-underline font-semibold text-[#0a0a0a] [&>svg]:text-[#737373]">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#f5f5f5] flex items-center justify-center shrink-0">
                    <Table2 className="h-3.5 w-3.5 text-[#525252]" />
                  </div>
                  CSV / Excel genérico
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 px-0">
                <div className="ml-8 space-y-3 text-[#525252]">
                  <p className="text-sm">Usá este modo si tenés cualquier archivo CSV o Excel exportado de otro sistema.</p>
                  <ol className="space-y-2">
                    {[
                      <>Seleccioná <strong className="text-[#0a0a0a] font-medium">CSV / Excel genérico</strong> y hacé click en Continuar.</>,
                      <>Subí el archivo — se muestran las primeras filas para verificarlo.</>,
                      <>Mapeá las columnas: indicá cuál es la <strong className="text-[#0a0a0a] font-medium">fecha</strong>, el <strong className="text-[#0a0a0a] font-medium">monto</strong> y la <strong className="text-[#0a0a0a] font-medium">descripción</strong>.</>,
                      <>Elegí la cuenta destino y hacé click en <strong className="text-[#0a0a0a] font-medium">Importar</strong>.</>,
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3 text-xs leading-relaxed">
                        <span className="w-4 h-4 rounded-full bg-[#e5e5e5] text-[#525252] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="text-xs text-[#737373] bg-[#f5f5f5] rounded-lg px-3 py-2">
                    El separador decimal y el formato de fecha se detectan automáticamente, pero podés ajustarlos manualmente.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="importar-banco" className="border-0 px-4">
              <AccordionTrigger className="text-sm py-4 hover:no-underline font-semibold text-[#0a0a0a] [&>svg]:text-[#737373]">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#f5f5f5] flex items-center justify-center shrink-0">
                    <Building2 className="h-3.5 w-3.5 text-[#525252]" />
                  </div>
                  Resumen bancario (BBVA)
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 px-0">
                <div className="ml-8 space-y-3 text-[#525252]">
                  <p className="text-sm">
                    Descargá el resumen de tu tarjeta BBVA desde el homebanking en formato{' '}
                    <span className="font-mono text-xs bg-[#f5f5f5] text-[#0a0a0a] px-1.5 py-0.5 rounded border border-[#e5e5e5]">.xls</span>.
                  </p>
                  <ol className="space-y-2">
                    {[
                      <>Seleccioná <strong className="text-[#0a0a0a] font-medium">Resumen bancario</strong> y elegí el banco.</>,
                      <>Configurá la <strong className="text-[#0a0a0a] font-medium">cuenta ARS</strong> para pesos y/o la <strong className="text-[#0a0a0a] font-medium">cuenta USD</strong> para dólares.</>,
                      <>Activá <strong className="text-[#0a0a0a] font-medium">Excluir cargos bancarios</strong> para omitir IVA, percepciones e intereses.</>,
                      <>Subí el archivo — se muestra un preview con las primeras 10 transacciones.</>,
                      <>Confirmá la importación. ARS y USD se asignan a cada cuenta automáticamente.</>,
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3 text-xs leading-relaxed">
                        <span className="w-4 h-4 rounded-full bg-[#e5e5e5] text-[#525252] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="text-xs text-[#737373] bg-[#f5f5f5] rounded-lg px-3 py-2">
                    Las cuotas ("2/3") se guardan en el campo de notas de cada transacción.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  )
}
