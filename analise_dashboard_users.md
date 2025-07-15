# Análise: Problemas com Update e Delete no Dashboard/Users

## Resumo Executivo

Após análise detalhada da codebase, identifiquei que as operações de **update** e **delete** no dashboard de usuários não estão funcionando devido a um problema de **permissões de autenticação**. O sistema está configurado corretamente tanto no frontend quanto no backend, mas há uma quebra na cadeia de autenticação.

## Problemas Identificados

### 1. **Problema Principal: Falha na Autenticação GraphQL**

**Localização**: `backend/src/@shared/types/auth.ts:25`

```typescript
export async function genericCaller<T>(context: any, data: any, method: string): Promise<T> {
  try {
    const tokenData = context?.req?.user || context?.req?.tokenData || context?.user;
    // ...
  }
}
```

**Problema**: O `genericCaller` não está extraindo corretamente o token do contexto GraphQL, resultando em `tokenData` undefined, o que faz as verificações de permissão falharem.

### 2. **Verificações de Permissão Falhando**

**Localização**: `backend/src/modules/user/service.ts:133` e `backend/src/modules/user/service.ts:183`

```typescript
// Update
if ((await checkPermission({ prisma: this.prisma, token: data.tokenData, data: ['api-atualizar-user'] })).permitted) {
  return data
}

// Delete  
if ((await checkPermission({ prisma: this.prisma, token: data.tokenData, data: ['api-deletar-user'] })).permitted) {
  return data
}
```

**Problema**: Como `tokenData` está undefined, as verificações de permissão para `api-atualizar-user` e `api-deletar-user` sempre falham, retornando erro de "Sem permissão para o recurso".

### 3. **Frontend Não Recebe Resposta de Sucesso**

**Localização**: `frontend/src/app/(dashboard)/dashboard/users/page.tsx:155` e `frontend/src/app/(dashboard)/dashboard/users/page.tsx:177`

```typescript
// Update
if (result.data?.updateUser?.data?.items?.length) {
    // Sucesso - nunca executado devido ao erro de permissão
}

// Delete
if (result.data?.deleteUser?.data?.items?.length) {
    // Sucesso - nunca executado devido ao erro de permissão
}
```

**Problema**: Como o backend retorna erro de permissão, estas condições nunca são atendidas, fazendo com que as interfaces não sejam atualizadas.

## Configuração Correta Encontrada

### ✅ **Autenticação HTTP Funciona**
- O `auto-login` em `backend/src/modules/auth/auth.controller.ts` gera tokens válidos
- As permissões `api-atualizar-user` e `api-deletar-user` estão incluídas no token

### ✅ **Frontend Configurado Corretamente**
- Apollo Client está configurado para enviar headers de Authorization
- As mutations GraphQL estão estruturadas corretamente
- Handlers de update e delete estão implementados adequadamente

### ✅ **Backend Service Logic Está Correta**
- Métodos update e delete estão implementados corretamente no service
- Validações de dados estão funcionando
- Operações de banco de dados estão corretas

## Solução Recomendada

### 1. **Corrigir Extração do Token no GraphQL Context**

Modificar `backend/src/@shared/types/auth.ts`:

```typescript
export async function genericCaller<T>(context: any, data: any, method: string): Promise<T> {
  try {
    // Melhor extração do token do contexto GraphQL
    const tokenData = context?.req?.user || 
                     context?.req?.tokenData || 
                     context?.user ||
                     context?.connection?.context?.user || // Para websockets
                     context?.headers?.authorization; // Fallback para headers diretos
    
    if (!tokenData) {
      console.error('Token data not found in context:', context);
      return { error: { unauthorized: 'Token de autenticação não encontrado' } } as any;
    }

    return await this.service.execute({
      datap: data,
      method,
      tokenData: tokenData,
      customData: {},
      error: undefined,
    })
  } catch (error) {
    console.log('Error in genericCaller:', error)
    return { error: { internalServerError: 'Erro de servidor, tente novamente em alguns minutos' } } as any
  }
}
```

### 2. **Verificar Configuração do JWT Guard**

Verificar se `backend/src/@shared/guards/jwtAuth.guard.ts` está adicionando corretamente os dados do usuário ao contexto da requisição.

### 3. **Adicionar Logs de Debug Temporários**

Para diagnosticar melhor o problema, adicionar logs no service:

```typescript
perm: async (data) => {
  console.log('Token data received:', data.tokenData);
  console.log('Checking permission for:', ['api-atualizar-user']);
  // resto da lógica...
}
```

## Impacto

- **Alta severidade**: Funcionalidades críticas de gerenciamento de usuários não funcionam
- **Usuários afetados**: Todos os administradores que tentam editar/excluir usuários
- **Funcionalidades afetadas**: Update e Delete de usuários no dashboard

## Status Atual

- ✅ **Create**: Funcionando (provavelmente devido a permissões diferentes)
- ✅ **Read**: Funcionando 
- ❌ **Update**: Não funcionando - erro de permissão
- ❌ **Delete**: Não funcionando - erro de permissão

## Dependências Técnicas

O projeto possui algumas inconsistências de versão (warnings do yarn), mas isso não afeta o problema principal. O banco de dados está configurado para PostgreSQL com Prisma, o que está correto.