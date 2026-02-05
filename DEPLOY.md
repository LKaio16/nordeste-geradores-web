# 🚀 Guia de Deploy - Nordeste Geradores Web

## Preparação para GitHub

### 1. Configurar o repositório remoto

```bash
cd nordeste-geradores-front
git remote add origin https://github.com/LKaio16/nordeste-geradores-web.git
git branch -M main
```

### 2. Criar arquivo .env.example

Crie um arquivo `.env.example` na raiz do projeto com:

```env
# URL da API Backend
# Para desenvolvimento local:
# VITE_API_URL=http://localhost:8080

# Para usar com ngrok (substitua pela sua URL do ngrok):
# VITE_API_URL=https://seu-subdominio.ngrok-free.app
```

### 3. Fazer commit e push inicial

```bash
git add .
git commit -m "Initial commit: Frontend Nordeste Geradores"
git push -u origin main
```

## 🔧 Configuração com Ngrok

### Passo a passo:

1. **Inicie o backend localmente** na porta 8080

2. **Inicie o ngrok:**
```bash
ngrok http 8080
```

3. **Copie a URL HTTPS** fornecida (ex: `https://abc123.ngrok-free.app`)

4. **Crie o arquivo `.env`** na raiz do projeto:
```env
VITE_API_URL=https://abc123.ngrok-free.app
```

5. **Reinicie o servidor de desenvolvimento:**
```bash
npm run dev
```

## 📦 Deploy no GitHub Pages

### Opção 1: Deploy Automático (GitHub Actions)

O workflow já está configurado em `.github/workflows/deploy.yml`.

1. **Configure o secret no GitHub:**
   - Vá em Settings > Secrets and variables > Actions
   - Adicione `VITE_API_URL` com a URL do seu backend (ngrok ou produção)

2. **Faça push para main:**
```bash
git push origin main
```

3. **Habilite GitHub Pages:**
   - Vá em Settings > Pages
   - Source: selecione "GitHub Actions"

### Opção 2: Deploy Manual

1. **Instale o plugin:**
```bash
npm install --save-dev vite-plugin-gh-pages
```

2. **Atualize `vite.config.ts`:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import ghPages from 'vite-plugin-gh-pages'

export default defineConfig({
  plugins: [react(), ghPages()],
  base: '/nordeste-geradores-web/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // ... outros aliases
    },
  },
})
```

3. **Build e deploy:**
```bash
npm run build
npx gh-pages -d dist
```

## ⚠️ Tratamento de Resposta do Ngrok

O frontend está preparado para detectar a resposta HTML padrão do ngrok (página de verificação). Quando isso acontecer, você verá uma mensagem de erro clara indicando que a URL da API precisa ser verificada.

## 🔍 Verificações

- ✅ Interceptor do Axios detecta respostas HTML
- ✅ Variável de ambiente `VITE_API_URL` configurada
- ✅ `.env.example` criado (você precisa criar manualmente)
- ✅ `.gitignore` configurado para ignorar `.env`
- ✅ Workflow do GitHub Actions configurado

## 📝 Próximos Passos

1. Crie o arquivo `.env.example` manualmente
2. Configure o repositório remoto
3. Faça o commit inicial
4. Configure o ngrok e teste localmente
5. Faça o deploy no GitHub Pages



