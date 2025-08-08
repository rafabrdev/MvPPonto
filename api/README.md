# 🕐 MVP Ponto - Sistema de Ponto Eletrônico

[![NestJS](https://img.shields.io/badge/NestJS-11.x-red.svg)](https://nestjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

API REST para sistema de ponto eletrônico desenvolvida com NestJS, TypeScript, PostgreSQL e autenticação JWT.

## 🚀 Características

- ✅ **Autenticação JWT** com refresh tokens
- ✅ **Autorização baseada em roles** (Admin, Manager, User)
- ✅ **Registro de ponto** com validação de sequência lógica
- ✅ **Dashboard em tempo real** com horas trabalhadas
- ✅ **Gestão de expedientes** com horários personalizáveis
- ✅ **Histórico completo** de registros de ponto
- ✅ **Painel administrativo** para gestão de usuários
- ✅ **Validação robusta** de dados de entrada
- ✅ **Tratamento de erros** centralizado
- ✅ **Segurança** com Helmet e CORS
- ✅ **Containerização** com Docker
- ✅ **Seeder** para dados de exemplo

## 🛠 Tecnologias

### Backend
- **[NestJS](https://nestjs.com/)** - Framework Node.js para APIs escaláveis
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript tipado
- **[TypeORM](https://typeorm.io/)** - ORM para TypeScript/JavaScript
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[JWT](https://jwt.io/)** - Autenticação via JSON Web Tokens
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Hash de senhas
- **[class-validator](https://github.com/typestack/class-validator)** - Validação de dados

### DevOps & Tools
- **[Docker](https://www.docker.com/)** - Containerização
- **[pnpm](https://pnpm.io/)** - Gerenciador de pacotes
- **[ESLint](https://eslint.org/)** - Linter para JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** - Formatador de código
- **[Jest](https://jestjs.io/)** - Framework de testes

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **pnpm** (recomendado) ou npm
- **Docker** e **Docker Compose**
- **Git**

## 💻 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/rafabrdev/MvPPonto.git
cd MvPPonto/api
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Configure as variáveis de ambiente
O arquivo `.env` já está configurado com valores padrão:

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=mvpponto

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d
```

### 4. Inicie o banco de dados
```bash
# Iniciar PostgreSQL
docker-compose up -d postgres

# (Opcional) Iniciar PgAdmin para gerenciamento visual
docker-compose up -d pgadmin
```

### 5. Execute a aplicação
```bash
# Modo desenvolvimento (com hot reload)
pnpm start:dev
```

### 6. Popule o banco com dados de exemplo
```bash
# Executar seeder (em outro terminal)
pnpm run db:seed
```

## 🔧 Serviços Disponíveis

- **🚀 API**: http://localhost:3000
- **📊 Health Check**: http://localhost:3000/health
- **🔗 API Base**: http://localhost:3000/api/v1
- **🐘 pgAdmin**: http://localhost:8080
  - Email: admin@mvpponto.com
  - Senha: admin123
- **🗃️ PostgreSQL**: localhost:5432
  - Database: mvpponto
  - Username: postgres
  - Password: password

## 👤 Credenciais de Teste

Após executar o seeder (`pnpm run db:seed`):

| Tipo | Email | Senha | Role |
|------|-------|-------|------|
| Admin | admin@mvpponto.com | admin123 | admin |
| Gerente | pedro@mvpponto.com | manager123 | manager |
| Usuário | joao@mvpponto.com | user123 | user |
| Usuário | maria@mvpponto.com | user123 | user |

## 📡 API Endpoints

### Base URL: `http://localhost:3000/api/v1`

### 🔐 Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------||
| POST | `/auth/login` | Login do usuário |
| POST | `/auth/refresh` | Renovar token |
| GET | `/auth/me` | Dados do usuário atual |

### 👤 Usuários
| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------||
| GET | `/users/profile` | Perfil do usuário | Usuário |
| PUT | `/users/profile` | Atualizar perfil | Usuário |
| POST | `/users/admin` | Criar usuário | Admin |
| GET | `/users/admin` | Listar usuários | Admin |
| GET | `/users/admin/:id` | Buscar usuário | Admin |
| PUT | `/users/admin/:id` | Atualizar usuário | Admin |
| DELETE | `/users/admin/:id` | Deletar usuário | Admin |

### ⏱️ Registros de Ponto
| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------||
| POST | `/time-entries` | Registrar ponto | Usuário |
| GET | `/time-entries/dashboard` | Dashboard do dia | Usuário |
| GET | `/time-entries/history` | Histórico pessoal | Usuário |
| GET | `/time-entries/admin/history` | Histórico geral | Admin |

### 📅 Expedientes
| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------||
| POST | `/schedules` | Criar expediente | Usuário |
| GET | `/schedules` | Listar expedientes | Usuário |
| GET | `/schedules/:id` | Buscar expediente | Usuário |
| PUT | `/schedules/:id` | Atualizar expediente | Usuário |
| DELETE | `/schedules/:id` | Deletar expediente | Usuário |
| POST | `/schedules/admin/bulk` | Criar em lote | Admin |

## 📁 Estrutura do Projeto

```
src/
├── auth/                 # Módulo de autenticação
│   ├── dto/             # DTOs de autenticação
│   ├── guards/          # Guards JWT e roles
│   ├── strategies/      # Estratégias Passport
│   └── decorators/      # Decorators personalizados
├── users/               # Módulo de usuários
│   ├── dto/            # DTOs de usuário
│   └── entities/       # Entidade User
├── time-entries/        # Módulo de registros de ponto
│   ├── dto/            # DTOs de time entries
│   └── entities/       # Entidade TimeEntry
├── schedules/           # Módulo de expedientes
│   ├── dto/            # DTOs de schedules
│   └── entities/       # Entidade Schedule
├── common/              # Recursos compartilhados
│   ├── filters/        # Filtros de exceção
│   ├── pipes/          # Pipes de validação
│   └── middleware/     # Middlewares
├── seeds/              # Seeds do banco de dados
└── main.ts             # Arquivo principal
```

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm start:dev          # Iniciar em modo desenvolvimento
pnpm start:debug        # Iniciar com debug

# Build e Produção
pnpm build              # Build da aplicação
pnpm start              # Iniciar versão built
pnpm start:prod         # Iniciar em modo produção

# Database
pnpm run db:seed        # Executar seeds

# Qualidade de Código
pnpm lint               # Executar ESLint
pnpm format             # Formatar código com Prettier

# Testes
pnpm test               # Executar testes unitários
pnpm test:watch         # Testes em modo watch
pnpm test:cov           # Testes com coverage
pnpm test:e2e           # Testes end-to-end

# Git
pnpm commit             # Commit usando Commitizen
```

## 🐳 Comandos Docker Úteis

```bash
# Subir apenas PostgreSQL
docker-compose up -d postgres

# Subir todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs dos containers
docker-compose logs postgres

# Reiniciar o banco (limpa dados)
docker-compose down -v
docker-compose up -d postgres

# Acessar o banco via linha de comando
docker exec -it mvpponto-postgres psql -U postgres -d mvpponto
```

## 🗄️ Banco de Dados

### Entidades Principais

#### Users
- ID (UUID)
- Nome, Email, Senha (hash)
- Role (admin, manager, user)
- Timestamps

#### TimeEntries
- ID (UUID)
- Tipo (IN, OUT, LUNCH_OUT, LUNCH_IN)
- Timestamp do servidor
- Relação com User

#### Schedules
- ID (UUID)
- Data, Horário início/fim
- Horário almoço (opcional)
- Relação com User

O banco é criado automaticamente na primeira execução (modo synchronize ativo em desenvolvimento).

## 🔨 Desenvolvimento

### Padrões de Código
- Use **TypeScript** estrito
- Siga os padrões do **ESLint** configurado
- Formate código com **Prettier**
- Use **Commitizen** para commits padronizados

### Exemplo de Login via cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mvpponto.com",
    "password": "admin123"
  }'
```

### Exemplo de Registro de Ponto
```bash
# Primeiro, faça login e obtenha o token
# Depois use o token para registrar ponto
curl -X POST http://localhost:3000/api/v1/time-entries \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "IN"
  }'
```

## 🚀 Próximos Passos

1. **Frontend**: Criar interface web com React/Vue/Angular
2. **Mobile**: Desenvolver app mobile com React Native/Flutter
3. **Relatórios**: Implementar geração de relatórios
4. **Notificações**: Sistema de alertas e lembretes
5. **Biometria**: Integração com leitores biométricos
6. **Dashboard Analytics**: Painéis gerenciais avançados

## 📄 Licença

Este projeto está sob a licença MIT.
