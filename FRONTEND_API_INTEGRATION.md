# Guia de Integração Frontend x API – MvPPonto

Este guia foi feito para permitir que alguém desenvolva o frontend e integre com a API do MvPPonto sem precisar acessar o código da API. Contém visão geral do projeto, endpoints, contratos detalhados (campos, tipos, validações), autenticação, regras de negócio, exemplos de chamadas e respostas, tratamento de erros, paginação, CORS, e tudo que é necessário para chegar próximo de 100% de build e integração.

Sumário
- Visão Geral do Projeto
- Stack e Arquitetura
- Ambientes, Base URL e CORS
- Autenticação e Autorização
- Formato Padrão de Erros
- Convenções de Respostas de Sucesso
- Entidades e Modelos de Dados
- Endpoints da API (completo)
  - Auth
  - Users
  - Time Entries (Registros de ponto)
  - Schedules (Expedientes)
- Regras de Negócio Importantes
  - Sequência lógica de registros de ponto
  - Horas trabalhadas e status do dia
  - Padrões de horários (HH:mm)
  - Permissões por role
- Paginação e Filtros
- Exemplos de Integração no Frontend
  - Login, refresh e persistência de sessão
  - Fetch utilitário e interceptação de 401
  - Fluxos comuns (dashboard, registrar ponto, histórico, CRUD de usuário/admin)
- Dados de Desenvolvimento (seed) e Postman Collection
- Scripts e Execução (referência rápida)


Visão Geral do Projeto
- Nome: MvPPonto – Sistema de Ponto Eletrônico
- Objetivo: Controle de ponto com autenticação JWT, jornadas configuráveis (expedientes), dashboard diário, histórico e administração de usuários.

Stack e Arquitetura
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4
- Backend (API): NestJS 11 + TypeScript + TypeORM + PostgreSQL + JWT
- Testes: Jest (unit e e2e)
- Containerização: Docker (Postgres, PgAdmin)
- Gerenciador de pacotes: pnpm

Ambientes, Base URL e CORS
- Base URL da API (desenvolvimento): http://localhost:3000/api/v1
- CORS default autorizado (frontend local): http://localhost:5173
- Variáveis de ambiente relevantes (API):
  - PORT=3000
  - NODE_ENV=development
  - CORS_ORIGIN=http://localhost:5173
  - DATABASE_HOST=localhost, DATABASE_PORT=5432, DATABASE_USERNAME=postgres, DATABASE_PASSWORD=postgres, DATABASE_NAME=mvpponto
  - JWT_SECRET=<chave-secreta>
  - JWT_EXPIRES_IN=1h (token de acesso)
  - JWT_REFRESH_EXPIRES_IN=7d (token de refresh)

Autenticação e Autorização
- Autenticação baseada em JWT (Bearer Token):
  - Header: Authorization: Bearer <accessToken>
  - Access Token expira conforme JWT_EXPIRES_IN (ex.: 1h)
  - Refresh Token expira conforme JWT_REFRESH_EXPIRES_IN (ex.: 7d)
- Processo:
  1) POST /auth/login com email e password
  2) Recebe accessToken, refreshToken e os dados do usuário
  3) Enviar Authorization: Bearer <accessToken> em todas as requisições protegidas
  4) Se receber 401 por expiração, usar POST /auth/refresh com refreshToken para obter novos tokens
- Autorização por roles (ADMIN, MANAGER, USER):
  - Alguns endpoints exigem roles específicas (ver tabela dos endpoints)

Formato Padrão de Erros
- Todas as respostas de erro seguem o padrão (GlobalExceptionFilter):
  {
    "success": false,
    "message": string,
    "errors": any | null,
    "timestamp": string (ISO),
    "path": string,
    "method": string,
    "stack": string | null (apenas em development)
  }
- Validações (DTOs) retornam message: "Dados de entrada inválidos" e um array com detalhes:
  {
    "success": false,
    "message": "Dados de entrada inválidos",
    "errors": [
      {
        "property": "campo",
        "value": <valor_enviado>,
        "constraints": { "regra": "mensagem" }
      }
    ],
    ...
  }

Convenções de Respostas de Sucesso
- Em geral, os endpoints retornam:
  {
    "message": string,
    "data": <objeto|array>,
    "pagination": { page, limit, total, totalPages }? // quando aplicável
  }
- Alguns endpoints de criação retornam 201 (Created) e payload com objeto criado.
- Endpoints de deleção podem retornar 204 (No Content) sem body.

Entidades e Modelos de Dados
- User
  - id: string (UUID)
  - name: string
  - email: string (único)
  - passwordHash?: string (interno, não exposto em listagens comuns)
  - role: 'user' | 'manager' | 'admin'
  - createdAt: Date
  - updatedAt: Date

- TimeEntry
  - id: string (UUID)
  - userId: string (UUID)
  - type: 'IN' | 'LUNCH_OUT' | 'LUNCH_IN' | 'OUT'
  - timestamp: Date (sempre do servidor)
  - createdAt: Date

- Schedule
  - id: string (UUID)
  - userId: string (UUID)
  - date: string (formato ISO de data, ex.: 2025-08-08; armazenado como date)
  - startTime: string (HH:mm)
  - endTime: string (HH:mm)
  - lunchStart?: string (HH:mm)
  - lunchEnd?: string (HH:mm)
  - createdAt: Date
  - updatedAt: Date

Endpoints da API
Base URL: http://localhost:3000/api/v1
Content-Type: application/json (quando houver corpo)
Autenticação: enviar Authorization: Bearer <accessToken> nos endpoints protegidos

1) Auth
- POST /auth/login (público)
  - Body:
    {
      "email": string,
      "password": string
    }
  - 200 OK Response:
    {
      "accessToken": string,
      "refreshToken": string,
      "user": {
        "id": string,
        "name": string,
        "email": string,
        "role": "admin"|"manager"|"user"
      }
    }
  - Erros: 401 Credenciais inválidas

- POST /auth/refresh (público)
  - Body:
    { "refreshToken": string }
  - 200 OK Response: mesmo formato do /auth/login
  - Erros: 401 Token de refresh inválido

- GET /auth/me (protegido)
  - Header: Authorization: Bearer <accessToken>
  - 200 OK Response:
    { "id": string, "name": string, "email": string, "role": "admin"|"manager"|"user" }

2) Users
- GET /users/profile (protegido)
  - Retorna o perfil do usuário autenticado
  - 200 OK:
    { "message": "Perfil carregado com sucesso", "data": User }

- PUT /users/profile (protegido)
  - Body (campos opcionais; usuário comum não pode alterar role):
    {
      "name"?: string (min 2),
      "email"?: string (email válido),
      "password"?: string (min 6)
    }
  - 200 OK: { "message": "Perfil atualizado com sucesso", "data": User }

- POST /users/admin (protegido; Roles: ADMIN, MANAGER)
  - Body:
    {
      "name": string (min 2),
      "email": string (único),
      "password": string (min 6),
      "role"?: 'user'|'manager'|'admin'
    }
  - 201 Created: { "message": "Usuário criado com sucesso", "data": User }
  - 409 Conflito se email já em uso

- GET /users/admin (protegido; Roles: ADMIN, MANAGER)
  - Query (opcionais): role, search (nome ou email)
  - 200 OK:
    {
      "message": "Usuários carregados com sucesso",
      "data": User[],
      "total": number
    }

- GET /users/admin/:id (protegido; Roles: ADMIN, MANAGER)
  - 200 OK: { "message": "Usuário carregado com sucesso", "data": User }
  - 404 se não encontrado

- PUT /users/admin/:id (protegido; Roles: ADMIN)
  - Body (opcional): { name?, email?, password?, role? }
  - 200 OK: { "message": "Usuário atualizado com sucesso", "data": User }
  - 409 se email em uso; 404 se não encontrado

- DELETE /users/admin/:id (protegido; Roles: ADMIN)
  - 204 No Content
  - Regra: Admin não pode deletar a si mesmo (400)

3) Time Entries (Registros de Ponto)
- POST /time-entries (protegido)
  - Body:
    { "type": "IN" | "LUNCH_OUT" | "LUNCH_IN" | "OUT" }
  - 201 Created:
    {
      "message": "Ponto registrado com sucesso",
      "data": { "id": string, "type": string, "timestamp": string }
    }
  - Regras de sequência (ver seção de regras). Erros 400 em caso de sequência inválida.

- GET /time-entries/dashboard (protegido)
  - 200 OK:
    {
      "message": "Dashboard carregado com sucesso",
      "data": {
        "date": "YYYY-MM-DD",
        "entries": {
          "checkIn"?: string,
          "lunchOut"?: string,
          "lunchIn"?: string,
          "checkOut"?: string
        },
        "workingHours": {
          "worked": number,        // minutos trabalhados
          "remaining": number,     // minutos restantes (para expectedTotal)
          "expectedTotal": number  // minutos previstos (padrão 480; pode considerar expediente)
        },
        "status": "not_started" | "working" | "lunch" | "finished"
      }
    }

- GET /time-entries/history (protegido)
  - Query (opcionais):
    - startDate?: string (YYYY-MM-DD). Default: hoje-7dias
    - endDate?: string (YYYY-MM-DD). Default: hoje
    - page?: number (default 1)
    - limit?: number (default 10)
  - 200 OK:
    {
      "message": "Histórico carregado com sucesso",
      "data": [
        {
          "date": "YYYY-MM-DD",
          "entries": TimeEntry[]
        }
      ],
      "pagination": { "page": number, "limit": number, "total": number, "totalPages": number }
    }

- GET /time-entries/admin/history (protegido; Roles: ADMIN, MANAGER)
  - Query (opcionais): startDate, endDate, page, limit, userId?
  - 200 OK: mesmo formato do history normal, porém com opção de filtrar userId e abrangendo todos os usuários

4) Schedules (Expedientes)
- POST /schedules (protegido)
  - Body (CreateScheduleDto):
    {
      "date": string (YYYY-MM-DD),
      "startTime": string (HH:mm),
      "endTime": string (HH:mm),
      "lunchStart"?: string (HH:mm),
      "lunchEnd"?: string (HH:mm)
    }
  - Restrições:
    - startTime < endTime
    - Se lunchStart/lunchEnd fornecidos: lunchStart < lunchEnd e ambos dentro de [startTime, endTime]
    - Apenas um expediente por usuário por data (409 em caso de duplicidade)
  - 201 Created: { message, data: Schedule }

- GET /schedules (protegido)
  - Query (opcionais): startDate, endDate
  - Retorna expedientes do usuário autenticado
  - 200 OK: { message, data: Schedule[] }

- GET /schedules/default (protegido)
  - 200 OK: { message, data: { startTime: '08:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00' } }

- GET /schedules/:id (protegido)
  - 200 OK: { message, data: Schedule }
  - 404 se não encontrado

- PUT /schedules/:id (protegido)
  - Body (UpdateScheduleDto): quaisquer campos acima opcionais, com mesmas validações
  - 200 OK: { message, data: Schedule }

- DELETE /schedules/:id (protegido)
  - 204 No Content

- GET /schedules/admin/all (protegido; Roles: ADMIN, MANAGER)
  - Query (opcionais): startDate, endDate
  - 200 OK: { message, data: Schedule[] }

- GET /schedules/admin/user/:userId (protegido; Roles: ADMIN, MANAGER)
  - Query (opcionais): startDate, endDate
  - 200 OK: { message, data: Schedule[] }

- POST /schedules/admin/bulk (protegido; Roles: ADMIN, MANAGER)
  - Body (BulkScheduleDto):
    {
      "schedules": [
        {
          "userId": string (UUID),
          "date": "YYYY-MM-DD",
          "startTime": "HH:mm",
          "endTime": "HH:mm",
          "lunchStart"?: "HH:mm",
          "lunchEnd"?: "HH:mm"
        }, ...
      ]
    }
  - 201 Created: { message: "<n> expedientes criados com sucesso", data: Schedule[] }
  - Observações:
    - Valida se userId existe (400 se algum não existir)
    - Ignora criação se já houver expediente na mesma data para o userId

Regras de Negócio Importantes
- Sequência lógica dos registros de ponto:
  - Primeiro registro do dia DEVE ser IN
  - Transições válidas:
    - IN -> LUNCH_OUT | OUT
    - LUNCH_OUT -> LUNCH_IN
    - LUNCH_IN -> LUNCH_OUT | OUT
    - OUT -> IN (já no próximo dia)
  - Se tentar registrar fora da sequência válida ou após OUT no mesmo dia: 400
- Horas trabalhadas e status do dia (dashboard):
  - workingHours.expectedTotal: por padrão 480 min (8h). Se houver Schedule no dia, calcula diferença endTime-startTime menos almoço.
  - workingHours.worked: minutos efetivos considerando checkIn até checkOut, subtraindo intervalo de almoço se registrado.
  - workingHours.remaining: max(0, expectedTotal - worked)
  - status: not_started | working | lunch | finished
- Padrões de horários e datas:
  - Horas: HH:mm (24h, regex validado)
  - Datas: YYYY-MM-DD (ISO date)
- Permissões por role:
  - USER: endpoints comuns (ponto, perfil, próprias agendas)
  - MANAGER: pode acessar endpoints admin (listar/criar usuários, listar schedules, histórico admin)
  - ADMIN: pode tudo do manager + atualizar/deletar usuários

Paginação e Filtros
- History (time-entries) e History admin aceitam page e limit; retornam pagination no payload.
- Filtros por data com startDate e endDate (inclui o dia inteiro).
- Users admin aceita filtro por role e busca textual (search por nome/email).

Exemplos de Integração no Frontend
- Login
  fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  -> { accessToken, refreshToken, user }

- Refresh token (quando 401 por expiração)
  fetch(`${API}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })
  -> novos tokens + user

- Header padrão autenticado
  const authHeaders = (token) => ({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });

- Registrar ponto
  fetch(`${API}/time-entries`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ type: 'IN' | 'LUNCH_OUT' | 'LUNCH_IN' | 'OUT' })
  })

- Dashboard diário
  fetch(`${API}/time-entries/dashboard`, { headers: authHeaders(accessToken) })

- Histórico pessoal
  const qs = new URLSearchParams({ startDate, endDate, page: '1', limit: '10' });
  fetch(`${API}/time-entries/history?${qs}`, { headers: authHeaders(accessToken) })

- CRUD de usuário (admin/manager)
  - Criar:
    fetch(`${API}/users/admin`, {
      method: 'POST', headers: authHeaders(accessToken),
      body: JSON.stringify({ name, email, password, role })
    })
  - Listar:
    fetch(`${API}/users/admin?role=user&search=joao`, { headers: authHeaders(accessToken) })
  - Buscar por id:
    fetch(`${API}/users/admin/${id}`, { headers: authHeaders(accessToken) })
  - Atualizar:
    fetch(`${API}/users/admin/${id}`, { method: 'PUT', headers: authHeaders(accessToken), body: JSON.stringify(payload) })
  - Deletar:
    fetch(`${API}/users/admin/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }) // 204

- Expedientes
  - Criar (usuário):
    fetch(`${API}/schedules`, { method: 'POST', headers: authHeaders(accessToken), body: JSON.stringify({ date, startTime, endTime, lunchStart, lunchEnd }) })
  - Listar próprios:
    fetch(`${API}/schedules?startDate=2025-01-01&endDate=2025-01-31`, { headers: authHeaders(accessToken) })
  - Padrão:
    fetch(`${API}/schedules/default`, { headers: authHeaders(accessToken) })
  - Admin – listar todos:
    fetch(`${API}/schedules/admin/all?startDate=2025-01-01&endDate=2025-01-31`, { headers: authHeaders(accessToken) })
  - Admin – listar de um usuário:
    fetch(`${API}/schedules/admin/user/${userId}?startDate=...&endDate=...`, { headers: authHeaders(accessToken) })
  - Admin – criar em lote:
    fetch(`${API}/schedules/admin/bulk`, { method: 'POST', headers: authHeaders(accessToken), body: JSON.stringify({ schedules: [...] }) })

Tratamento de 401 e Interceptor de Refresh
- Estratégia sugerida para o frontend:
  1) Em cada requisição, se 401 e motivo for expiração, pausar fila de requisições, chamar /auth/refresh com o refreshToken armazenado.
  2) Atualizar tokens em memória/armazenamento seguro (não expor refreshToken no localStorage se possível, considerar cookies HttpOnly se aplicável ao ambiente).
  3) Repetir a requisição original com novo accessToken.
  4) Em caso de falha no refresh (401), redirecionar para login.

Dados de Desenvolvimento e Postman Collection
- Credenciais de teste (após seed):
  - Admin: admin@mvpponto.com / admin123
  - Manager: pedro@mvpponto.com / manager123
  - Usuário: joao@mvpponto.com / user123
  - Usuário: maria@mvpponto.com / user123
- Postman/Insomnia Collection: api/api-collection.json
  - Variável base_url: http://localhost:3000/api/v1
  - Executar Login, salvar access_token, testar demais rotas

Scripts e Execução (referência rápida)
- API (na pasta api/):
  - pnpm install
  - docker-compose up -d postgres (ou subir seu próprio PostgreSQL)
  - pnpm start:dev
  - pnpm run db:seed (popular dados de exemplo)
- Endpoints úteis:
  - Saúde: http://localhost:3000/health (quando configurado)
  - Base da API: http://localhost:3000/api/v1

Notas e Considerações
- Timestamp de registros de ponto sempre vem do servidor – ignore horas do cliente.
- Datas e horas: use ISO (YYYY-MM-DD) para datas e HH:mm para horas.
- CORS: ajuste CORS_ORIGIN na API conforme o host do frontend.
- Limitação de taxa (rate limit): há middlewares previstos no código para limitar requisições e tentativas de login; em produção recomenda-se usar Redis para rate limit persistente.
- Status HTTP comuns: 200, 201, 204, 400 (validação e regras), 401 (auth), 403 (role), 404 (não encontrado), 409 (conflito), 500 (erro interno).

Com isso, um time de frontend pode desenvolver telas, estados e flows sem ler o backend, baseando-se apenas nesses contratos e exemplos. Qualquer ajuste fino de copy/UX pode ser independente da API.

