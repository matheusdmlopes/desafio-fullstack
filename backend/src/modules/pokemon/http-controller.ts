import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/@shared/guards/jwtAuth.guard'
import { CreateDTO, DeleteDTO, EntityResponse, GetDTO, UpdateDTO } from './entities/entity'
import { Service } from './service'

@ApiTags('🐾 Pokemon')
@Controller('pokemon')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class HttpController {
  constructor(private readonly service: Service) { }

  @Post()
  @ApiOperation({
    summary: '✨ Create New Pokemon',
    description: `
      **Adiciona um novo Pokemon ao catálogo.**
      
      **🔐 Requer:** Permissão \`api-criar-pokemon\`
    `
  })
  @ApiResponse({ status: 201, description: 'Pokemon criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Nome já existe ou dados inválidos' })
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
    summary: '🐾 List All Pokemon',
    description: `
      **Lista completa do catálogo Pokemon com paginação.**
      
      **Funcionalidades:**
      - ✅ Catálogo completo com tipos e habilidades
      - ✅ Paginação eficiente
      - ✅ Ordenação por data de criação
      
      **🔐 Requer:** Permissão \`api-ler-pokemon\`
    `
  })
  @ApiQuery({ name: 'skip', required: false, type: 'number', description: 'Pular registros', example: 0 })
  @ApiQuery({ name: 'take', required: false, type: 'number', description: 'Quantos retornar', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Catálogo Pokemon retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            count: { type: 'number', example: 80 },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Pikachu' },
                  type: { type: 'string', example: 'Electric' },
                  ability: { type: 'string', example: 'Static' },
                  image: { type: 'string', example: 'https://example.com/pikachu.jpg' },
                  createdAt: { type: 'string', format: 'date-time' }
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
    summary: '🔍 Get Pokemon by ID',
    description: 'Busca um Pokemon específico pelo ID.'
  })
  @ApiResponse({ status: 200, description: 'Pokemon encontrado' })
  @ApiResponse({ status: 404, description: 'Pokemon não encontrado' })
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
    summary: '📝 Update Pokemon',
    description: 'Atualiza dados de um Pokemon existente.'
  })
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
    summary: '🗑️ Delete Pokemon',
    description: 'Remove um Pokemon do catálogo.'
  })
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
