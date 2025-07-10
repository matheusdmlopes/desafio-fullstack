# 📋 Contexto do Projeto - Desafio Fullstack

Arquivo de contexto/resumo do projeto gerado pelo Claude Sonnet 4

## 🎯 Visão Geral

Este é um **desafio técnico para desenvolvedor fullstack júnior** que simula um ambiente real de desenvolvimento. O objetivo principal é **construir um frontend** que consuma um backend já implementado, demonstrando capacidade de integração, resolução de problemas e tomada de decisões técnicas.

### Objetivo do Desafio
- **Frontend**: Desenvolver do zero (recomendado Next.js + TypeScript + Tailwind)
- **Backend**: Já implementado (NestJS) - melhorias opcionais
- **Ambiente**: Dockerizar toda a aplicação
- **Analytics**: Dashboard para exibir dados de analytics

---

## 🏗️ Arquitetura Backend (Existente)

### Stack Tecnológica
- **Framework**: NestJS (Node.js + TypeScript)
- **API**: GraphQL (principal) + REST (secundário)
- **ORM**: Prisma
- **Banco**: PostgreSQL com multi-schema (`public`, `workspace`)
- **Autenticação**: JWT (simples, sem signup/login)
- **Real-time**: WebSocket (Socket.io)
- **Upload**: Multer
- **Containerização**: Docker + LibreOffice
- **Testes**: Jest

### Estrutura de Diretórios
```
backend/src/
├── @shared/           # Recursos compartilhados
│   ├── decorators/    # @Role decorator
│   ├── guards/        # JWT Auth Guards
│   ├── graphql/       # Tipos base GraphQL + validação Zod
│   ├── socket/        # WebSocket para notificações
│   ├── file/          # Configuração Multer
│   └── utils/         # Utilitários de permissão
├── modules/           # Módulos de negócio (CRUD padrão)
│   ├── user/         # Gestão de usuários
│   ├── profile/      # Perfis de usuário
│   ├── post/         # Sistema de posts
│   ├── category/     # Categorias
│   ├── pokemon/      # Dados Pokemon (demo)
│   └── large-table/  # Tabela grande para analytics
├── infra/
│   └── database/     # Prisma + seeds
└── main.ts
```

---

## 📊 Modelo de Dados (Prisma)

### Entidades Principais
```typescript
// Schema workspace.*
User {
  id, email, name, createdAt, updatedAt
  posts: Post[]
  profile: Profile?
}

Profile {
  id, bio, userId, createdAt, updatedAt
  user: User
}

Post {
  id, title, content, published, authorId, createdAt, updatedAt
  author: User
  categories: PostCategory[]
}

Category {
  id, name, createdAt, updatedAt
  posts: PostCategory[]
}

PostCategory {
  postId, categoryId (tabela de junção)
}

Pokemon {
  id, name, type, ability, image, createdAt, updatedAt
}

LargeTable {
  id, name, value, timestamp, details, createdAt, updatedAt
}
```

### Schema Multi-tenant
- `workspace.*`: Dados de negócio
- `public.*`: Metadados do sistema (futuro)

---

## 🔌 APIs Disponíveis

### GraphQL (Principal) - `/graphql`
**Padrão CRUD para todas as entidades:**
```graphql
# Queries
getUsers(data: GetUserDTO): UserEntityResponse
getProfiles(data: GetProfileDTO): ProfileEntityResponse
getPosts(data: GetPostDTO): PostEntityResponse
getCategories(data: GetCategoryDTO): CategoryEntityResponse
getPokemons(data: GetPokemonDTO): PokemonEntityResponse
getLargeTables(data: GetLargeTableDTO): LargeTableEntityResponse

# Mutations
createUser(data: CreateUserDTO): UserEntityResponse
updateUser(data: UpdateUserDTO): UserEntityResponse
deleteUser(data: DeleteUserDTO): UserEntityResponse
# ... (mesmo padrão para todas as entidades)
```

### REST (Secundário)
```bash
# CRUD básico
GET/POST    /users
GET/PUT     /users/:id
DELETE      /users/:id

# Mesma estrutura para:
/posts, /categories, /pokemon, /profiles, /large-table

# Analytics
GET /analytics  # Dados de analytics complexos
```

### WebSocket - Para notificações
```javascript
// Conexão
io.connect('ws://localhost:3000', { query: { userId: 'user123' } })

// Eventos
socket.emit('mensagem', { userId, message })
socket.on('resposta', (message) => {})
socket.on('historico', (messages) => {})
```

---

## 🔐 Sistema de Autenticação

### Implementação Atual (Simplificada)
- **JWT simples**: Apenas verificação de token válido
- **Sem login/signup**: Tokens devem ser gerados manualmente para testes
- **Guards disponíveis**:
  - `JwtAuthGuard`: Obrigatório
  - `JwtOptionalAuthGuard`: Opcional
  - `RolesGuard`: Para controle de acesso por roles

### Estrutura do Token JWT
```javascript
{
  sub: "userId",        // ID do usuário
  data: { /* userData */ }, // Dados extras
  iat: timestamp,       // Issued at
  exp: timestamp        // Expires at
}
```

### Como Usar (Para Testes)
```bash
# Headers obrigatórios para APIs protegidas
Authorization: Bearer <jwt-token>
```

---

## 📈 Sistema de Analytics

### View SQL Complexa
- **Arquivo**: `analytics/complex_analytics_view.sql`
- **View**: `workspace.simplified_analytics`
- **Endpoint**: `GET /analytics`

### Métricas Disponíveis
```sql
-- Dados por usuário
user_id, email, user_name, user_age_days, email_domain_type

-- Perfil e atividade
profile_status, bio_length, total_posts, published_posts

-- Engajamento
unique_categories_used, category_diversity_percentage
engagement_score, activity_status, user_classification

-- Metadados
analysis_generated_at, system_data_points
```

### Classificações Automáticas
- **Usuários**: `power_user`, `active_user`, `contributor`, `new_user`, `inactive_user`
- **Atividade**: `highly_active`, `moderately_active`, `occasionally_active`, `dormant`, `no_activity`
- **Perfil**: `comprehensive`, `moderate`, `basic`, `incomplete`, `no_profile`

---

## 🌱 Sistema de Seed

### Comando
```bash
yarn seed  # Popula o banco com dados realísticos
```

### Dados Gerados
- **50 usuários** com emails realísticos
- **35 perfis** (70% dos usuários)
- **80 pokémons** com tipos/habilidades
- **40+ categorias** temáticas
- **150 posts** com conteúdo variado
- **1000 registros** na LargeTable (para analytics)
- **Relacionamentos** Post-Category aleatórios

---

## 🚀 Como Executar o Backend

### Setup Automatizado
```bash
# Setup completo (recomendado)
yarn full-setup

# Ou passo a passo:
yarn setup          # Configura .env
yarn db:setup       # Inicia PostgreSQL (Docker)
yarn install        # Dependências
npx prisma generate  # Cliente Prisma
npx prisma migrate dev # Migrations
yarn seed           # Popular dados
yarn dev            # Iniciar servidor
```

### Scripts Disponíveis
```bash
# Desenvolvimento
yarn dev             # Servidor em watch mode
yarn build          # Build production

# Banco de dados
yarn db:start       # Iniciar PostgreSQL
yarn db:stop        # Parar PostgreSQL
yarn db:psql        # Conectar ao banco
yarn db:fresh       # Reset + seed

# Testes
yarn test           # Testes unitários
yarn test:e2e       # Testes end-to-end
yarn test:cov       # Coverage
```

---

## 🐳 Docker & Ambiente

### Dockerfile
- **Base**: Ubuntu 22.04
- **Node**: v20.x
- **Extras**: LibreOffice, GUI dependencies
- **Build**: Automático com Prisma generate

### Estrutura Docker
```yaml
# docker-compose.yml (esperado)
services:
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://...
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=challenge
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
  
  frontend:
    build: ./frontend  # A ser criado
```

---

## 🧪 Testes (A Melhorar)

### Estado Atual
- **Configurado**: Jest + Supertest
- **Existente**: Apenas testes básicos
- **Oportunidade**: Implementar testes unitários/e2e abrangentes

### Arquivos de Teste
```
test/
├── app.e2e-spec.ts    # E2E básico
└── jest-e2e.json      # Configuração E2E

src/__tests__/
└── app.controller.spec.ts  # Teste unitário básico
```

---

## 🔧 Pontos de Melhoria Identificados

### Performance
- [ ] **Analytics lentas**: Otimizar queries da view
- [ ] **Sem cache**: Implementar Redis
- [ ] **Sem pagination**: Adicionar limites padrão

### Segurança
- [ ] **Autenticação básica**: Implementar login/signup
- [ ] **Validação JWT**: Verificação de assinatura
- [ ] **Rate limiting**: Prevenir abuse
- [ ] **Input sanitization**: Melhorar validações

### Testes
- [ ] **Coverage baixo**: Testes unitários abrangentes
- [ ] **Sem E2E**: Testes de integração completos
- [ ] **Sem mocks**: Testes isolados

### Monitoramento
- [ ] **Sem logs estruturados**: Implementar logging
- [ ] **Sem métricas**: Health checks
- [ ] **Sem observabilidade**: APM/tracing

---

## 🎯 Tarefas do Frontend

### Essenciais
1. **Setup**: Next.js + TypeScript + Tailwind
2. **GraphQL Client**: Apollo Client ou similar
3. **CRUD Interfaces**: Para todas as entidades
4. **Dashboard Analytics**: Visualização dos dados
5. **Autenticação**: Gerenciamento de JWT tokens

### Opcionais (Diferenciais)
- **Real-time**: Integração WebSocket
- **Upload**: Interface para arquivos
- **Responsive**: Design mobile-first
- **Dark mode**: Tema alternativo
- **Testes**: Jest + Testing Library

---

## 📚 Recursos para Desenvolvimento

### GraphQL Playground
- **URL**: `http://localhost:3000/graphql`
- **Introspection**: Schema disponível
- **Teste direto**: Queries e mutations

### Banco de Dados
```bash
# Conexão direta
yarn db:psql

# Prisma Studio (GUI)
npx prisma studio
```

### Logs & Debug
- **Console**: Logs detalhados das operações
- **Prisma**: Queries SQL visíveis
- **GraphQL**: Resolvers com log

---

## 🤔 Considerações para o Candidato

### O que Será Avaliado
1. **Raciocínio técnico**: Como você aborda problemas
2. **Qualidade do código**: Estrutura e organização
3. **Integração**: Como consome as APIs
4. **UX/UI**: Interface funcional e agradável
5. **Documentação**: Como explica suas decisões

### Dicas Estratégicas
- **Comece simples**: CRUD básico funcionando primeiro
- **Itere rapidamente**: MVP → melhorias
- **Documente decisões**: Por que escolheu X em vez de Y?
- **Teste conforme desenvolve**: Valide cada funcionalidade
- **Prepare-se para explicar**: Entrevista técnica pós-desenvolvimento

---

*Este contexto serve como base para o desenvolvimento do frontend e compreensão do sistema existente. O foco deve ser na **integração eficaz** e **experiência do usuário**, demonstrando capacidade de trabalhar com APIs existentes e tomar decisões técnicas fundamentadas.* 