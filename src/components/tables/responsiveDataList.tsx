import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/components/ui/utils'

const STH_BASE =
  'sticky top-0 z-10 border-b border-slate-200 bg-slate-100/95 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-600 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/80'

/** Cabeçalhos de tabela fixos ao rolar (use dentro de thead > tr). */
export const STH = {
  left: `${STH_BASE} pl-4 pr-3 text-left`,
  mid: `${STH_BASE} px-3 text-left`,
  midNum: `${STH_BASE} px-3 text-right tabular-nums`,
  midHiddenLg: `${STH_BASE} px-3 text-left hidden lg:table-cell`,
  midHiddenXl: `${STH_BASE} px-3 text-left hidden xl:table-cell`,
  center: `${STH_BASE} px-3 text-center`,
  right: `${STH_BASE} pl-3 pr-4 text-right`,
}

export function listInteractiveRow(index: number, className?: string) {
  return cn(
    'cursor-pointer border-b border-slate-100 transition-colors hover:bg-[#203d7b]/[0.04]',
    index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white',
    className
  )
}

type DesktopShellProps = {
  children: ReactNode
  /** Classe Tailwind completa, ex.: min-w-[56rem] */
  tableMinClass?: string
  showScrollHint?: boolean
}

/** Tabela desktop: oculta abaixo de md; scroll horizontal + dica em telas médias. */
export function DesktopDataTableShell({
  children,
  tableMinClass = 'min-w-[52rem]',
  showScrollHint = true,
}: DesktopShellProps) {
  return (
    <Card className="hidden overflow-hidden border-slate-200/90 shadow-sm md:block">
      <CardContent className="p-0">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className={cn('w-full border-collapse text-sm', tableMinClass)}>{children}</table>
        </div>
        {showScrollHint ? (
          <p className="hidden border-t border-slate-100 bg-sky-50/60 px-4 py-2 text-center text-xs text-sky-900/80 md:block xl:hidden">
            Dica: deslize a tabela para a lateral para ver todas as colunas.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

/** Área de paginação / totais responsiva (empilha no mobile, controles com wrap). */
export function paginationBarClass() {
  return 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
}

export function paginationControlsClass() {
  return 'flex flex-wrap items-center justify-center gap-2 sm:justify-end'
}
