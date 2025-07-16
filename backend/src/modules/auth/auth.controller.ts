import { Controller, Post } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import * as jwt from 'jsonwebtoken'

@ApiTags('🔐 Authentication')
@Controller('auth')
export class AuthController {
  @Post('auto-login')
  @ApiOperation({
    summary: '🔑 Auto Login (Demo)',
    description: `
            **Gera automaticamente um token JWT para demonstração.**
            
            Este endpoint é usado para facilitar os testes da API, gerando um token
            válido com todas as permissões necessárias.
            
            ⚠️ **Apenas para demonstração** - Em produção seria um login real com credenciais.
            
            **Token gerado:**
            - ✅ Válido por 24 horas
            - ✅ Inclui todas as permissões de CRUD
            - ✅ Usuário demo pré-configurado
        `,
  })
  @ApiResponse({
    status: 200,
    description: 'Token JWT gerado com sucesso',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'JWT Token para autenticação',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID do usuário',
              example: 1,
            },
            email: {
              type: 'string',
              description: 'Email do usuário',
              example: 'demo@test.com',
            },
            name: {
              type: 'string',
              description: 'Nome do usuário',
              example: 'Demo User',
            },
          },
        },
      },
    },
  })
  autoLogin() {
    const payload = {
      sub: 1,
      email: 'demo@test.com',
      data: {
        permissions: [
          'api-ler-post',
          'api-criar-post',
          'api-atualizar-post',
          'api-deletar-post',
          'api-ler-category',
          'api-criar-category',
          'api-atualizar-category',
          'api-deletar-category',
          'api-ler-user',
          'api-criar-user',
          'api-atualizar-user',
          'api-deletar-user',
          'api-ler-pokemon',
          'api-criar-pokemon',
          'api-atualizar-pokemon',
          'api-deletar-pokemon',
          'api-ler-profile',
          'api-criar-profile',
          'api-atualizar-profile',
          'api-deletar-profile',
          'api-ler-large-table',
          'api-criar-large-table',
          'api-atualizar-large-table',
          'api-deletar-large-table',
        ],
      },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    }

    const token = jwt.sign(payload, 'demo-secret-key')

    return {
      token,
      user: {
        id: payload.sub,
        email: payload.email,
        name: 'Demo User',
      },
    }
  }
}
