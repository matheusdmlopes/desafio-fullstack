# Estratégia de Implementação

## Fase 1: Estrutura Base

- Layout principal com Header responsivo
- Landing page com conteúdo do README
- Roteamento básico

## Fase 2: Páginas Públicas

- Pokemon grid (mais visual/impactante)
- Blog listing (demonstra relacionamentos)
- Users profiles (mais simples)

## Fase 3: Autenticação & Admin

- Sistema de login
- Protected routes
- Dashboard administrativo


## Estrutura de diretórios
```
frontend/src/
├── app/
│   ├── globals.css
│   ├── layout.tsx                 # Root layout (header global)
│   ├── page.tsx                   # Home/Landing page
│   ├── loading.tsx                # Loading UI global
│   ├── not-found.tsx             # 404 page
│   │
│   ├── pokemons/
│   │   ├── page.tsx              # Lista pública de Pokemon
│   │   └── [id]/page.tsx         # Página individual do Pokemon
│   │
│   ├── users/
│   │   ├── page.tsx              # Lista pública de usuários/perfis
│   │   └── [id]/page.tsx         # Perfil individual
│   │
│   ├── posts/
│   │   ├── page.tsx              # Blog público
│   │   ├── [slug]/page.tsx       # Post individual
│   │   └── category/[name]/page.tsx  # Posts por categoria
│   │
│   ├── login/
│   │   └── page.tsx              # Página de login
│   │
│   └── admin/
│       ├── layout.tsx            # Layout do admin (sidebar)
│       ├── page.tsx              # Dashboard
│       ├── users/page.tsx        # CRUD Users
│       ├── pokemons/page.tsx     # CRUD Pokemon
│       ├── posts/page.tsx        # CRUD Posts
│       └── analytics/page.tsx    # Analytics
│
├── components/
│   ├── ui/                       # Componentes base (Button, Card, etc)
│   ├── layout/
│   │   ├── Header.tsx           # Header público
│   │   ├── Footer.tsx           # Footer público
│   │   └── AdminSidebar.tsx     # Sidebar do admin
│   ├── pokemon/
│   │   ├── PokemonCard.tsx      # Card individual
│   │   └── PokemonGrid.tsx      # Grid de Pokemon
│   ├── users/
│   │   └── UserProfile.tsx      # Componente de perfil
│   └── posts/
│       ├── PostCard.tsx         # Card de post
│       └── PostList.tsx         # Lista de posts
│
├── lib/
│   ├── apollo.ts                # Apollo Client (já existe)
│   ├── queries/                 # GraphQL queries organizadas
│   │   ├── pokemon.ts
│   │   ├── users.ts
│   │   └── posts.ts
│   ├── auth.ts                  # Lógica de autenticação
│   └── utils.ts                 # Utilitários gerais
│
└── styles/
    └── components.css   

```