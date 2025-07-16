# 🐳 Docker Setup - Desafio Fullstack

Ambiente completamente dockerizado com PostgreSQL + Backend NestJS + Frontend Next.js

## 🚀 Quick Start

### **Primeira vez (setup completo):**
```bash
# 1. Clone o repositório
git clone <repo-url>
cd desafio-fullstack

# 2. Torne o script executável
chmod +x docker-helper.sh

# 3. Inicie o ambiente completo
./docker-helper.sh dev
```

### **Acesso à aplicação:**
- 🌐 **Frontend:** http://localhost:3001
- 🔌 **Backend:** http://localhost:3000  
- 📊 **GraphQL Playground:** http://localhost:3000/graphql
- 🐘 **PostgreSQL:** localhost:5432

---

## 📁 Estrutura Docker

```
📦 desafio-fullstack/
├── 🐳 docker-compose.yml           # Configuração principal
├── 🛠️ docker-helper.sh             # Script auxiliar
├── 📖 DOCKER.md                    # Esta documentação
├── backend/
│   └── 🐳 Dockerfile               # Backend NestJS
└── frontend/
    ├── 🐳 Dockerfile               # Frontend Next.js
    └── 🚫 .dockerignore            # Arquivos ignorados
```

---

## 🎯 Comandos Principais

### **Helper Script (Recomendado):**
```bash
./docker-helper.sh dev      # Desenvolvimento
./docker-helper.sh prod     # Produção
./docker-helper.sh build    # Rebuild imagens
./docker-helper.sh stop     # Parar containers
./docker-helper.sh down     # Parar e remover
./docker-helper.sh clean    # Limpar tudo
./docker-helper.sh logs     # Ver logs
./docker-helper.sh status   # Status dos containers
```

### **Docker Compose Direto:**
```bash
# Desenvolvimento
docker compose up --build

# Background
docker compose up -d

# Parar
docker compose down
```

---

## 🏗️ Arquitetura dos Containers

### **PostgreSQL Container:**
- **Imagem:** postgres:15-alpine
- **Porta:** 5432:5432
- **Volume:** postgres_data (persistente)
- **Health Check:** pg_isready

### **Backend Container:**
- **Build:** ./backend/Dockerfile
- **Porta:** 3000:3000
- **Dependencies:** postgres (health check)
- **Auto:** Migrations + Seed + Start

### **Frontend Container:**
- **Build:** ./frontend/Dockerfile
- **Porta:** 3001:3000 (evita conflito)
- **Dependencies:** backend (health check)
- **Mode:** Production build

---

## 🔧 Configurações de Ambiente

### **Variáveis importantes:**

#### **Backend:**
```bash
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/teste_backend_db?schema=workspace
NODE_ENV=production|development
PORT_ADMIN=3000
JWT_SECRET_KEY=your-secret-key
```

#### **Frontend:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
NODE_ENV=production|development
```

---

## 🚀 Processo de Inicialização

### **Ordem automática:**
1. 🐘 **PostgreSQL** inicia e fica healthy
2. 🔧 **Backend** aguarda postgres → roda migrations → seed → inicia servidor
3. 🌐 **Frontend** aguarda backend → inicia aplicação

### **Logs esperados:**
```bash
postgres_1  | ready to accept connections
backend_1   | 🔄 Waiting for database to be ready...
backend_1   | 🌱 Running database seed...
backend_1   | ✅ Seed completed
backend_1   | 🚀 Starting backend server...
frontend_1  | ▲ Next.js ready on http://0.0.0.0:3000
```

---

## 🐛 Troubleshooting

### **Container não inicia:**
```bash
# Ver logs específicos
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Reconstruir do zero
./docker-helper.sh clean
./docker-helper.sh dev
```

### **Porta já em uso:**
```bash
# Verificar o que está usando as portas
lsof -i :3000  # Backend
lsof -i :3001  # Frontend
lsof -i :5432  # PostgreSQL

# Parar processos locais conflitantes
./database.sh stop  # Se estiver rodando PostgreSQL local
```

### **Problemas de build:**
```bash
# Limpar cache Docker
docker system prune -a

# Rebuild sem cache
docker compose build --no-cache
```

### **Database issues:**
```bash
# Acessar PostgreSQL diretamente
./docker-helper.sh shell-db

# Reset completo do banco
./docker-helper.sh clean
```

---

## 🔍 Debugging

### **Acessar shells dos containers:**
```bash
# Backend
./docker-helper.sh shell-be

# Frontend  
./docker-helper.sh shell-fe

# PostgreSQL
./docker-helper.sh shell-db
```

### **Verificar saúde dos containers:**
```bash
docker compose ps
docker inspect <container-name> | grep Health
```

---

## 📊 Performance

### **Primeira execução:**
- **Build time:** ~5-10 minutos
- **Startup time:** ~2-3 minutos

### **Execuções seguintes:**
- **Build time:** ~30-60 segundos (cache)
- **Startup time:** ~30-60 segundos

### **Recursos estimados:**
- **RAM:** ~2-3GB total
- **CPU:** Variável durante builds
- **Disk:** ~3-5GB (imagens + volumes)

---

## 🔒 Segurança

### **Considerações implementadas:**
- ✅ **Non-root users** nos containers
- ✅ **Alpine Linux** (menor superfície de ataque)
- ✅ **Multi-stage builds** (imagens menores)
- ✅ **Secrets via environment** (não hardcoded)

### **Para produção real:**
- 🔧 Alterar senhas padrão
- 🔧 Usar secrets manager
- 🔧 Configurar HTTPS
- 🔧 Limitar recursos dos containers

---
