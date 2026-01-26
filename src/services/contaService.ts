import { Conta, ContaRequest, ContaAuditoria } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

// Função auxiliar para formatar conta da resposta
function formatContaFromResponse(conta: any): Conta {
  // Formatar valor (pode vir como string, number ou BigDecimal)
  let valor = conta.valor
  if (typeof valor === 'string') {
    valor = parseFloat(valor)
  } else if (valor && typeof valor === 'object' && 'doubleValue' in valor) {
    valor = valor.doubleValue()
  }

  // Formatar datas
  const formatDate = (date: any): string | undefined => {
    if (!date) return undefined
    if (typeof date === 'string') {
      return date.includes('T') ? date.split('T')[0] : date
    }
    return date
  }

    return {
      id: String(conta.id),
      tipo: conta.tipo,
      clienteId: conta.clienteId || (conta.cliente ? String(conta.cliente.id) : undefined),
      descricao: conta.descricao,
      valor: valor || 0,
      dataVencimento: formatDate(conta.dataVencimento) || '',
      dataPagamento: formatDate(conta.dataPagamento),
      formaPagamento: conta.formaPagamento || undefined,
      status: conta.status,
      observacoes: conta.observacoes || undefined,
      categoria: conta.categoria || undefined,
      categoriaFinanceira: conta.categoriaFinanceira || undefined,
      subcategoria: conta.subcategoria || undefined,
      cliente: conta.cliente ? {
      id: String(conta.cliente.id),
      nome: conta.cliente.nome,
      cnpj: conta.cliente.cnpj,
      email: conta.cliente.email,
      telefone: conta.cliente.telefone || '',
      endereco: conta.cliente.endereco || '',
      cidade: conta.cliente.cidade || '',
      estado: conta.cliente.estado || '',
      status: conta.cliente.status,
      createdAt: conta.cliente.createdAt || new Date().toISOString(),
      updatedAt: conta.cliente.updatedAt || new Date().toISOString(),
    } : undefined,
    createdAt: conta.createdAt ? (typeof conta.createdAt === 'string' ? conta.createdAt : conta.createdAt.toString()) : new Date().toISOString(),
    updatedAt: conta.updatedAt ? (typeof conta.updatedAt === 'string' ? conta.updatedAt : conta.updatedAt.toString()) : new Date().toISOString(),
  }
}

class ContaService {
  async listar(): Promise<Conta[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.contas.list)
      return response.data.map(formatContaFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar contas')
    }
  }

  async buscarPorId(id: string): Promise<Conta> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.contas.get(id))
      return formatContaFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar conta')
    }
  }

  async criar(data: ContaRequest): Promise<Conta> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.contas.create, data)
      return formatContaFromResponse(response.data)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao criar conta'
      throw new Error(message)
    }
  }

  async atualizar(id: string, data: ContaRequest): Promise<Conta> {
    try {
      const response = await api.put<any>(API_ENDPOINTS.contas.update(id), data)
      return formatContaFromResponse(response.data)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar conta'
      throw new Error(message)
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.contas.delete(id))
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar conta')
    }
  }

  async marcarComoPaga(id: string, dataPagamento: string, formaPagamento?: string): Promise<Conta> {
    try {
      const response = await api.put<any>(
        `${API_ENDPOINTS.contas.get(id)}/pagar`,
        {
          dataPagamento,
          formaPagamento: formaPagamento || null,
        }
      )
      return formatContaFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao marcar conta como paga')
    }
  }

  async buscarHistorico(id: string): Promise<ContaAuditoria[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.contas.historico(id))
      return response.data.map(formatAuditoriaFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar histórico')
    }
  }
}

// Função auxiliar para formatar auditoria da resposta
function formatAuditoriaFromResponse(auditoria: any): ContaAuditoria {
  return {
    id: String(auditoria.id),
    contaId: String(auditoria.contaId),
    usuario: {
      id: String(auditoria.usuario.id),
      nome: auditoria.usuario.nome,
      email: auditoria.usuario.email,
      telefone: auditoria.usuario.telefone || '',
      cargo: auditoria.usuario.cargo || '',
      nivelAcesso: auditoria.usuario.nivelAcesso,
      status: auditoria.usuario.status,
      dataAdmissao: auditoria.usuario.dataAdmissao ? (typeof auditoria.usuario.dataAdmissao === 'string' ? auditoria.usuario.dataAdmissao : auditoria.usuario.dataAdmissao) : '',
      ultimoAcesso: auditoria.usuario.ultimoAcesso ? (typeof auditoria.usuario.ultimoAcesso === 'string' ? auditoria.usuario.ultimoAcesso : auditoria.usuario.ultimoAcesso.toString()) : undefined,
      foto: auditoria.usuario.foto || undefined,
      createdAt: auditoria.usuario.createdAt ? (typeof auditoria.usuario.createdAt === 'string' ? auditoria.usuario.createdAt : auditoria.usuario.createdAt.toString()) : new Date().toISOString(),
      updatedAt: auditoria.usuario.updatedAt ? (typeof auditoria.usuario.updatedAt === 'string' ? auditoria.usuario.updatedAt : auditoria.usuario.updatedAt.toString()) : new Date().toISOString(),
    },
    acao: auditoria.acao,
    campoAlterado: auditoria.campoAlterado || undefined,
    valorAnterior: auditoria.valorAnterior || undefined,
    valorNovo: auditoria.valorNovo || undefined,
    observacoes: auditoria.observacoes || undefined,
    dataAcao: auditoria.dataAcao ? (typeof auditoria.dataAcao === 'string' ? auditoria.dataAcao : auditoria.dataAcao.toString()) : new Date().toISOString(),
  }
}

export const contaService = new ContaService()

