# 🔧 Configuração do Vercel - Nordeste Geradores

## ⚠️ Problema Comum: Login não funciona

Se o login não está funcionando no Vercel, o problema mais comum é que a variável de ambiente `VITE_API_URL` não está configurada.

## 📋 Passo a Passo para Configurar

### 1. Acesse o Dashboard do Vercel

1. Vá para [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto `nordeste-geradores-web`

### 2. Configure a Variável de Ambiente

1. Vá em **Settings** > **Environment Variables**
2. Clique em **Add New**
3. Configure:
   - **Name**: `VITE_API_URL`
   - **Value**: URL do seu backend
     - Se usar ngrok: `https://seu-subdominio.ngrok-free.app`
     - Se tiver backend em produção: `https://seu-backend.com`
   - **Environment**: Selecione todas as opções (Production, Preview, Development)
4. Clique em **Save**

### 3. Faça um Novo Deploy

Após adicionar a variável de ambiente:

1. Vá em **Deployments**
2. Clique nos três pontos (...) do último deployment
3. Selecione **Redeploy**
4. Ou faça um novo commit e push (o Vercel fará deploy automático)

## 🔍 Verificações

### Verificar se a variável está configurada:

1. No Vercel, vá em **Settings** > **Environment Variables**
2. Verifique se `VITE_API_URL` está listada
3. Verifique se está habilitada para **Production**

### Verificar no Console do Navegador:

1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Procure por erros de CORS ou "Network Error"
4. Verifique se a URL da API está correta nas requisições

### Verificar a URL da API no código:

O código usa:
```typescript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
```

Se `VITE_API_URL` não estiver configurada, usará `localhost:8080`, que não funciona em produção.

## 🐛 Troubleshooting

### Erro: "Bad credentials"
- ✅ Verifique se `VITE_API_URL` está configurada no Vercel
- ✅ Verifique se a URL está correta (sem barra no final)
- ✅ Verifique se o backend está acessível pela URL configurada
- ✅ Verifique se o usuário existe no banco de dados

### Erro: CORS
- Configure o CORS no backend para aceitar requisições do domínio do Vercel
- Exemplo: `https://nordeste-geradores-web.vercel.app`

### Erro: Network Error
- Verifique se a URL do backend está correta
- Verifique se o backend está rodando e acessível
- Se usar ngrok, verifique se o túnel está ativo

## 📝 Exemplo de Configuração

```
Name: VITE_API_URL
Value: https://abc123.ngrok-free.app
Environments: ☑ Production ☑ Preview ☑ Development
```

## ⚡ Dica Rápida

Após configurar a variável de ambiente, **sempre faça um novo deploy** para que as mudanças tenham efeito!



