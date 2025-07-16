import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/@shared/guards/jwtAuth.guard'
import { CreateDTO, DeleteDTO, EntityResponse, GetDTO, UpdateDTO } from './entities/entity'
import { Service } from './service'

@ApiTags('📝 Posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class HttpController {
  constructor(private readonly service: Service) {}

  @Post()
  @ApiOperation({
    summary: '✍️ Create New Post',
    description: `
      **Cria um novo post no sistema.**
      
      **Funcionalidades:**
      - ✅ Valida dados de entrada
      - ✅ Verifica permissões do usuário
      - ✅ Associa ao autor (authorId)
      - ✅ Retorna post criado com relacionamentos
      
      **🔐 Requer:** Permissão \`api-criar-post\`
    `,
  })
  @ApiBody({
    description: 'Dados para criação do post',
    schema: {
      type: 'object',
      required: ['title', 'author'],
      properties: {
        title: {
          type: 'string',
          description: 'Título do post',
          example: 'Meu Primeiro Post',
        },
        content: {
          type: 'string',
          description: 'Conteúdo do post (opcional)',
          example: 'Este é o conteúdo do meu primeiro post...',
        },
        published: {
          type: 'boolean',
          description: 'Se o post deve ser publicado',
          example: true,
        },
        author: {
          type: 'object',
          description: 'Conexão com o autor',
          properties: {
            connect: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'ID do usuário autor',
                  example: 1,
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Post criado com sucesso',
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
                  title: { type: 'string', example: 'Meu Primeiro Post' },
                  content: { type: 'string', example: 'Este é o conteúdo...' },
                  published: { type: 'boolean', example: true },
                  authorId: { type: 'number', example: 1 },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido' })
  @ApiResponse({ status: 403, description: 'Sem permissão para criar posts' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
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
    summary: '📚 List All Posts',
    description: `
      **Lista posts com paginação e filtros avançados.**
      
      **Funcionalidades:**
      - ✅ Paginação com skip/take
      - ✅ Filtros complexos (andWhere, orWhere)
      - ✅ Ordenação customizável
      - ✅ Inclui dados do autor e categorias
      
      **🔐 Requer:** Permissão \`api-ler-post\`
    `,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: 'number',
    description: 'Número de registros para pular',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: 'number',
    description: 'Número de registros para retornar',
    example: 10,
  })
  @ApiQuery({
    name: 'andWhere',
    required: false,
    type: 'string',
    description: 'Filtros AND em JSON',
    example: '[{"field":"published","fieldType":"valueBoolean","valueBoolean":true}]',
  })
  @ApiQuery({ name: 'orWhere', required: false, type: 'string', description: 'Filtros OR em JSON' })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: 'string',
    description: 'Ordenação em JSON',
    example: '{"field":"createdAt","direction":"desc"}',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de posts retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            count: { type: 'number', description: 'Total de posts encontrados', example: 25 },
            items: {
              type: 'array',
              description: 'Array de posts com relacionamentos',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  title: { type: 'string', example: 'Post Exemplo' },
                  content: { type: 'string', example: 'Conteúdo do post...' },
                  published: { type: 'boolean', example: true },
                  authorId: { type: 'number', example: 1 },
                  author: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      name: { type: 'string', example: 'João Silva' },
                      email: { type: 'string', example: 'joao@email.com' },
                    },
                  },
                  categories: {
                    type: 'array',
                    description: 'Categorias do post',
                  },
                },
              },
            },
          },
        },
      },
    },
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
    summary: '🔍 Get Post by ID',
    description: `
      **Busca um post específico pelo ID.**
      
      **Funcionalidades:**
      - ✅ Valida formato do ID
      - ✅ Inclui dados do autor
      - ✅ Inclui categorias associadas
      
      **🔐 Requer:** Permissão \`api-ler-post\`
    `,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID único do post',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Post encontrado com sucesso',
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
                  title: { type: 'string', example: 'Post Específico' },
                  content: { type: 'string', example: 'Conteúdo detalhado...' },
                  published: { type: 'boolean', example: true },
                  authorId: { type: 'number', example: 1 },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
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
    summary: '📝 Update Post',
    description: `
      **Atualiza um post existente.**
      
      **Funcionalidades:**
      - ✅ Valida existência do post
      - ✅ Atualiza campos fornecidos
      - ✅ Mantém relacionamentos
      
      **🔐 Requer:** Permissão \`api-atualizar-post\`
    `,
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do post a ser atualizado' })
  @ApiBody({
    description: 'Dados para atualização (campos opcionais)',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Título Atualizado' },
        content: { type: 'string', example: 'Conteúdo atualizado...' },
        published: { type: 'boolean', example: false },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Post atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
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
    summary: '🗑️ Delete Post',
    description: `
      **Remove um post do sistema.**
      
      **⚠️ Ação irreversível!**
      
      **🔐 Requer:** Permissão \`api-deletar-post\`
    `,
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do post a ser deletado' })
  @ApiResponse({ status: 200, description: 'Post deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
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
