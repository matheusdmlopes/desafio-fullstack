import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/@shared/guards/jwtAuth.guard'
import { CreateDTO, DeleteDTO, EntityResponse, GetDTO, UpdateDTO } from './entities/entity'
import { Service } from './service'

@ApiTags('👥 Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class HttpController {
  constructor(private readonly service: Service) { }

  @Post()
  @ApiOperation({
    summary: '👤 Create New User',
    description: `
      **Cria um novo usuário no sistema.**
      
      **Funcionalidades:**
      - ✅ Valida email único
      - ✅ Criação com dados básicos
      - ✅ Automaticamente inclui timestamps
      
      **🔐 Requer:** Permissão \`api-criar-user\`
    `,
  })
  @ApiBody({
    description: 'Dados para criação do usuário',
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Email único do usuário',
          example: 'joao.silva@email.com'
        },
        name: {
          type: 'string',
          description: 'Nome completo do usuário (opcional)',
          example: 'João Silva'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            count: { type: 'number', example: 1 },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  email: { type: 'string', example: 'joao.silva@email.com' },
                  name: { type: 'string', example: 'João Silva' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Email já existe ou dados inválidos' })
  @ApiResponse({ status: 403, description: 'Sem permissão para criar usuários' })
  async create(@Req() req: any, @Body() data: CreateDTO): Promise<EntityResponse> {
    return await this.service.execute({
      datap: data,
      method: 'create',
      tokenData: req.tokenData,
      customData: {},
      error: undefined,
    })
  }

  @Get()
  @ApiOperation({
    summary: '👥 List All Users',
    description: `
      **Lista usuários com paginação e relacionamentos.**
      
      **Funcionalidades:**
      - ✅ Paginação inteligente
      - ✅ Inclui posts do usuário
      - ✅ Inclui perfil associado
      - ✅ Ordenação por data de criação
      
      **🔐 Requer:** Permissão \`api-ler-user\`
    `,
  })
  @ApiQuery({ name: 'skip', required: false, type: 'number', description: 'Registros para pular (padrão: 0)', example: 0 })
  @ApiQuery({ name: 'take', required: false, type: 'number', description: 'Registros para retornar (padrão: 10)', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários com relacionamentos',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            count: { type: 'number', description: 'Total de usuários', example: 15 },
            items: {
              type: 'array',
              description: 'Array de usuários com posts e perfis',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  email: { type: 'string', example: 'usuario@email.com' },
                  name: { type: 'string', example: 'Usuário Exemplo' },
                  createdAt: { type: 'string', format: 'date-time' },
                  posts: {
                    type: 'array',
                    description: 'Posts criados pelo usuário',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        title: { type: 'string' },
                        published: { type: 'boolean' }
                      }
                    }
                  },
                  profile: {
                    type: 'object',
                    nullable: true,
                    description: 'Perfil do usuário (se existir)',
                    properties: {
                      id: { type: 'number' },
                      bio: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  async getAll(@Req() req: any, @Query() query: any): Promise<EntityResponse> {
    const data: GetDTO = {
      skip: query.skip ? parseInt(query.skip) : undefined,
      take: query.take ? parseInt(query.take) : undefined,
      andWhere: query.andWhere ? JSON.parse(query.andWhere) : undefined,
      orWhere: query.orWhere ? JSON.parse(query.orWhere) : undefined,
      andWhereNot: query.andWhereNot ? JSON.parse(query.andWhereNot) : undefined,
      orWhereNot: query.orWhereNot ? JSON.parse(query.orWhereNot) : undefined,
      orderBy: query.orderBy ? JSON.parse(query.orderBy) : undefined,
    }

    return await this.service.execute({
      datap: data,
      method: 'get',
      tokenData: req.tokenData,
      customData: {},
      error: undefined,
    })
  }

  @Get(':id')
  @ApiOperation({
    summary: '🔍 Get User by ID',
    description: `
      **Busca usuário específico com todos os relacionamentos.**
      
      **Inclui:**
      - ✅ Dados básicos do usuário
      - ✅ Todos os posts do usuário
      - ✅ Perfil completo (se existir)
      
      **🔐 Requer:** Permissão \`api-ler-user\`
    `,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID único do usuário',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com relacionamentos completos'
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getById(@Req() req: any, @Param('id') id: string): Promise<EntityResponse> {
    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) {
      return { error: { badRequest: 'Invalid ID format' } }
    }

    const data: GetDTO = {
      andWhere: [{ field: 'id', fieldType: 'valueInt', valueInt: numericId }],
      take: 1,
    }

    return await this.service.execute({
      datap: data,
      method: 'get',
      tokenData: req.tokenData,
      customData: {},
      error: undefined,
    })
  }

  @Put(':id')
  @ApiOperation({
    summary: '✏️ Update User',
    description: `
      **Atualiza dados de um usuário existente.**
      
      **🔐 Requer:** Permissão \`api-atualizar-user\`
    `,
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do usuário a ser atualizado' })
  @ApiBody({
    description: 'Dados para atualização (todos opcionais)',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'novo.email@example.com' },
        name: { type: 'string', example: 'Novo Nome' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(@Req() req: any, @Param('id') id: string, @Body() data: Omit<UpdateDTO, 'id'>): Promise<EntityResponse> {
    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) {
      return { error: { badRequest: 'Invalid ID format' } }
    }

    const updateData: UpdateDTO = { ...data, id: numericId }

    return await this.service.execute({
      datap: updateData,
      method: 'update',
      tokenData: req.tokenData,
      customData: {},
      error: undefined,
    })
  }

  @Delete(':id')
  @ApiOperation({
    summary: '🗑️ Delete User',
    description: `
      **Remove um usuário do sistema.**
      
      **⚠️ CUIDADO:** Esta ação pode afetar posts e perfis relacionados.
      
      **🔐 Requer:** Permissão \`api-deletar-user\`
    `,
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do usuário a ser deletado' })
  @ApiResponse({ status: 200, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async delete(@Req() req: any, @Param('id') id: string): Promise<EntityResponse> {
    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) {
      return { error: { badRequest: 'Invalid ID format' } }
    }

    const data: DeleteDTO = { id: numericId }

    return await this.service.execute({
      datap: data,
      method: 'delete',
      tokenData: req.tokenData,
      customData: {},
      error: undefined,
    })
  }
}
