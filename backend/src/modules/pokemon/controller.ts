import { UseGuards } from '@nestjs/common'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { JwtAuthGuard } from 'src/@shared/guards/jwtAuth.guard'
import { genericCaller } from 'src/@shared/types/auth'
import { CreateDTO, DeleteDTO, EntityResponse, GetDTO, UpdateDTO } from './entities/entity'
import { moduleMetadata } from './moduleMetadata'
import { Service } from './service'

@Resolver()
export class GraphQLController {
  constructor(private readonly service: Service) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => EntityResponse, { name: 'create' + moduleMetadata.name })
  async create(@Context() context: any, @Args('data') data: CreateDTO, method = 'create'): Promise<EntityResponse> {
    return await genericCaller.bind(this)(context, data, method)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => EntityResponse, { name: 'get' + moduleMetadata.name + 's' })
  async get(@Context() context: any, @Args('data') data: GetDTO, method = 'get'): Promise<EntityResponse> {
    return await genericCaller.bind(this)(context, data, method)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => EntityResponse, { name: 'update' + moduleMetadata.name })
  async update(@Context() context: any, @Args('data') data: UpdateDTO, method = 'update'): Promise<EntityResponse> {
    return await genericCaller.bind(this)(context, data, method)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => EntityResponse, { name: 'delete' + moduleMetadata.name })
  async delete(@Context() context: any, @Args('data') data: DeleteDTO, method = 'delete'): Promise<EntityResponse> {
    return await genericCaller.bind(this)(context, data, method)
  }
}
