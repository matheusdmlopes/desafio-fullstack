import { Field, Float, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { GetEntityDTO, MainResponse, PaginationResponse, createZodSchema } from 'src/@shared/graphql/types'
import { z } from 'zod'
import { createDTODBType, moduleMetadata, updateDTODBType } from '../moduleMetadata'

@ObjectType(moduleMetadata.name + 'Entity')
export class MainEntity {
  @Field(() => ID)
  id: number
  static idZod = z.coerce.number().int().positive()

  @Field(() => String)
  name: string
  static nameZod = z.string().min(1)

  @Field(() => Float)
  value: number
  static valueZod = z.number()

  @Field(() => Date)
  timestamp: Date
  static timestampZod = z.date()

  @Field(() => String)
  details: string
  static detailsZod = z.string().min(1)

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
export class GetDTO extends GetEntityDTO {}

@InputType('Create' + moduleMetadata.name + 'DTO')
export class CreateDTO implements createDTODBType {
  @Field(() => String)
  name: string
  static nameZod = MainEntity.nameZod

  @Field(() => Float)
  value: number
  static valueZod = MainEntity.valueZod

  @Field(() => Date)
  timestamp: Date
  static timestampZod = MainEntity.timestampZod

  @Field(() => String)
  details: string
  static detailsZod = MainEntity.detailsZod

  static zodSchema = createZodSchema.bind(CreateDTO)
}

@InputType('Update' + moduleMetadata.name + 'DTO')
export class UpdateDTO implements updateDTODBType {
  @Field(() => ID)
  id: number
  static idZod = MainEntity.idZod

  @Field(() => String, { nullable: true })
  name?: string | Prisma.StringFieldUpdateOperationsInput
  static nameZod = MainEntity.nameZod.optional()

  @Field(() => Float, { nullable: true })
  value?: number | Prisma.FloatFieldUpdateOperationsInput
  static valueZod = MainEntity.valueZod.optional()

  @Field(() => Date, { nullable: true })
  timestamp?: Date | Prisma.DateTimeFieldUpdateOperationsInput
  static timestampZod = MainEntity.timestampZod.optional()

  @Field(() => String, { nullable: true })
  details?: string | Prisma.StringFieldUpdateOperationsInput
  static detailsZod = MainEntity.detailsZod.optional()

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
