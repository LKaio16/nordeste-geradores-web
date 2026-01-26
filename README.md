# Nordeste Geradores - Frontend Web

Frontend web da aplicação Nordeste Geradores, desenvolvido com React, TypeScript e Vite.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS
- **Framer Motion** - Animações
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js 18+ e npm/yarn/pnpm
- Backend da aplicação rodando (local ou via ngrok)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/LKaio16/nordeste-geradores-web.git
cd nordeste-geradores-web
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure a URL da API:
```env
# Para desenvolvimento local
VITE_API_URL=http://localhost:8080

# Para usar com ngrok
VITE_API_URL=https://seu-subdominio.ngrok-free.app
```

## 🏃 Executando

### Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção
```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

### Preview do Build
```bash
npm run preview
```

## 🌐 Configuração com Ngrok

O frontend está preparado para trabalhar com ngrok. Ao receber uma resposta HTML (página de verificação do ngrok), o sistema detecta e exibe um erro apropriado.

### Passos para usar com ngrok:

1. Inicie o backend localmente na porta 8080
2. Inicie o ngrok apontando para a porta 8080:
```bash
ngrok http 8080
```

3. Copie a URL HTTPS fornecida pelo ngrok (ex: `https://abc123.ngrok-free.app`)

4. Configure no arquivo `.env`:
```env
VITE_API_URL=https://abc123.ngrok-free.app
```

5. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 📦 Deploy

### GitHub Pages

1. Instale o plugin do Vite para GitHub Pages:
```bash
npm install --save-dev vite-plugin-gh-pages
```

2. Atualize o `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ghPages from 'vite-plugin-gh-pages'

export default defineConfig({
  plugins: [react(), ghPages()],
  base: '/nordeste-geradores-web/',
  // ... resto da configuração
})
```

3. Configure o workflow do GitHub Actions ou faça deploy manual:
```bash
npm run build
# Faça commit e push da pasta dist/
```

### Vercel / Netlify

1. Conecte o repositório à plataforma
2. Configure a variável de ambiente `VITE_API_URL`
3. O deploy será automático a cada push

## 🗂️ Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── features/       # Features da aplicação (páginas e lógica)
├── services/       # Serviços de API
├── types/          # Definições TypeScript
├── utils/          # Funções utilitárias
├── config/         # Configurações (API, etc)
└── contexts/       # Contextos React
```

## 🔐 Autenticação

A aplicação utiliza JWT para autenticação. Os tokens são armazenados no `localStorage` e automaticamente incluídos nas requisições.

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 🐛 Troubleshooting

### Erro: "Resposta HTML inesperada"
- Verifique se a URL da API está correta no `.env`
- Certifique-se de que o backend está rodando
- Se usar ngrok, verifique se a URL está atualizada

### Erro: "CORS"
- Configure o CORS no backend para aceitar requisições do frontend
- Se usar ngrok, adicione o domínio do ngrok nas configurações CORS

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Contribuidores

- Equipe Nordeste Geradores
