# MvPPonto API

API REST para sistema de controle de ponto desenvolvida com NestJS, TypeORM e PostgreSQL.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Docker** - Containerização

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- pnpm
- Docker Desktop
- Git

## 🛠️ Configuração do Ambiente de Desenvolvimento

### 1. Clone o repositório
```bash
git clone https://github.com/rafabrdev/MvPPonto.git
cd MvPPonto/apps/api
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
# As configurações padrão já funcionam para desenvolvimento local
```

### 4. Inicie os serviços Docker
```bash
# Iniciar PostgreSQL e pgAdmin
docker-compose -f .docker-compose.yml up -d

# Verificar se estão rodando
docker-compose -f .docker-compose.yml ps
```

### 5. Execute a aplicação
```bash
# Modo desenvolvimento
pnpm run start:dev

# Modo produção
pnpm run build
pnpm run start:prod
```

## 🔧 Serviços Disponíveis

- **API**: http://localhost:3000
- **pgAdmin**: http://localhost:8080
  - Email: admin@mvpponto.com
  - Senha: admin123
- **PostgreSQL**: localhost:5432
  - Database: mvpponto
  - Username: postgres
  - Password: postgres

## 📚 Estrutura da API

### Módulos
- **Auth** - Autenticação e autorização
- **Users** - Gerenciamento de usuários
- **TimeEntries** - Controle de ponto
- **Schedules** - Agendamentos

### Endpoints Principais
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar token
- `GET /users` - Listar usuários
- `POST /time-entries` - Registrar ponto
- `GET /schedules` - Listar agendamentos

## 🐳 Comandos Docker Úteis

```bash
# Parar todos os serviços
docker-compose -f .docker-compose.yml down

# Ver logs dos containers
docker-compose -f .docker-compose.yml logs

# Reiniciar apenas o PostgreSQL
docker-compose -f .docker-compose.yml restart postgres

# Acessar o banco via linha de comando
docker-compose -f .docker-compose.yml exec postgres psql -U postgres -d mvpponto
```

## 🗄️ Banco de Dados

O banco será criado automaticamente com as tabelas necessárias quando você iniciar a aplicação pela primeira vez (modo synchronize ativo em desenvolvimento).
