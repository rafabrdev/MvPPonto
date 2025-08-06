# ⚙️ Guia de Instalação e Setup

Instruções detalhadas para configurar e executar o sistema MvPPonto.

## 🔧 Pré-requisitos

- **Node.js** v18 ou superior
- **pnpm** (gerenciador de pacotes recomendado)
- **PostgreSQL** (banco de dados)
- **Git** para versionamento

## 📦 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/rafabrdev/MvPPonto.git
cd MvPPonto/apps
```

### 2. Instale as dependências
```bash
# Instalar dependências do monorepo
pnpm install

# Instalar dependências específicas (opcional)
cd web && pnpm install
cd ../api && pnpm install
```

### 3. Configure o banco de dados
```bash
# No diretório api/
cp .env.example .env
# Edite o arquivo .env com suas configurações de banco
```

## 🚀 Executar o Projeto

### Frontend (web/)
```bash
cd web
pnpm dev          # Servidor de desenvolvimento
pnpm build        # Build de produção
pnpm preview      # Preview do build
```

### Backend (api/)
```bash
cd api
pnpm start:dev    # Desenvolvimento com watch
pnpm start        # Produção
pnpm build        # Build
```

## 🔧 Scripts Úteis

```bash
# Formatação e linting
pnpm lint         # Verificar código
pnpm format       # Formatar código

# Git com conventional commits
pnpm commit       # Commit interativo
```

## 🐳 Docker (Opcional)

```bash
# Build e execução com Docker
docker-compose up --build
```
