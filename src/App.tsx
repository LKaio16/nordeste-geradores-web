import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute'
import { NivelAcesso } from './types'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './features/auth/pages/LoginPage'
import { DashboardPage } from './features/dashboard/pages/DashboardPage'
import { ClientesPage } from './features/clientes/pages/ClientesPage'
import { ClienteFormPage } from './features/clientes/pages/ClienteFormPage'
import { ClienteDetalhesPage } from './features/clientes/pages/ClienteDetalhesPage'
import { FornecedoresPage } from './features/fornecedores/pages/FornecedoresPage'
import { FornecedorFormPage } from './features/fornecedores/pages/FornecedorFormPage'
import { FornecedorDetalhesPage } from './features/fornecedores/pages/FornecedorDetalhesPage'
import { GeradoresPage } from './features/geradores/pages/GeradoresPage'
import { LocacoesPage } from './features/locacoes/pages/LocacoesPage'
import { OrdensServicoPage } from './features/ordens-servico/pages/OrdensServicoPage'
import { ContasPage } from './features/financeiro/pages/ContasPage'
import { ContaFormPage } from './features/financeiro/pages/ContaFormPage'
import { ContaDetalhesPage } from './features/financeiro/pages/ContaDetalhesPage'
import { RelatoriosFinanceirosPage } from './features/financeiro/pages/RelatoriosFinanceirosPage'
import { EstoquePage } from './features/estoque/pages/EstoquePage'
import { ProdutosPage } from './features/produtos/pages/ProdutosPage'
import { PropostasPage } from './features/propostas/pages/PropostasPage'
import { UsuariosPage } from './features/usuarios/pages/UsuariosPage'
import { UsuarioFormPage } from './features/usuarios/pages/UsuarioFormPage'
import { UsuarioDetalhesPage } from './features/usuarios/pages/UsuarioDetalhesPage'
import { ConfiguracoesPage } from './features/configuracoes/pages/ConfiguracoesPage'
import { NotasFiscaisPage } from './features/notas-fiscais/pages/NotasFiscaisPage'
import { NotaFiscalDetalhesPage } from './features/notas-fiscais/pages/NotaFiscalDetalhesPage'
import { NotaFiscalFormPage } from './features/notas-fiscais/pages/NotaFiscalFormPage'
import { EstoqueDetalhesPage } from './features/estoque/pages/EstoqueDetalhesPage'
import { EstoqueMovimentacaoPage } from './features/estoque/pages/EstoqueMovimentacaoPage'
import { ProdutoDetalhesPage } from './features/produtos/pages/ProdutoDetalhesPage'
import { ProdutoFormPage } from './features/produtos/pages/ProdutoFormPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="clientes/novo" element={<ClienteFormPage />} />
            <Route path="clientes/:id" element={<ClienteDetalhesPage />} />
            <Route path="clientes/:id/editar" element={<ClienteFormPage />} />
            <Route path="fornecedores" element={<FornecedoresPage />} />
            <Route path="fornecedores/novo" element={<FornecedorFormPage />} />
            <Route path="fornecedores/:id" element={<FornecedorDetalhesPage />} />
            <Route path="fornecedores/:id/editar" element={<FornecedorFormPage />} />
            <Route path="geradores" element={<GeradoresPage />} />
            <Route path="locacoes" element={<LocacoesPage />} />
            <Route path="ordens-servico" element={<OrdensServicoPage />} />
            <Route path="contas" element={<ContasPage />} />
            <Route path="contas/novo" element={<ContaFormPage />} />
            <Route path="contas/:id" element={<ContaDetalhesPage />} />
            <Route path="contas/:id/editar" element={<ContaFormPage />} />
            <Route path="relatorios-financeiros" element={<RelatoriosFinanceirosPage />} />
            <Route path="estoque" element={<EstoquePage />} />
            <Route path="estoque/movimentacao" element={<EstoqueMovimentacaoPage />} />
            <Route path="estoque/:id" element={<EstoqueDetalhesPage />} />
            <Route path="produtos" element={<ProdutosPage />} />
            <Route path="produtos/novo" element={<ProdutoFormPage />} />
            <Route path="produtos/:id" element={<ProdutoDetalhesPage />} />
            <Route path="produtos/:id/editar" element={<ProdutoFormPage />} />
            <Route path="propostas" element={<PropostasPage />} />
            <Route
              path="usuarios"
              element={
                <RoleProtectedRoute allowedRoles={[NivelAcesso.ADMIN, NivelAcesso.GERENTE]}>
                  <UsuariosPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="usuarios/novo"
              element={
                <RoleProtectedRoute allowedRoles={[NivelAcesso.ADMIN, NivelAcesso.GERENTE]}>
                  <UsuarioFormPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="usuarios/:id"
              element={
                <RoleProtectedRoute allowedRoles={[NivelAcesso.ADMIN, NivelAcesso.GERENTE]}>
                  <UsuarioDetalhesPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="usuarios/:id/editar"
              element={
                <RoleProtectedRoute allowedRoles={[NivelAcesso.ADMIN, NivelAcesso.GERENTE]}>
                  <UsuarioFormPage />
                </RoleProtectedRoute>
              }
            />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
            <Route path="notas-entrada" element={<NotasFiscaisPage />} />
            <Route path="notas-entrada/nova" element={<NotaFiscalFormPage />} />
            <Route path="notas-entrada/:id" element={<NotaFiscalDetalhesPage />} />
            <Route path="notas-entrada/:id/editar" element={<NotaFiscalFormPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

