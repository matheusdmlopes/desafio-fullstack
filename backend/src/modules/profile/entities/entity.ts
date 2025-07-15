import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import {
  ConnectWhere,
  GetEntityDTO,
  MainResponse,
  PaginationResponse,
  createZodSchema,
} from 'src/@shared/graphql/types'
import { z } from 'zod'
import { createDTODBType, moduleMetadata, updateDTODBType } from '../moduleMetadata'

@ObjectType(moduleMetadata.name + 'Entity')
export class MainEntity {
  @Field(() => ID)
  id: number
  static idZod = z.coerce.number().int().positive()

  @Field(() => String, { nullable: true })
  bio?: string
  static bioZod = z.string().optional()

  @Field(() => ID)
  userId: number
  static userIdZod = z.coerce.number().int().positive()

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}

@ObjectType(moduleMetadata.name + 'Pagination')
export class EntityPagination extends PaginationResponse {
  @Field(() => [MainEntity])
  items: MainEntity[]
}

@InputType('Get' + moduleMetadata.name + 'sDTO')
export class GetDTO extends GetEntityDTO { }

@InputType('Create' + moduleMetadata.name + 'DTO')
export class CreateDTO implements createDTODBType {
  @Field(() => String, { nullable: true })
  bio?: string
  static bioZod = MainEntity.bioZod

  @Field(() => ConnectWhere)
  user: Prisma.UserCreateNestedOneWithoutProfileInput
  static userZod = ConnectWhere.zodSchema()

  static zodSchema = createZodSchema.bind(CreateDTO)
}

@InputType('Update' + moduleMetadata.name + 'DTO')
export class UpdateDTO implements updateDTODBType {
  @Field(() => ID)
  id: number
  static idZod = MainEntity.idZod

  @Field(() => String, { nullable: true })
  bio?: string | Prisma.NullableStringFieldUpdateOperationsInput
  static bioZod = MainEntity.bioZod

  @Field(() => ConnectWhere, { nullable: true })
  user?: Prisma.UserUpdateOneRequiredWithoutProfileNestedInput
  static userZod = ConnectWhere.zodSchema().optional()

  static zodSchema = createZodSchema.bind(UpdateDTO)
}

@InputType('Delete' + moduleMetadata.name + 'DTO')
export class DeleteDTO {
  @Field(() => ID)
  id: number
  static idZod = MainEntity.idZod

  static zodSchema = createZodSchema.bind(DeleteDTO)
}

@ObjectType(moduleMetadata.name + 'Response')
export class EntityResponse extends MainResponse {
  @Field(() => EntityPagination, { nullable: true })
  data?: EntityPagination
}
