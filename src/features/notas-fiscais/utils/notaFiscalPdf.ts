import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { NotaFiscal } from '@/types'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatCNPJ(cnpj: string): string {
  const cleaned = (cnpj || '').replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
  }
  if (cleaned.length === 14) {
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }
  return cnpj
}

/**
 * Gera e faz download do PDF da nota fiscal (entrada ou saída).
 */
export function gerarPdfNotaFiscal(nota: NotaFiscal): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const margin = 14
  let y = 20

  // Título
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('NOTA FISCAL', margin, y)
  y += 10

  // Tipo e número
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const tipoLabel = nota.tipo === 'ENTRADA' ? 'Nota de Entrada' : 'Nota de Saída'
  doc.text(`${tipoLabel} - Nº ${nota.numeroNota}`, margin, y)
  y += 7
  doc.text(`Data de Emissão: ${formatDate(nota.dataEmissao)}`, margin, y)
  y += 7

  if (nota.formaPagamento) {
    doc.text(`Forma de Pagamento: ${nota.formaPagamento.replace('_', ' ')}`, margin, y)
    y += 7
  }

  doc.text(`CNPJ Lançamento: ${formatCNPJ(nota.cnpjLancamento || '14.847.748/0001-39')}`, margin, y)
  y += 12

  // Fornecedor/Cliente
  doc.setFont('helvetica', 'bold')
  doc.text(nota.clienteId ? 'Cliente' : 'Fornecedor', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${nota.fornecedor}`, margin, y)
  y += 6
  doc.text(`CNPJ/CPF: ${formatCNPJ(nota.cnpjEmpresa)}`, margin, y)
  y += 12

  // Tabela de itens
  const tableHead = [['Descrição', 'Qtd', 'Valor Unit.', 'Desconto', 'Total']]
  const tableBody = nota.itens.map((item) => [
    item.descricao,
    String(item.quantidade),
    formatCurrency(item.valorUnitario),
    item.desconto ? formatCurrency(item.desconto) : '-',
    formatCurrency(item.valorTotal),
  ])

  autoTable(doc, {
    startY: y,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], fontStyle: 'bold' },
    margin: { left: margin },
  })

  const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
  y = (lastTable?.finalY ?? y + 40) + 10

  // Total
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`Total: ${formatCurrency(nota.valorTotal)}`, margin, y)

  doc.save(`nota-fiscal-${nota.numeroNota.replace(/\s/g, '-')}.pdf`)
}

/**
 * Gera HTML da nota para impressão e abre o diálogo de impressão.
 */
export function imprimirNotaFiscal(nota: NotaFiscal): void {
  const tipoLabel = nota.tipo === 'ENTRADA' ? 'Nota de Entrada' : 'Nota de Saída'
  const origemLabel = nota.clienteId ? 'Cliente' : 'Fornecedor'

  const itensRows = nota.itens
    .map(
      (item) => `
    <tr>
      <td>${escapeHtml(item.descricao)}</td>
      <td style="text-align:right">${item.quantidade}</td>
      <td style="text-align:right">${formatCurrency(item.valorUnitario)}</td>
      <td style="text-align:right">${item.desconto ? formatCurrency(item.desconto) : '-'}</td>
      <td style="text-align:right">${formatCurrency(item.valorTotal)}</td>
    </tr>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Nota Fiscal ${escapeHtml(nota.numeroNota)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #1e293b; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .block { margin-bottom: 1.25rem; }
    .block-title { font-weight: 700; margin-bottom: 0.5rem; font-size: 0.875rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
    th { background: #475569; color: #fff; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
    .total { font-size: 1.125rem; font-weight: 700; margin-top: 1rem; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>NOTA FISCAL</h1>
  <div class="meta">${tipoLabel} · Nº ${escapeHtml(nota.numeroNota)} · Emissão: ${formatDate(nota.dataEmissao)}</div>
  ${nota.formaPagamento ? `<div class="meta">Forma de pagamento: ${nota.formaPagamento.replace('_', ' ')}</div>` : ''}
  <div class="meta">CNPJ Lançamento: ${formatCNPJ(nota.cnpjLancamento || '14.847.748/0001-39')}</div>

  <div class="block">
    <div class="block-title">${origemLabel}</div>
    <div><strong>Nome:</strong> ${escapeHtml(nota.fornecedor)}</div>
    <div><strong>CNPJ/CPF:</strong> ${formatCNPJ(nota.cnpjEmpresa)}</div>
  </div>

  <div class="block">
    <div class="block-title">Itens da Nota</div>
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th style="text-align:right">Qtd</th>
          <th style="text-align:right">Valor Unit.</th>
          <th style="text-align:right">Desconto</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${itensRows}</tbody>
    </table>
    <div class="total">Total: ${formatCurrency(nota.valorTotal)}</div>
  </div>
</body>
</html>`

  const janela = window.open('', '_blank')
  if (!janela) {
    alert('Permita pop-ups para imprimir a nota fiscal.')
    return
  }
  janela.document.write(html)
  janela.document.close()
  janela.focus()
  janela.onload = () => {
    janela.print()
    janela.onafterprint = () => janela.close()
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
