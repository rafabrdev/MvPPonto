# MvPPonto - Sistema de Ponto Eletrônico

## 🚀 Sobre o Projeto

Sistema moderno de controle de ponto eletrônico desenvolvido com as melhores práticas de desenvolvimento.

## 📋 Tecnologias

### Frontend (web/)
- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna
- **Tailwind CSS v4** - Framework CSS utilitário
- **React Query** - Gerenciamento de estado servidor
- **React Hook Form + Zod** - Formulários e validação
- **Zustand** - Gerenciamento de estado local

### Backend (api/)
- **NestJS** - Framework Node.js progressivo
- **TypeScript** - Tipagem estática
- **TypeORM** - ORM para TypeScript/JavaScript
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas

## 🛠️ Ferramentas de Desenvolvimento

- **ESLint + Prettier** - Qualidade e formatação de código
- **Husky + Commitizen** - Git hooks e commits padronizados
- **pnpm** - Gerenciador de pacotes rápido
- **VS Code** - Editor com configurações compartilhadas

## 📦 Estrutura do Projeto

```
apps/
├── web/                 # Frontend React
├── api/                 # Backend NestJS
├── docs/                # Documentação
├── .vscode/             # Configurações VS Code
├── .husky/              # Git hooks
└── shared configs       # Configurações compartilhadas
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- pnpm
- PostgreSQL

### Instalação
```bash
# Instalar dependências
pnpm install

# Frontend
cd web
pnpm dev

# Backend
cd api
pnpm start:dev
```

## 📝 Scripts Disponíveis

### Frontend (web/)
- `pnpm dev` - Servidor de desenvolvimento
- `pnpm build` - Build de produção
- `pnpm lint` - Verificar código
- `pnpm format` - Formatar código

### Backend (api/)
- `pnpm start:dev` - Servidor de desenvolvimento
- `pnpm build` - Build de produção
- `pnpm lint` - Verificar código
- `pnpm format` - Formatar código

## 🔄 Git Workflow

- `main` - Produção (sempre estável)
- `develop` - Desenvolvimento principal
- `feat/nome` - Novas funcionalidades
- `fix/nome` - Correções de bugs
- `hotfix/nome` - Correções urgentes

## 📖 Documentação

- [📋 Guia de Testes](./docs/TESTS.md) - Guia completo para executar e manter testes
- [🔄 Git Workflow](./docs/GIT_WORKFLOW.md) - Boas práticas de versionamento
- [📚 Documentação API](./api/docs/) - Documentação da API

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua funcionalidade:
   ```bash
   git checkout -b feat/amazing-feature
   ```
3. Commit suas mudanças:
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
4. Push para a branch:
   ```bash
   git push origin feat/amazing-feature
   ```
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
