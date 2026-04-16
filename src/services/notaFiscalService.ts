import { NotaFiscal, NotaFiscalRequest, PageResponse, TipoNotaFiscal, FormaPagamento } from '@/types'
import { api, API_ENDPOINTS } from '@/config/api'

// Função auxiliar para formatar nota fiscal da resposta
function formatNotaFiscalFromResponse(nota: any): NotaFiscal {
  return {
    id: String(nota.id),
    tipo: nota.tipo,
    fornecedor: nota.fornecedor,
    cnpjEmpresa: nota.cnpjEmpresa,
    cnpjLancamento: nota.cnpjLancamento || '14.847.748/0001-39', // Default para CNPJ principal
    fornecedorId: nota.fornecedorId ? String(nota.fornecedorId) : undefined,
    clienteId: nota.clienteId ? String(nota.clienteId) : undefined,
    dataEmissao: nota.dataEmissao ? (typeof nota.dataEmissao === 'string' ? nota.dataEmissao : nota.dataEmissao.split('T')[0]) : '',
    numeroNota: nota.numeroNota,
    valorTotal: typeof nota.valorTotal === 'number' ? nota.valorTotal : parseFloat(nota.valorTotal) || 0,
    formaPagamento: nota.formaPagamento,
    itens: (nota.itens || []).map((item: any) => ({
      id: String(item.id),
      notaFiscalId: String(item.notaFiscalId || nota.id),
      produtoId: item.produtoId ? String(item.produtoId) : undefined,
      descricao: item.descricao,
      quantidade: item.quantidade || 0,
      valorUnitario: typeof item.valorUnitario === 'number' ? item.valorUnitario : parseFloat(item.valorUnitario) || 0,
      desconto: item.desconto ? (typeof item.desconto === 'number' ? item.desconto : parseFloat(item.desconto)) : 0,
      valorTotal: typeof item.valorTotal === 'number' ? item.valorTotal : parseFloat(item.valorTotal) || 0,
      produto: item.produto,
    })),
    createdAt: nota.createdAt ? (typeof nota.createdAt === 'string' ? nota.createdAt : nota.createdAt) : new Date().toISOString(),
    updatedAt: nota.updatedAt ? (typeof nota.updatedAt === 'string' ? nota.updatedAt : nota.updatedAt) : new Date().toISOString(),
    avisosEstoque: nota.avisosEstoque || [],
  }
}

class NotaFiscalService {
  async listarTodos(): Promise<NotaFiscal[]> {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.notasFiscais.all)
      return response.data.map(formatNotaFiscalFromResponse)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar notas fiscais')
    }
  }

  async listarPagina(params?: {
    page?: number
    size?: number
    q?: string
    tipo?: TipoNotaFiscal | ''
    formaPagamento?: FormaPagamento | ''
    fornecedorId?: string
    origem?: 'fornecedor' | 'cliente' | ''
    dataInicio?: string
    dataFim?: string
  }): Promise<PageResponse<NotaFiscal>> {
    try {
      const response = await api.get<PageResponse<any>>(API_ENDPOINTS.notasFiscais.list, {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          q: params?.q || undefined,
          tipo: params?.tipo || undefined,
          formaPagamento: params?.formaPagamento || undefined,
          fornecedorId: params?.fornecedorId || undefined,
          origem: params?.origem || undefined,
          dataInicio: params?.dataInicio || undefined,
          dataFim: params?.dataFim || undefined,
        },
      })
      return {
        ...response.data,
        content: response.data.content.map(formatNotaFiscalFromResponse),
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao listar notas fiscais')
    }
  }

  async buscarPorId(id: string): Promise<NotaFiscal> {
    try {
      const response = await api.get<any>(API_ENDPOINTS.notasFiscais.get(id))
      return formatNotaFiscalFromResponse(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar nota fiscal')
    }
  }

  async criar(data: NotaFiscalRequest): Promise<NotaFiscal> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.notasFiscais.create, data)
      return formatNotaFiscalFromResponse(response.data)
    } catch (error: any) {
      // Se a resposta contém dados da nota (mesmo com erro), retornar formatada
      if (error.response?.data && error.response.data.id) {
        console.log('⚠️ Erro mas resposta contém dados da nota, formatando...')
        return formatNotaFiscalFromResponse(error.response.data)
      }
      
      // Se for erro de estoque insuficiente, tentar extrair informações
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Se contém avisos de estoque, criar uma nota parcial para exibir os avisos
        if (errorData.avisosEstoque && Array.isArray(errorData.avisosEstoque) && errorData.avisosEstoque.length > 0) {
          console.log('⚠️ Erro com avisos de estoque, retornando nota parcial')
          // Tentar construir uma resposta parcial com os avisos
          if (errorData.id) {
            return formatNotaFiscalFromResponse(errorData)
          }
        }
        
        // Se for erro de estoque insuficiente específico, criar aviso
        if (errorData.message && errorData.message.includes('Quantidade insuficiente')) {
          const avisos: string[] = []
          if (errorData.produtoDescricao) {
            avisos.push(`Produto '${errorData.produtoDescricao}': Quantidade insuficiente em estoque. Solicitado: ${errorData.quantidadeSolicitada || 'N/A'}, Disponível: ${errorData.quantidadeDisponivel || 'N/A'}`)
          } else {
            avisos.push(errorData.message)
          }
          
          // Se tiver ID da nota, retornar com avisos
          if (errorData.id) {
            const notaParcial = formatNotaFiscalFromResponse(errorData)
            return { ...notaParcial, avisosEstoque: avisos }
          }
        }
      }
      
      const message = error.response?.data?.message || error.message || 'Erro ao criar nota fiscal'
      throw new Error(message)
    }
  }

  async atualizar(id: string, data: NotaFiscalRequest): Promise<NotaFiscal> {
    try {
      const response = await api.put<any>(API_ENDPOINTS.notasFiscais.update(id), data)
      return formatNotaFiscalFromResponse(response.data)
    } catch (error: any) {
      // Se a resposta contém dados da nota (mesmo com erro), retornar formatada
      if (error.response?.data && error.response.data.id) {
        console.log('⚠️ Erro mas resposta contém dados da nota, formatando...')
        return formatNotaFiscalFromResponse(error.response.data)
      }
      
      // Se for erro de estoque insuficiente, tentar extrair informações
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Se contém avisos de estoque, criar uma nota parcial para exibir os avisos
        if (errorData.avisosEstoque && Array.isArray(errorData.avisosEstoque) && errorData.avisosEstoque.length > 0) {
          console.log('⚠️ Erro com avisos de estoque, retornando nota parcial')
          // Tentar construir uma resposta parcial com os avisos
          if (errorData.id) {
            return formatNotaFiscalFromResponse(errorData)
          }
        }
        
        // Se for erro de estoque insuficiente específico, criar aviso
        if (errorData.message && errorData.message.includes('Quantidade insuficiente')) {
          const avisos: string[] = []
          if (errorData.produtoDescricao) {
            avisos.push(`Produto '${errorData.produtoDescricao}': Quantidade insuficiente em estoque. Solicitado: ${errorData.quantidadeSolicitada || 'N/A'}, Disponível: ${errorData.quantidadeDisponivel || 'N/A'}`)
          } else {
            avisos.push(errorData.message)
          }
          
          // Se tiver ID da nota, retornar com avisos
          if (errorData.id) {
            const notaParcial = formatNotaFiscalFromResponse(errorData)
            return { ...notaParcial, avisosEstoque: avisos }
          }
        }
      }
      
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar nota fiscal'
      throw new Error(message)
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.notasFiscais.delete(id))
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar nota fiscal')
    }
  }
}

export const notaFiscalService = new NotaFiscalService()

