# Git Workflow - Boas Práticas de Versionamento

## 📋 Estrutura de Branches

### 🌟 Branch Principal
- **`main`** - Produção (sempre estável, deployável)

### 🚧 Branch de Desenvolvimento  
- **`develop`** - Desenvolvimento principal (integração contínua)

### 🔧 Branches de Funcionalidades
- **`feat/nome-da-funcionalidade`** - Novas funcionalidades
- **`fix/nome-do-bug`** - Correções de bugs
- **`hotfix/nome-do-hotfix`** - Correções urgentes em produção

## 🔄 Fluxo de Trabalho

### 1. Criar nova funcionalidade:
```bash
git checkout develop
git pull origin develop
git checkout -b feat/login-system
# ... desenvolver ...
git add .
git commit -m "feat: add user login system"
git push origin feat/login-system
# Criar Pull Request para develop
```

### 2. Correção de bug:
```bash
git checkout develop  
git pull origin develop
git checkout -b fix/login-validation
# ... corrigir ...
git add .
git commit -m "fix: correct email validation in login"
git push origin fix/login-validation
# Criar Pull Request para develop
```

### 3. Hotfix em produção:
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix
# ... corrigir ...
git add .
git commit -m "fix: patch critical security vulnerability"
git push origin hotfix/critical-security-fix
# Criar Pull Request para main E develop
```

## 📝 Padrões de Commit (Conventional Commits)

### Tipos de commit:
- **`feat:`** - Nova funcionalidade
- **`fix:`** - Correção de bug
- **`docs:`** - Mudanças na documentação
- **`style:`** - Formatação, missing semi colons, etc
- **`refactor:`** - Refatoração de código
- **`test:`** - Adição ou correção de testes
- **`chore:`** - Tarefas de manutenção

### Exemplos:
```bash
feat: add user authentication system
fix: resolve email validation bug
docs: update API documentation
style: format code with prettier
refactor: improve database query performance
test: add unit tests for login component
chore: update dependencies
```

## ⚡ Comandos Úteis

### Aliases recomendados:
```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

### Comandos de uso frequente:
```bash
# Ver status detalhado
git status -s

# Ver histórico bonito
git log --oneline --graph --decorate --all

# Sincronizar com remoto
git fetch --all --prune

# Limpar branches locais que não existem no remoto
git branch -d $(git branch --merged | grep -v main | grep -v develop)
```

## 🔒 Regras de Proteção (Recomendadas)

### Branch main:
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Restrict pushes that create files larger than 100MB
- ✅ Require branches to be up to date

### Branch develop:
- ✅ Require pull request reviews  
- ✅ Require status checks to pass

## 📦 Integração com Ferramentas

### Husky (já configurado):
- ✅ Pre-commit: ESLint + Prettier
- ✅ Commit-msg: Conventional commits

### VS Code + GitLens:
- ✅ Blame annotations
- ✅ File history
- ✅ Branch comparisons
- ✅ Merge conflict resolution
