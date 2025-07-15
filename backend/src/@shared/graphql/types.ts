import { Field, Float, ID, InputType, ObjectType } from '@nestjs/graphql'
import { z } from 'zod'
import { ZodValidationError } from './errors'

export function createZodSchema() {
  const schemaObject: any = {}

  // Iterate over properties of the class
  for (const key of Object.getOwnPropertyNames(this)) {
    if (key.endsWith('Zod')) {
      // Assuming the property is a Zod schema
      schemaObject[key.replace('Zod', '')] = this[key]
    }
  }

  return z.object(schemaObject)
}
@ObjectType()
export class ApiResponse {
  @Field(() => [ZodValidationError], { nullable: true })
  errors?: ZodValidationError[]

  @Field({ nullable: true })
  unauthorized?: string

  @Field({ nullable: true })
  blocked?: string

  @Field({ nullable: true })
  badRequest?: string

  @Field({ nullable: true })
  notFound?: string

  @Field({ nullable: true })
  forbidden?: string

  @Field({ nullable: true })
  conflict?: string

  @Field({ nullable: true })
  refreshSystemToken?: string

  @Field({ nullable: true })
  internalServerError?: string
}
@ObjectType()
export class PaginationResponse {
  @Field(() => Number)
  count: number
}

@ObjectType()
export class MainResponse {
  @Field(() => ApiResponse, { nullable: true })
  error?: ApiResponse
}

@InputType()
export class OrderBy {
  @Field()
  field: string
  static fieldZod = z.string().min(1)

  @Field()
  order: 'asc' | 'desc'
  static orderZod = z.enum(['asc', 'desc'])

  static zodSchema = createZodSchema
}

@InputType()
export class DateRange {
  @Field(() => Date, { nullable: true })
  from: Date
  static fromZod = z.date()

  @Field(() => Date, { nullable: true })
  to: Date
  static toZod = z.date()

  static zodSchema = createZodSchema
}

@InputType()
export class WhereBase {
  @Field()
  field: string
  static fieldZod = z.string().min(1)

  @Field({ nullable: true })
  valueText?: string
  static valueTextZod = z.string().min(1).optional()

  @Field(() => Float, { nullable: true })
  valueInt?: number
  static valueIntZod = z.number().int().optional()

  @Field(() => Date, { nullable: true })
  valueDate?: Date
  static valueDateZod = z.date().optional()

  @Field(() => Boolean, { nullable: true })
  valueBoolean?: boolean
  static valueBooleanZod = z.boolean().optional()

  @Field(() => [String], { nullable: true })
  valueTextArray?: string[]
  static valueTextArrayZod = z.array(z.string().min(1)).optional()

  @Field(() => [Float], { nullable: true })
  valueIntArray?: number[]
  static valueIntArrayZod = z.array(z.number().int()).optional()

  @Field(() => [Date], { nullable: true })
  valueDateArray?: Date[]
  static valueDateArrayZod = z.array(z.date()).optional()

  @Field(() => [Boolean], { nullable: true })
  valueBooleanArray?: boolean[]
  static valueBooleanArrayZod = z.array(z.boolean()).optional()

  @Field(() => DateRange, { nullable: true })
  valueDateRange?: DateRange
  static valueDateRangeZod = DateRange.zodSchema().optional()

  @Field(() => [DateRange], { nullable: true })
  valueDateRangeArray?: DateRange[]
  static valueDateRangeArrayZod = z.array(DateRange.zodSchema()).optional()

  @Field(() => String, { nullable: true })
  fieldType: string
  static fieldTypeZod = z.enum([
    'valueText',
    'valueInt',
    'valueDate',
    'valueBoolean',
    'valueTextArray',
    'valueIntArray',
    'valueDateArray',
    'valueBooleanArray',
    'valueDateRange',
    'valueDateRangeArray',
  ])

  static zodSchema = createZodSchema.bind(WhereBase)
}

@InputType()
export class AndWhere extends WhereBase { }

@InputType()
export class OrWhere extends WhereBase { }

@InputType()
export class AndWhereNot extends WhereBase { }

@InputType()
export class OrWhereNot extends WhereBase { }

@InputType()
export class GetEntityDTO {
  @Field({ nullable: true })
  skip?: number
  static skipZod = z
    .number()
    .int()
    .refine((val) => val >= 0)
    .optional()

  @Field({ nullable: true })
  take?: number
  static takeZod = z.number().int().positive().optional()

  @Field(() => [AndWhere], { nullable: true })
  andWhere?: AndWhere[]
  static andWhereZod = z.array(AndWhere.zodSchema()).optional()

  @Field(() => [OrWhere], { nullable: true })
  orWhere?: OrWhere[]
  static orWhereZod = z.array(OrWhere.zodSchema()).optional()

  @Field(() => [AndWhereNot], { nullable: true })
  andWhereNot?: AndWhereNot[]
  static andWhereNotZod = z.array(AndWhereNot.zodSchema()).optional()

  @Field(() => [OrWhereNot], { nullable: true })
  orWhereNot?: OrWhereNot[]
  static orWhereNotZod = z.array(OrWhereNot.zodSchema()).optional()

  @Field(() => OrderBy, { nullable: true })
  orderBy?: OrderBy
  static orderByZod = OrderBy.zodSchema().optional()

  static zodSchema = createZodSchema.bind(GetEntityDTO)
}

@InputType()
export class Connect {
  @Field(() => ID, { nullable: false })
  id: number
  static idZod = z.coerce.number().int().positive().optional()

  static zodSchema = createZodSchema.bind(Connect)
}

@InputType()
export class ConnectWhere {
  @Field(() => Connect, { nullable: false })
  connect: Connect
  static connectZod = Connect.zodSchema()

  static zodSchema = createZodSchema.bind(ConnectWhere)
}
