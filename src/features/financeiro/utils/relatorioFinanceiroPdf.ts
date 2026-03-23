import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { RelatorioFinanceiro } from '@/types'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Gera e faz download do PDF do relatório financeiro (Contas).
 */
export function gerarPdfRelatorioContas(relatorio: RelatorioFinanceiro): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const margin = 12
  let y = 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('RELATÓRIO FINANCEIRO - CONTAS A PAGAR E RECEBER', margin, y)
  y += 7

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Período: ${relatorio.periodoInicio} a ${relatorio.periodoFim}`, margin, y)
  y += 12

  // Resumo
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo do Período', margin, y)
  y += 6

  const resumoData = [
    ['Total Entradas', formatCurrency(relatorio.totais.totalEntradas)],
    ['Total Saídas', formatCurrency(relatorio.totais.totalSaidas)],
    ['Resultado do Período', formatCurrency(relatorio.totais.resultadoCaixaPeriodo)],
    ['Caixa Líquido Operacional', formatCurrency(relatorio.totais.caixaLiquidoOperacional)],
  ]
  autoTable(doc, {
    startY: y,
    head: [['Item', 'Valor']],
    body: resumoData,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: margin },
  })
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 30
  y += 10

  // Saídas detalhadas (Contas a Pagar) - Compra de insumos e Locações separados
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Saídas Operacionais - Contas a Pagar (por mês)', margin, y)
  y += 6

  const colMeses = relatorio.meses.map((m) => m.mesAno)
  const head = ['Item', ...colMeses, 'TOTAL']

  const saidasRows: string[][] = [
    ['Compra de insumos', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].pagamentosComprasInsumos ?? 0)), formatCurrency(relatorio.meses.reduce((s, m) => s + (m.pagamentosComprasInsumos ?? 0), 0))],
    ['Outros Pagamentos Fornecedores', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].pagamentosFornecedores)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.pagamentosFornecedores, 0))],
    ['Despesas Variáveis', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].pagamentosDespesasVariaveis)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.pagamentosDespesasVariaveis, 0))],
    ['Impostos', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].pagamentosImpostos)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.pagamentosImpostos, 0))],
    ['Desp. Administrativas', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].pagamentosDespesasAdministrativas)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.pagamentosDespesasAdministrativas, 0))],
    ['Desp. com Pessoal', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].pagamentosDespesasPessoal)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.pagamentosDespesasPessoal, 0))],
    ['Desp. Financeiras', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].pagamentosDespesasFinanceiras)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.pagamentosDespesasFinanceiras, 0))],
    ['Serviços Terceiros', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].pagamentosCustosServicosTerceiros)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.pagamentosCustosServicosTerceiros, 0))],
    ['Manutenção', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].pagamentosDespesasManutencao)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.pagamentosDespesasManutencao, 0))],
    ['Marketing', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].pagamentosDespesasMarketing)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.pagamentosDespesasMarketing, 0))],
    ['TOTAL SAÍDAS', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].totalSaidas)), formatCurrency(relatorio.totais.totalSaidas)],
  ]

  autoTable(doc, {
    startY: y,
    head: [head],
    body: saidasRows,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { fontSize: 7 },
    margin: { left: margin },
    tableWidth: 'auto',
  })

  const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
  y = (lastTable?.finalY ?? y + 60) + 8

  if (y > 180) {
    doc.addPage('a4', 'landscape')
    y = 15
  }

  // Entradas
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Entradas Operacionais (por mês)', margin, y)
  y += 6

  const entradasRows: string[][] = [
    ['Locações de geradores', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].recebimentoLocacoesGeradores ?? 0)), formatCurrency(relatorio.meses.reduce((s, m) => s + (m.recebimentoLocacoesGeradores ?? 0), 0))],
    ['Boleto', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].recebimentoBoleto)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.recebimentoBoleto, 0))],
    ['Transferência', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].recebimentoTransferencia)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.recebimentoTransferencia, 0))],
    ['PIX', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].recebimentoPix)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.recebimentoPix, 0))],
    ['Outros', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].outrosRecebimentos)), formatCurrency(relatorio.meses.reduce((s, m) => s + m.outrosRecebimentos, 0))],
    ['TOTAL ENTRADAS', ...colMeses.map((_, i) => formatCurrency(relatorio.meses[i].totalEntradas)), formatCurrency(relatorio.totais.totalEntradas)],
  ]

  autoTable(doc, {
    startY: y,
    head: [head],
    body: entradasRows,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { fontSize: 7 },
    margin: { left: margin },
    tableWidth: 'auto',
  })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} - Nordeste Geradores`, margin, doc.internal.pageSize.height - 10)

  doc.save(`relatorio-financeiro-contas-${relatorio.periodoInicio}-${relatorio.periodoFim}.pdf`)
}
