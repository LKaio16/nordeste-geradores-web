import { OrdemServico, OrdemServicoRequest } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

function formatOrdemServicoFromResponse(os: any): OrdemServico {
  return {
    id: String(os.id),
    numero: os.numero || '',
    tipo: os.tipo,
    locacaoId: os.locacao?.id || os.locacaoId || '',
    geradorId: os.gerador?.id || os.geradorId || '',
    tecnicoResponsavelId: os.tecnicoResponsavel?.id || os.tecnicoResponsavelId || '',
    dataAgendada: os.dataAgendada ? (typeof os.dataAgendada === 'string' ? os.dataAgendada : os.dataAgendada.toString()) : '',
    status: os.status,
    observacoes: os.observacoes || undefined,
    horimetroInicial: os.horimetroInicial ? parseFloat(os.horimetroInicial) : undefined,
    horimetroFinal: os.horimetroFinal ? parseFloat(os.horimetroFinal) : undefined,
    dataExecucao: os.dataExecucao ? (typeof os.dataExecucao === 'string' ? os.dataExecucao : os.dataExecucao.toString()) : undefined,
    assinaturaCliente: os.assinaturaCliente || false,
    assinaturaDigital: os.assinaturaDigital || undefined,
    locacao: os.locacao ? {
      id: String(os.locacao.id),
      numero: os.locacao.numero || '',
      tipo: os.locacao.tipo,
      clienteId: os.locacao.cliente?.id || os.locacao.clienteId || '',
      geradorId: os.locacao.gerador?.id || os.locacao.geradorId || '',
      dataInicio: os.locacao.dataInicio ? (typeof os.locacao.dataInicio === 'string' ? os.locacao.dataInicio : os.locacao.dataInicio.toString()) : '',
      dataFim: os.locacao.dataFim ? (typeof os.locacao.dataFim === 'string' ? os.locacao.dataFim : os.locacao.dataFim.toString()) : undefined,
      valorMensal: os.locacao.valorMensal ? parseFloat(os.locacao.valorMensal) : undefined,
      status: os.locacao.status,
      observacoes: os.locacao.observacoes || undefined,
      cliente: os.locacao.cliente,
      gerador: os.locacao.gerador,
      createdAt: os.locacao.createdAt ? (typeof os.locacao.createdAt === 'string' ? os.locacao.createdAt : os.locacao.createdAt.toString()) : new Date().toISOString(),
      updatedAt: os.locacao.updatedAt ? (typeof os.locacao.updatedAt === 'string' ? os.locacao.updatedAt : os.locacao.updatedAt.toString()) : new Date().toISOString(),
    } : undefined,
    gerador: os.gerador ? {
      id: String(os.gerador.id),
      codigo: os.gerador.codigo || '',
      modelo: os.gerador.modelo || '',
      potencia: os.gerador.potencia ? String(os.gerador.potencia) : '0',
      numeroSerie: os.gerador.numeroSerie || '',
      marca: os.gerador.marca || '',
      anoFabricacao: os.gerador.anoFabricacao || 0,
      horimetro: os.gerador.horimetro || 0,
      status: os.gerador.status,
      observacoes: os.gerador.observacoes || undefined,
      createdAt: os.gerador.createdAt ? (typeof os.gerador.createdAt === 'string' ? os.gerador.createdAt : os.gerador.createdAt.toString()) : new Date().toISOString(),
      updatedAt: os.gerador.updatedAt ? (typeof os.gerador.updatedAt === 'string' ? os.gerador.updatedAt : os.gerador.updatedAt.toString()) : new Date().toISOString(),
    } : undefined,
    tecnicoResponsavel: os.tecnicoResponsavel ? {
      id: String(os.tecnicoResponsavel.id),
      nome: os.tecnicoResponsavel.nome || '',
      email: os.tecnicoResponsavel.email || '',
      telefone: os.tecnicoResponsavel.telefone || '',
      cargo: os.tecnicoResponsavel.cargo || '',
      nivelAcesso: os.tecnicoResponsavel.nivelAcesso,
      status: os.tecnicoResponsavel.status,
      dataAdmissao: os.tecnicoResponsavel.dataAdmissao ? (typeof os.tecnicoResponsavel.dataAdmissao === 'string' ? os.tecnicoResponsavel.dataAdmissao : os.tecnicoResponsavel.dataAdmissao.toString()) : '',
      ultimoAcesso: os.tecnicoResponsavel.ultimoAcesso ? (typeof os.tecnicoResponsavel.ultimoAcesso === 'string' ? os.tecnicoResponsavel.ultimoAcesso : os.tecnicoResponsavel.ultimoAcesso.toString()) : undefined,
      createdAt: os.tecnicoResponsavel.createdAt ? (typeof os.tecnicoResponsavel.createdAt === 'string' ? os.tecnicoResponsavel.createdAt : os.tecnicoResponsavel.createdAt.toString()) : new Date().toISOString(),
      updatedAt: os.tecnicoResponsavel.updatedAt ? (typeof os.tecnicoResponsavel.updatedAt === 'string' ? os.tecnicoResponsavel.updatedAt : os.tecnicoResponsavel.updatedAt.toString()) : new Date().toISOString(),
    } : undefined,
    fotos: os.fotos || [],
    createdAt: os.createdAt ? (typeof os.createdAt === 'string' ? os.createdAt : os.createdAt.toString()) : new Date().toISOString(),
    updatedAt: os.updatedAt ? (typeof os.updatedAt === 'string' ? os.updatedAt : os.updatedAt.toString()) : new Date().toISOString(),
  }
}

class OrdemServicoService {
  async listar(): Promise<OrdemServico[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.ordensServico.list)
      return response.data.map(formatOrdemServicoFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar ordens de serviço')
    }
  }

  async buscarPorId(id: string): Promise<OrdemServico> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.ordensServico.get(id))
      return formatOrdemServicoFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar ordem de serviço')
    }
  }

  async buscarPorLocacaoId(locacaoId: string): Promise<OrdemServico[]> {
    try {
      const response = await api.get<any[]>(`${API_ENDPOINTS.ordensServico.list}/locacao/${locacaoId}`)
      return response.data.map(formatOrdemServicoFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar ordens de serviço da locação')
    }
  }

  async criar(data: OrdemServicoRequest): Promise<OrdemServico> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.ordensServico.create, data)
      return formatOrdemServicoFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar ordem de serviço')
    }
  }

  async atualizar(id: string, data: OrdemServicoRequest): Promise<OrdemServico> {
    try {
      const response = await api.put<any>(API_ENDPOINTS.ordensServico.update(id), data)
      return formatOrdemServicoFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar ordem de serviço')
    }
  }

  async concluir(id: string, horimetroFinal?: number): Promise<OrdemServico> {
    try {
      const response = await api.put<any>(`${API_ENDPOINTS.ordensServico.get(id)}/concluir`, horimetroFinal || null)
      return formatOrdemServicoFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao concluir ordem de serviço')
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.ordensServico.delete(id))
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar ordem de serviço')
    }
  }
}

export const ordemServicoService = new OrdemServicoService()



