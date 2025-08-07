#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api/v1"
ACCESS_TOKEN=""

echo -e "${BLUE}🧪 Testando API MvPPonto${NC}"
echo "=================================="

# Função para fazer requisições
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=""
    
    if [[ ! -z "$ACCESS_TOKEN" ]]; then
        auth_header="-H 'Authorization: Bearer $ACCESS_TOKEN'"
    fi
    
    if [[ ! -z "$data" ]]; then
        eval "curl -s -X $method '$BASE_URL$endpoint' -H 'Content-Type: application/json' $auth_header -d '$data'"
    else
        eval "curl -s -X $method '$BASE_URL$endpoint' $auth_header"
    fi
}

# Teste 1: Health Check
echo -e "\n${YELLOW}1. Testando Health Check...${NC}"
response=$(curl -s "$BASE_URL/../health")
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Health Check OK${NC}"
    echo "Response: $response"
else
    echo -e "${RED}❌ Health Check Failed${NC}"
    exit 1
fi

# Teste 2: Login Admin
echo -e "\n${YELLOW}2. Fazendo login como Admin...${NC}"
login_data='{"email":"admin@mvpponto.com","password":"admin123"}'
login_response=$(make_request "POST" "/auth/login" "$login_data")

if echo "$login_response" | grep -q "accessToken"; then
    ACCESS_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Login realizado com sucesso${NC}"
    echo "Token obtido: ${ACCESS_TOKEN:0:20}..."
else
    echo -e "${RED}❌ Falha no login${NC}"
    echo "Response: $login_response"
    exit 1
fi

# Teste 3: Verificar perfil
echo -e "\n${YELLOW}3. Verificando perfil do usuário...${NC}"
profile_response=$(make_request "GET" "/auth/me")
if echo "$profile_response" | grep -q "admin@mvpponto.com"; then
    echo -e "${GREEN}✅ Perfil carregado com sucesso${NC}"
else
    echo -e "${RED}❌ Falha ao carregar perfil${NC}"
    echo "Response: $profile_response"
fi

# Teste 4: Registrar ponto (entrada)
echo -e "\n${YELLOW}4. Registrando ponto (entrada)...${NC}"
checkin_data='{"type":"IN"}'
checkin_response=$(make_request "POST" "/time-entries" "$checkin_data")
if echo "$checkin_response" | grep -q "Ponto registrado"; then
    echo -e "${GREEN}✅ Ponto registrado com sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  Ponto pode já ter sido registrado hoje${NC}"
    echo "Response: $checkin_response"
fi

# Teste 5: Ver dashboard
echo -e "\n${YELLOW}5. Carregando dashboard...${NC}"
dashboard_response=$(make_request "GET" "/time-entries/dashboard")
if echo "$dashboard_response" | grep -q "Dashboard carregado"; then
    echo -e "${GREEN}✅ Dashboard carregado com sucesso${NC}"
    echo "Response: $dashboard_response"
else
    echo -e "${RED}❌ Falha ao carregar dashboard${NC}"
    echo "Response: $dashboard_response"
fi

# Teste 6: Criar usuário
echo -e "\n${YELLOW}6. Criando usuário de teste...${NC}"
create_user_data='{"name":"Usuario Teste","email":"test@mvpponto.com","password":"test123","role":"user"}'
create_user_response=$(make_request "POST" "/users/admin" "$create_user_data")
if echo "$create_user_response" | grep -q "Usuário criado"; then
    echo -e "${GREEN}✅ Usuário criado com sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  Usuário pode já existir${NC}"
    echo "Response: $create_user_response"
fi

# Teste 7: Listar usuários
echo -e "\n${YELLOW}7. Listando usuários...${NC}"
users_response=$(make_request "GET" "/users/admin")
if echo "$users_response" | grep -q "Usuários carregados"; then
    echo -e "${GREEN}✅ Lista de usuários carregada${NC}"
    user_count=$(echo "$users_response" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "Total de usuários: $user_count"
else
    echo -e "${RED}❌ Falha ao carregar usuários${NC}"
    echo "Response: $users_response"
fi

# Teste 8: Criar expediente
echo -e "\n${YELLOW}8. Criando expediente...${NC}"
tomorrow=$(date -d "+1 day" +%Y-%m-%d)
schedule_data="{\"date\":\"$tomorrow\",\"startTime\":\"08:00\",\"endTime\":\"17:00\",\"lunchStart\":\"12:00\",\"lunchEnd\":\"13:00\"}"
schedule_response=$(make_request "POST" "/schedules" "$schedule_data")
if echo "$schedule_response" | grep -q "Expediente criado"; then
    echo -e "${GREEN}✅ Expediente criado com sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  Expediente pode já existir para esta data${NC}"
    echo "Response: $schedule_response"
fi

# Teste 9: Rate Limiting
echo -e "\n${YELLOW}9. Testando rate limiting (fazendo 10 requisições rápidas)...${NC}"
rate_limit_passed=true
for i in {1..10}; do
    response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/../health")
    if [[ "$response" == "429" ]]; then
        echo -e "${GREEN}✅ Rate limiting funcionando (bloqueou na requisição $i)${NC}"
        rate_limit_passed=true
        break
    fi
    sleep 0.1
done

if [[ "$rate_limit_passed" != true ]]; then
    echo -e "${YELLOW}⚠️  Rate limiting não foi ativado (normal para poucos requests)${NC}"
fi

echo -e "\n${BLUE}🎉 Testes da API concluídos!${NC}"
echo "=================================="
echo -e "${GREEN}✅ Resumo dos testes realizados:${NC}"
echo "  - Health Check"
echo "  - Autenticação (Login/Profile)"
echo "  - Registro de Ponto"
echo "  - Dashboard"
echo "  - CRUD de Usuários"
echo "  - CRUD de Expedientes"
echo "  - Rate Limiting"

echo -e "\n${YELLOW}💡 Para testar completamente:${NC}"
echo "  1. Execute os testes unitários: pnpm test"
echo "  2. Execute os testes E2E: pnpm test:e2e"
echo "  3. Use Insomnia/Postman com a coleção fornecida"
echo "  4. Teste no frontend quando estiver pronto"