// Enums
export enum NivelAcesso {
  ADMIN = 'ADMIN',
  GERENTE = 'GERENTE',
  FINANCEIRO = 'FINANCEIRO',
  TECNICO = 'TECNICO',
  OPERACIONAL = 'OPERACIONAL',
}

export enum StatusUsuario {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export enum StatusCliente {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export enum StatusFornecedor {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export enum StatusGerador {
  DISPONIVEL = 'DISPONIVEL',
  LOCADO = 'LOCADO',
  MANUTENCAO = 'MANUTENCAO',
  INATIVO = 'INATIVO',
}

export enum TipoLocacao {
  MENSAL = 'MENSAL',
  DIARIA = 'DIARIA',
  EVENTO = 'EVENTO',
}

export enum StatusLocacao {
  ATIVA = 'ATIVA',
  ENCERRADA = 'ENCERRADA',
  CANCELADA = 'CANCELADA',
}

export enum TipoOrdemServico {
  ENTREGA = 'ENTREGA',
  RECOLHIMENTO = 'RECOLHIMENTO',
  MANUTENCAO = 'MANUTENCAO',
}

export enum StatusOrdemServico {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

export enum TipoConta {
  PAGAR = 'PAGAR',
  RECEBER = 'RECEBER',
}

export enum StatusConta {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  VENCIDO = 'VENCIDO',
}

export enum TipoNotaFiscal {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
}

export enum FormaPagamento {
  BOLETO = 'BOLETO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  PIX = 'PIX',
  CARTAO = 'CARTAO',
}

export enum TipoProposta {
  MENSAL = 'MENSAL',
  EVENTO = 'EVENTO',
}

export enum StatusProposta {
  RASCUNHO = 'RASCUNHO',
  ENVIADA = 'ENVIADA',
  APROVADA = 'APROVADA',
  RECUSADA = 'RECUSADA',
}

export enum CategoriaPropostaItem {
  GERADOR = 'GERADOR',
  CABOS = 'CABOS',
  FRETE = 'FRETE',
  SERVICO = 'SERVICO',
}

// Entities
export interface Usuario {
  id: string
  nome: string
  email: string
  telefone: string
  cargo: string
  nivelAcesso: NivelAcesso
  status: StatusUsuario
  dataAdmissao: string
  ultimoAcesso?: string
  foto?: string // URL da foto do perfil
  createdAt: string
  updatedAt: string
}

export interface Cliente {
  id: string
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  status: StatusCliente
  createdAt: string
  updatedAt: string
}

export interface Fornecedor {
  id: string
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  status: StatusFornecedor
  observacoes?: string
  createdAt: string
  updatedAt: string
}

export interface Gerador {
  id: string
  codigo: string
  modelo: string
  potencia: string
  numeroSerie: string
  marca: string
  anoFabricacao: number
  horimetro: number
  status: StatusGerador
  observacoes?: string
  createdAt: string
  updatedAt: string
}

export interface Locacao {
  id: string
  numero: string
  tipo: TipoLocacao
  clienteId: string
  geradorId: string
  dataInicio: string
  dataFim?: string
  valorMensal?: number
  valorDiario?: number
  valorTotal?: number
  status: StatusLocacao
  observacoes?: string
  cliente?: Cliente
  gerador?: Gerador
  createdAt: string
  updatedAt: string
}

export interface LocacaoRequest {
  clienteId: string
  geradorId: string
  tipo: TipoLocacao
  dataInicio: string
  dataFim?: string
  valorMensal: number
  status: StatusLocacao
  observacoes?: string
  horimetroInicial?: number
}

export interface OrdemServico {
  id: string
  numero: string
  tipo: TipoOrdemServico
  locacaoId: string
  geradorId: string
  tecnicoResponsavelId: string
  dataAgendada: string
  status: StatusOrdemServico
  observacoes?: string
  horimetroInicial?: number
  horimetroFinal?: number
  dataExecucao?: string
  assinaturaCliente?: boolean
  assinaturaDigital?: string
  locacao?: Locacao
  gerador?: Gerador
  tecnicoResponsavel?: Usuario
  fotos?: OrdemServicoFoto[]
  createdAt: string
  updatedAt: string
}

export interface OrdemServicoRequest {
  tipo: TipoOrdemServico
  locacaoId: string
  geradorId: string
  tecnicoResponsavelId: string
  dataAgendada: string
  status: StatusOrdemServico
  observacoes?: string
  horimetroInicial?: number
  horimetroFinal?: number
  assinaturaCliente?: boolean
  assinaturaDigital?: string
}

export interface OrdemServicoFoto {
  id: string
  ordemServicoId: string
  url: string
  tipo: string
  createdAt: string
}

export interface Conta {
  id: string
  tipo: TipoConta
  clienteId?: string
  fornecedorId?: string
  descricao: string
  valor: number
  dataVencimento: string
  dataPagamento?: string
  formaPagamento?: FormaPagamento
  status: StatusConta
  observacoes?: string
  categoria?: string
  categoriaFinanceira?: CategoriaFinanceira
  subcategoria?: string
  cliente?: Cliente
  fornecedor?: Fornecedor
  createdAt: string
  updatedAt: string
}

export interface ContaAuditoria {
  id: string
  contaId: string
  usuario: Usuario
  acao: string
  campoAlterado?: string
  valorAnterior?: string
  valorNovo?: string
  observacoes?: string
  dataAcao: string
}

export interface GeradorAuditoria {
  id: string
  geradorId: string
  usuarioId: string
  usuarioNome: string
  acao: string
  campoAlterado?: string
  valorAnterior?: string
  valorNovo?: string
  observacoes?: string
  dataAcao: string
}

export interface Produto {
  id: string
  descricao: string
  unidade: string
  precoUnitario: number
  categoria: string
  createdAt: string
  updatedAt: string
}

export enum TipoMovimentacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
}

export interface Estoque {
  id: string
  produto: Produto
  quantidade: number
  estoqueMinimo: number
  dataUltimaEntrada?: string
  createdAt: string
  updatedAt: string
}

export interface EstoqueMovimentacao {
  id: string
  estoqueId: string
  produto: Produto
  tipo: TipoMovimentacao
  quantidade: number
  observacao?: string
  notaFiscalId?: string
  ordemServicoId?: string
  data: string
  createdAt: string
}

export interface EstoqueRequest {
  produtoId: string
  quantidade: number
  estoqueMinimo: number
}

export interface EstoqueMovimentacaoRequest {
  estoqueId?: string
  produtoId?: string
  tipo: TipoMovimentacao
  quantidade: number
  observacao?: string
  notaFiscalId?: string
  ordemServicoId?: string
}

export interface NotaFiscalItem {
  id: string
  notaFiscalId: string
  produtoId?: string
  descricao: string
  quantidade: number
  valorUnitario: number
  desconto?: number
  valorTotal: number
  produto?: Produto
}

export interface NotaFiscal {
  id: string
  tipo: TipoNotaFiscal
  fornecedor: string
  cnpjEmpresa: string
  fornecedorId?: string
  clienteId?: string
  dataEmissao: string
  numeroNota: string
  valorTotal: number
  formaPagamento?: FormaPagamento
  itens: NotaFiscalItem[]
  createdAt: string
  updatedAt: string
}

// Request DTOs
export interface LoginRequest {
  email: string
  senha: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  usuario: Usuario
}

export interface ClienteRequest {
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  status: StatusCliente
}

export interface FornecedorRequest {
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  status: StatusFornecedor
  observacoes?: string
}

export interface GeradorRequest {
  codigo?: string
  modelo: string
  potencia: string
  numeroSerie: string
  marca: string
  anoFabricacao: number
  horimetro: number
  status: StatusGerador
  observacoes?: string
}

export interface NotaFiscalItemRequest {
  produtoId?: string
  descricao: string
  quantidade: number
  valorUnitario: number
  desconto?: number
}

export interface NotaFiscalRequest {
  fornecedorId?: string
  clienteId?: string
  tipo: TipoNotaFiscal
  fornecedor: string
  cnpjEmpresa: string
  dataEmissao: string
  numeroNota: string
  formaPagamento?: FormaPagamento
  itens: NotaFiscalItemRequest[]
}

export interface ProdutoRequest {
  descricao: string
  unidade: string
  precoUnitario: number
  categoria: string
  quantidadeInicial?: number
  estoqueMinimo?: number
}

export enum CategoriaFinanceira {
  OPERACIONAL = 'OPERACIONAL',
  INVESTIMENTO = 'INVESTIMENTO',
  FINANCIAMENTO = 'FINANCIAMENTO',
}

export interface ContaRequest {
  tipo: TipoConta
  clienteId?: string
  fornecedorId?: string
  descricao: string
  valor: number
  dataVencimento: string
  dataPagamento?: string
  formaPagamento?: FormaPagamento
  status: StatusConta
  observacoes?: string
  categoria?: string
  categoriaFinanceira?: CategoriaFinanceira
  subcategoria?: string
}

export interface PropostaItem {
  id: string
  categoria: CategoriaPropostaItem
  descricao: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
}

export interface Proposta {
  id: string
  numero: string
  cliente: Cliente
  tipo: TipoProposta
  dataEmissao: string
  validade: string
  observacoes?: string
  valorTotal: number
  status: StatusProposta
  formaPagamento?: string
  itens: PropostaItem[]
  createdAt: string
  updatedAt: string
}

export interface PropostaItemRequest {
  categoria: CategoriaPropostaItem
  descricao: string
  quantidade: number
  valorUnitario: number
}

export interface PropostaRequest {
  clienteId: string
  tipo: TipoProposta
  dataEmissao: string
  validade: string
  observacoes?: string
  status: StatusProposta
  formaPagamento?: string
  itens: PropostaItemRequest[]
}

export interface UsuarioRequest {
  nome: string
  email: string
  telefone: string
  cargo: string
  nivelAcesso: NivelAcesso
  status: StatusUsuario
  dataAdmissao: string
  senha?: string // Opcional para atualização
}

export interface MesRelatorio {
  mes: string
  mesAno: string
  totalEntradas: number
  recebimentoVendas: number
  recebimentoBoleto: number
  recebimentoTransferencia: number
  recebimentoPix: number
  outrosRecebimentos: number
  totalSaidas: number
  pagamentosFornecedores: number
  pagamentosDespesasVariaveis: number
  pagamentosImpostos: number
  pagamentosDespesasAdministrativas: number
  pagamentosDespesasPessoal: number
  pagamentosDespesasFinanceiras: number
  pagamentosCustosServicosTerceiros: number
  pagamentosDespesasManutencao: number
  pagamentosDespesasMarketing: number
  pagamentosItensNaoIdentificados: number
  caixaLiquidoOperacional: number
  percentualOperacional: number
  bonusRendimentos: number
  resgateAutomatico: number
  aplicacaoAutomatica: number
  aquisicoesAtivoImobilizado: number
  obrasReformas: number
  investimentos: number
  caixaLiquidoInvestimento: number
  percentualInvestimento: number
  recebimentoEmprestimo: number
  recebimentoSeguro: number
  recebimentoOutrasEmpresas: number
  ressarcimentoCliente: number
  pagamentosEmprestimos: number
  pagamentosFinanciamentos: number
  retiradaNordesteServico: number
  retiradaRentalCar: number
  retiradasSociosNServicos: number
  retiradasSocios: number
  caixaLiquidoFinanciamento: number
  percentualFinanciamento: number
  resultadoCaixaPeriodo: number
  percentualResultado: number
  transferenciaEntreContas: number
  saldoInicioPeriodo: number
  saldoFimPeriodo: number
}

export interface TotaisRelatorio {
  totalEntradas: number
  totalSaidas: number
  caixaLiquidoOperacional: number
  percentualOperacional: number
  caixaLiquidoInvestimento: number
  percentualInvestimento: number
  caixaLiquidoFinanciamento: number
  percentualFinanciamento: number
  resultadoCaixaPeriodo: number
  percentualResultado: number
}

export interface RelatorioFinanceiro {
  periodoInicio: string
  periodoFim: string
  meses: MesRelatorio[]
  totais: TotaisRelatorio
}



