# 📋 GUIA COMPLETO DE TESTES - MvPPonto API

## 🎯 Visão Geral

Este guia contém todas as instruções necessárias para executar, criar e manter os testes da API MvPPonto. Nossa suite de testes inclui testes unitários, testes de integração (E2E) e ferramentas de validação de qualidade.

## 📁 Estrutura de Testes

```
api/
├── src/                        # Código fonte
│   ├── **/*.spec.ts           # Testes unitários (junto ao código)
│   ├── auth/auth.service.spec.ts
│   └── users/users.service.spec.ts
├── test/                       # Configuração de testes E2E
│   ├── auth.e2e-spec.ts       # Testes end-to-end de autenticação
│   ├── setup.ts               # Setup global para testes unitários
│   ├── setup-e2e.ts           # Setup para testes E2E
│   └── jest-e2e.json          # Configuração Jest para E2E
├── coverage/                   # Relatórios de cobertura (gerado)
└── jest.config.js             # Configuração Jest principal
```

## 🚀 Guia de Execução

### 1. Preparação do Ambiente

```bash
# Navegar para a pasta da API
cd api

# Garantir que dependências estão instaladas
pnpm install

# Subir o banco PostgreSQL
docker-compose up -d postgres

# Aguardar o banco inicializar (5-10 segundos)
# Criar banco de testes
docker-compose exec postgres createdb -U postgres mvpponto_test
```

### 2. Testes Unitários

```bash
# Executar todos os testes unitários
pnpm test

# Executar com watch mode (reexecuta ao mudar arquivo)
pnpm test:watch

# Executar testes com relatório de cobertura
pnpm test:cov

# Executar teste específico
pnpm test auth.service.spec.ts

# Executar testes em modo verbose (mais detalhes)
pnpm test --verbose

# Limpar cache do Jest
pnpm test --clearCache
```

### 3. Testes E2E (End-to-End)

```bash
# Executar todos os testes E2E
pnpm test:e2e

# Executar E2E com logs detalhados
pnpm test:e2e --verbose

# Executar E2E específico
pnpm test:e2e --testNamePattern="login"
```

### 4. Pipeline Completa de Testes

```bash
# Executar lint, format e testes (pipeline CI/CD)
pnpm lint && pnpm format && pnpm test && pnpm test:e2e

# Validar cobertura com threshold mínimo
pnpm test:cov --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

## 🧪 Testes Manuais da API

### Subindo a Aplicação

```bash
# Subir API em modo desenvolvimento
pnpm start:dev

# A API estará disponível em: http://localhost:3000
# Health check: http://localhost:3000/health
# Base da API: http://localhost:3000/api/v1
```

### Testando com PowerShell/cURL

```powershell
# Teste de saúde
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get

# Login
$loginBody = @{
    email = "admin@mvpponto.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.accessToken

# Obter perfil (usando token)
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/me" -Method Get -Headers $headers

# Registrar ponto
$timeEntryBody = @{ type = "IN" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/time-entries" -Method Post -Body $timeEntryBody -ContentType "application/json" -Headers $headers

# Ver dashboard
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/time-entries/dashboard" -Method Get -Headers $headers
```

### Testando com cURL (Linux/Mac/WSL)

```bash
# Teste de saúde
curl http://localhost:3000/health

# Login
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mvpponto.com","password":"admin123"}' | jq -r '.accessToken')

# Obter perfil
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Registrar ponto
curl -X POST http://localhost:3000/api/v1/time-entries \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"IN"}'

# Ver dashboard
curl -X GET http://localhost:3000/api/v1/time-entries/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Cobertura de Testes

### Status Atual
- **Testes Unitários**: ✅ 16 testes passando
- **Cobertura Global**: ~15.72%
- **Services Cobertos**: auth.service, users.service
- **E2E Tests**: ⚠️ Necessita configuração do banco de testes

### Metas de Cobertura
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Relatório de Cobertura

```bash
# Gerar relatório HTML de cobertura
pnpm test:cov

# Visualizar relatório (será gerado em coverage/lcov-report/index.html)
# Windows: start coverage/lcov-report/index.html
# Mac: open coverage/lcov-report/index.html
# Linux: xdg-open coverage/lcov-report/index.html
```

## 🧮 Dados de Teste

### Usuários Padrão (após db:seed)

```javascript
// Admin
{
  email: "admin@mvpponto.com",
  password: "admin123",
  role: "admin"
}

// Gerente
{
  email: "pedro@mvpponto.com",
  password: "manager123",
  role: "manager"
}

// Usuários
{
  email: "joao@mvpponto.com",
  password: "user123",
  role: "user"
}
{
  email: "maria@mvpponto.com",
  password: "user123",
  role: "user"
}
```

### Criando Dados de Teste

```bash
# Criar dados iniciais (seeds)
pnpm run db:seed

# Resetar banco e recriar dados
docker-compose exec postgres psql -U postgres -d mvpponto -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pnpm run db:seed
```

## ✅ Checklist de Testes Essenciais

### Funcionalidades Críticas que Devem Passar:

- [ ] **Health Check**: `GET /health` responde com status 200
- [ ] **Autenticação**:
  - [ ] Login com credenciais válidas retorna token
  - [ ] Login com credenciais inválidas retorna 401
  - [ ] Endpoints protegidos exigem token válido
  - [ ] Token refresh funciona corretamente
- [ ] **Usuários**:
  - [ ] Admin user é criado automaticamente
  - [ ] Perfil do usuário é retornado corretamente
  - [ ] CRUD de usuários funciona (admin only)
- [ ] **Registros de Ponto**:
  - [ ] Sequência de ponto funciona: IN → LUNCH_OUT → LUNCH_IN → OUT
  - [ ] Dashboard calcula horas trabalhadas corretamente
  - [ ] Histórico é listado corretamente
  - [ ] Validações impedem registros inválidos
- [ ] **Expedientes**:
  - [ ] CRUD de expedientes funciona
  - [ ] Criação em lote funciona (admin)
- [ ] **Segurança**:
  - [ ] Roles são respeitadas (user/manager/admin)
  - [ ] Rate limiting funciona
  - [ ] Validação de dados funciona
  - [ ] Timestamps são sempre do servidor

## 🚨 Troubleshooting

### Problemas Comuns e Soluções

#### Testes Unitários Falhando

```bash
# 1. Limpar cache do Jest
pnpm test --clearCache

# 2. Verificar dependências
pnpm install

# 3. Verificar configurações Jest
cat jest.config.js
```

#### Testes E2E Falhando

```bash
# 1. Verificar se PostgreSQL está rodando
docker-compose ps postgres

# 2. Criar banco de testes se não existir
docker-compose exec postgres createdb -U postgres mvpponto_test

# 3. Verificar variáveis de ambiente
cat .env

# 4. Verificar se porta 3000 não está ocupada
netstat -an | findstr :3000  # Windows
lsof -i :3000                # Linux/Mac
```

#### Cobertura Baixa

```bash
# 1. Identificar arquivos não cobertos
pnpm test:cov

# 2. Adicionar testes para:
# - Controllers (endpoints)
# - Services (lógica de negócio)
# - Guards (autenticação/autorização)
# - Pipes (validação)

# 3. Executar testes específicos
pnpm test --collectCoverageFrom="src/auth/**/*.ts"
```

#### Banco de Dados

```bash
# Resetar banco completamente
docker-compose down
docker-compose up -d postgres

# Aguardar inicialização
sleep 10

# Criar banco de testes
docker-compose exec postgres createdb -U postgres mvpponto_test

# Recriar dados de exemplo
pnpm run db:seed
```

#### Problemas de Conexão

```bash
# Verificar se serviços estão rodando
docker-compose ps

# Ver logs do PostgreSQL
docker-compose logs postgres

# Testar conexão direta
docker-compose exec postgres psql -U postgres -l
```

## 🛠️ Configurações Avançadas

### Variáveis de Ambiente para Testes

Crie um arquivo `.env.test` se necessário:

```env
NODE_ENV=test
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=mvpponto_test
JWT_SECRET=test-secret-key
JWT_EXPIRES_IN=1h
```

### Configuração de CI/CD

```yaml
# .github/workflows/test.yml (exemplo)
- name: Run Tests
  run: |
    cd api
    docker-compose up -d postgres
    sleep 10
    docker-compose exec -T postgres createdb -U postgres mvpponto_test
    pnpm install
    pnpm test
    pnpm test:e2e
```

### Scripts Personalizados

Adicione ao `package.json`:

```json
{
  "scripts": {
    "test:unit": "jest --testPathIgnorePatterns=e2e",
    "test:integration": "jest --testPathPattern=e2e",
    "test:watch:coverage": "jest --watch --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

## 📈 Melhorias Futuras

### Próximos Passos

1. **Aumentar Cobertura**: Atingir 80% em todas as métricas
2. **Mais Testes E2E**: Cobrir todos os endpoints principais
3. **Testes de Performance**: Implementar testes de carga
4. **Mocks Avançados**: Mockar serviços externos
5. **Testes de Segurança**: Validar vulnerabilidades

### Ferramentas Recomendadas

- **Postman/Insomnia**: Para testes manuais da API
- **Newman**: Para automatizar coleções Postman
- **Artillery**: Para testes de carga
- **SonarQube**: Para análise de qualidade de código
- **Dependabot**: Para atualização automática de dependências

---

## 📞 Suporte

Para problemas com testes:
1. Verifique este README
2. Consulte logs de erro detalhados
3. Execute troubleshooting específico
4. Abra issue no repositório se necessário

**Happy Testing! 🧪✨**
