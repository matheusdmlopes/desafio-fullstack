# 🚀 Como Rodar a Aplicação

**Guia rápido para executar o projeto completo**

## 📋 Pré-requisitos

- **Docker** instalado e funcionando
- **Git** para clonar o repositório

## ⚡ Execução Rápida (Recomendada)

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd desafio-fullstack

# 2. Execute tudo com Docker
docker compose up --build
```

**Aguarde alguns minutos** para o download das imagens e setup completo.

## 🌐 Acessando a Aplicação

Após o Docker finalizar o setup:

### **Frontend (Next.js)**
- **URL:** http://localhost:3001
- **Páginas públicas:** Pokemon, Blog
- **Dashboard:** Requer autenticação automática

### **Backend API**
- **URL:** http://localhost:3000
- **Swagger:** http://localhost:3000/api/docs
- **GraphQL:** http://localhost:3000/graphql

### **Banco de Dados**
- **Host:** localhost:5432
- **Database:** teste_backend_db
- **User:** postgres
- **Password:** postgres123

## 🔑 Autenticação

Para testar endpoints protegidos:

1. **Via Swagger:**
   - Acesse http://localhost:3000/api/docs
   - Execute `POST /auth/auto-login`
   - Copie o token
   - Clique em "Authorize" e cole o token

2. **Via Frontend:**
   - A autenticação é automática no dashboard


## 🛠️ Comandos Alternativos

Se preferir rodar individualmente:

```bash
# Backend apenas
cd backend
yarn install
yarn full-setup
yarn dev

# Frontend apenas  
cd frontend
yarn install
yarn dev
```

## ❓ Problemas Comuns

### **Docker não sobe:**
```bash
# Limpar containers antigos
docker compose down
docker system prune -f
docker compose up --build
```

### **Erro de permissão:**
```bash
cd backend
sudo rm -rf dist
yarn build
```

### **Banco não conecta:**
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres
```

## 🎯 Testando a Aplicação

1. ✅ **Frontend:** Navegue pelas páginas públicas
2. ✅ **Dashboard:** Acesse `/dashboard` e teste CRUD
3. ✅ **Swagger:** Teste endpoints via documentação
4. ✅ **GraphQL:** Execute queries no playground
5. ✅ **Analytics:** Visualize dados em `/dashboard/analytics`

