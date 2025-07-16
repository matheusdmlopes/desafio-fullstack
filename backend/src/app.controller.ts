import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from './@shared/guards/jwtAuth.guard'
import { AppService } from './app.service'

@ApiTags('📊 Analytics')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({
    summary: '👋 API Health Check',
    description: `
      **Endpoint de verificação da saúde da API.**
      
      Retorna informações básicas sobre o servidor:
      - ✅ Status da aplicação
      - ✅ Versão e ambiente
      - ✅ Timestamp atual
      
      **Não requer autenticação** - Público para verificação de status.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Informações do servidor retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        returnMessage: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Hello World!!! ✈️✈️'
            },
            LOCAL: {
              type: 'string',
              example: 'development'
            },
            PORT: {
              type: 'string',
              example: '3000'
            },
            date: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            version: {
              type: 'number',
              example: 2.3
            }
          }
        }
      }
    }
  })
  getHello(): any {
    return this.appService.getHello()
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '📈 Complex Analytics Dashboard',
    description: `
      **Relatório avançado de analytics do sistema.**
      
      Este endpoint executa uma query complexa que combina dados de todas as tabelas
      para gerar métricas avançadas de usuários e engajamento:
      
      **📊 Métricas Incluídas:**
      - 👥 **User Metrics** - Idade dos usuários, tipos de domínio de email
      - 📝 **Content Metrics** - Posts publicados, tamanho médio do conteúdo
      - 📂 **Category Engagement** - Diversidade de categorias usadas
      - 👤 **Profile Completeness** - Status de completude dos perfis
      - 🎯 **User Classification** - Classificação automática (power_user, active_user, etc.)
      - ⚡ **Activity Status** - Status de atividade recente
      - 🏆 **Engagement Score** - Score calculado de engajamento
      
      **⚠️ Importante:** Query otimizada mas ainda complexa - pode demorar alguns segundos.
      
      **🔐 Requer:** Token JWT válido com permissões de leitura.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics geradas com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z'
        },
        recordCount: {
          type: 'number',
          description: 'Número de registros retornados',
          example: 50
        },
        message: {
          type: 'string',
          example: 'Simplified analytics data retrieved successfully'
        },
        data: {
          type: 'array',
          description: 'Array com dados de analytics de usuários',
          items: {
            type: 'object',
            properties: {
              user_id: { type: 'number', example: 1 },
              email: { type: 'string', example: 'user@example.com' },
              user_name: { type: 'string', example: 'John Doe' },
              user_classification: {
                type: 'string',
                enum: ['power_user', 'active_user', 'contributor', 'new_user', 'inactive_user'],
                example: 'active_user'
              },
              engagement_score: { type: 'number', example: 25.5 },
              total_posts: { type: 'number', example: 8 },
              published_posts: { type: 'number', example: 6 },
              unique_categories_used: { type: 'number', example: 3 },
              activity_status: {
                type: 'string',
                enum: ['highly_active', 'moderately_active', 'occasionally_active', 'dormant', 'no_activity'],
                example: 'moderately_active'
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou ausente'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor ou problema na query de analytics'
  })
  async getAnalytics(): Promise<any> {
    return await this.appService.getComplexAnalytics()
  }
}
