import {
  OrdemServico,
  OrdemServicoFoto,
  OrdemServicoRequest,
  PageResponse,
  StatusOrdemServico,
  TipoFoto,
  TipoOrdemServico,
  Usuario,
} from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

function mapUsuarioFromApi(u: any): Usuario | undefined {
  if (!u) return undefined
  return {
    id: String(u.id),
    nome: u.nome || '',
    email: u.email || '',
    telefone: u.telefone || '',
    cargo: u.cargo || '',
    nivelAcesso: u.nivelAcesso,
    status: u.status,
    dataAdmissao: u.dataAdmissao
      ? typeof u.dataAdmissao === 'string'
        ? u.dataAdmissao
        : u.dataAdmissao.toString()
      : '',
    ultimoAcesso: u.ultimoAcesso
      ? typeof u.ultimoAcesso === 'string'
        ? u.ultimoAcesso
        : u.ultimoAcesso.toString()
      : undefined,
    createdAt: u.createdAt
      ? typeof u.createdAt === 'string'
        ? u.createdAt
        : u.createdAt.toString()
      : new Date().toISOString(),
    updatedAt: u.updatedAt
      ? typeof u.updatedAt === 'string'
        ? u.updatedAt
        : u.updatedAt.toString()
      : new Date().toISOString(),
  }
}

function formatOrdemServicoFromResponse(os: any): OrdemServico {
  return {
    id: String(os.id),
    numero: os.numero || '',
    tipo: os.tipo,
    locacaoId: os.locacao?.id || os.locacaoId || '',
    geradorId: os.gerador?.id || os.geradorId || '',
    tecnicoResponsavelId: os.tecnicoResponsavel?.id || os.tecnicoResponsavelId || '',
    tecnicoAuxiliarId: os.tecnicoAuxiliar?.id || os.tecnicoAuxiliarId || undefined,
    dataAgendada: os.dataAgendada ? (typeof os.dataAgendada === 'string' ? os.dataAgendada : os.dataAgendada.toString()) : '',
    horarioPrevisto: os.horarioPrevisto
      ? typeof os.horarioPrevisto === 'string'
        ? os.horarioPrevisto.substring(0, 5)
        : String(os.horarioPrevisto).substring(0, 5)
      : undefined,
    enderecoCep: os.enderecoCep || undefined,
    enderecoLogradouro: os.enderecoLogradouro || undefined,
    enderecoNumero: os.enderecoNumero || undefined,
    enderecoComplemento: os.enderecoComplemento || undefined,
    enderecoBairro: os.enderecoBairro || undefined,
    enderecoCidade: os.enderecoCidade || undefined,
    enderecoEstado: os.enderecoEstado || undefined,
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
      geradorIds: (os.locacao.geradores || []).map((g: any) => String(g.id)),
      clienteAvulsoNome: os.locacao.clienteAvulsoNome || undefined,
      dataInicio: os.locacao.dataInicio ? (typeof os.locacao.dataInicio === 'string' ? os.locacao.dataInicio : os.locacao.dataInicio.toString()) : '',
      dataFim: os.locacao.dataFim ? (typeof os.locacao.dataFim === 'string' ? os.locacao.dataFim : os.locacao.dataFim.toString()) : undefined,
      valorMensal: os.locacao.valorMensal ? parseFloat(os.locacao.valorMensal) : undefined,
      status: os.locacao.status,
      observacoes: os.locacao.observacoes || undefined,
      cliente: os.locacao.cliente,
      gerador: os.locacao.gerador,
      geradores: os.locacao.geradores,
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
    tecnicoResponsavel: mapUsuarioFromApi(os.tecnicoResponsavel),
    tecnicoAuxiliar: mapUsuarioFromApi(os.tecnicoAuxiliar),
    fotos: (os.fotos || []).map((f: any) => ({
      id: String(f.id),
      ordemServicoId: String(os.id),
      url: f.url || '',
      tipo: f.tipo,
      descricao: f.descricao ?? undefined,
      createdAt: f.createdAt
        ? typeof f.createdAt === 'string'
          ? f.createdAt
          : new Date(f.createdAt).toISOString()
        : new Date().toISOString(),
    })),
    createdAt: os.createdAt ? (typeof os.createdAt === 'string' ? os.createdAt : os.createdAt.toString()) : new Date().toISOString(),
    updatedAt: os.updatedAt ? (typeof os.updatedAt === 'string' ? os.updatedAt : os.updatedAt.toString()) : new Date().toISOString(),
  }
}

class OrdemServicoService {
  async listar(params?: {
    page?: number
    size?: number
    q?: string
    status?: StatusOrdemServico | ''
    tipo?: TipoOrdemServico | ''
    locacaoId?: string
  }): Promise<PageResponse<OrdemServico>> {
    try {
      const response = await api.get<PageResponse<any>>(API_ENDPOINTS.ordensServico.list, {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          q: params?.q || undefined,
          status: params?.status || undefined,
          tipo: params?.tipo || undefined,
          locacaoId: params?.locacaoId || undefined,
        },
      })
      return {
        ...response.data,
        content: response.data.content.map(formatOrdemServicoFromResponse),
      }
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
      const body = {
        ...data,
        tecnicoAuxiliarId: data.tecnicoAuxiliarId ?? null,
      }
      const response = await api.put<any>(API_ENDPOINTS.ordensServico.update(id), body)
      return formatOrdemServicoFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar ordem de serviço')
    }
  }

  async concluir(id: string, horimetroFinal?: number): Promise<OrdemServico> {
    try {
      const body = horimetroFinal === undefined || horimetroFinal === null ? null : horimetroFinal
      const response = await api.put<any>(
        `${API_ENDPOINTS.ordensServico.get(id)}/concluir`,
        JSON.stringify(body),
        { headers: { 'Content-Type': 'application/json' } },
      )
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

  async enviarFoto(ordemServicoId: string, file: File, tipo: TipoFoto, descricao?: string): Promise<OrdemServicoFoto> {
    try {
      const form = new FormData()
      form.append('tipo', tipo)
      if (descricao?.trim()) {
        form.append('descricao', descricao.trim())
      }
      form.append('file', file)
      const response = await api.post<any>(API_ENDPOINTS.ordensServico.uploadFoto(ordemServicoId), form, {
        timeout: 120000,
      })
      const d = response.data
      return {
        id: String(d.id),
        ordemServicoId,
        url: d.url || '',
        tipo: d.tipo,
        descricao: d.descricao ?? undefined,
        createdAt: d.createdAt
          ? typeof d.createdAt === 'string'
            ? d.createdAt
            : new Date(d.createdAt).toISOString()
          : new Date().toISOString(),
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Erro ao enviar foto'
      throw new Error(msg)
    }
  }

  async excluirFoto(ordemServicoId: string, fotoId: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.ordensServico.deleteFoto(ordemServicoId, fotoId))
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao excluir foto')
    }
  }

  async atualizarFotoMeta(ordemServicoId: string, fotoId: string, descricao: string, tipo: TipoFoto): Promise<OrdemServicoFoto> {
    try {
      const response = await api.patch<any>(API_ENDPOINTS.ordensServico.patchFoto(ordemServicoId, fotoId), {
        descricao,
        tipo,
      })
      const d = response.data
      return {
        id: String(d.id),
        ordemServicoId,
        url: d.url || '',
        tipo: d.tipo,
        descricao: d.descricao ?? undefined,
        createdAt: d.createdAt
          ? typeof d.createdAt === 'string'
            ? d.createdAt
            : new Date(d.createdAt).toISOString()
          : new Date().toISOString(),
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar foto')
    }
  }
}

export const ordemServicoService = new OrdemServicoService()





