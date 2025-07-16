import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../infra/database/prisma.service'
import { Service as CategoryService } from '../modules/category/service'
import {
    createMockPrismaService,
    TestDataFactory,
    AuthDataFactory,
    ResponseFactory,
    MockPrismaService,
    resetMockPrismaService
} from './test-helpers'

// Mock dos módulos externos
jest.mock('../@shared/utils', () => ({
    checkPermission: jest.fn()
}))

jest.mock('../@shared/graphql/errors', () => ({
    ZodValidationError: {
        validate: jest.fn()
    }
}))

import { checkPermission } from '../@shared/utils'
import { ZodValidationError } from '../@shared/graphql/errors'

describe('CategoryService', () => {
    let service: CategoryService
    let mockPrisma: MockPrismaService
    let module: TestingModule

    const mockCheckPermission = checkPermission as jest.MockedFunction<typeof checkPermission>
    const mockZodValidation = ZodValidationError.validate as jest.MockedFunction<typeof ZodValidationError.validate>

    beforeEach(async () => {
        mockPrisma = createMockPrismaService()

        module = await Test.createTestingModule({
            providers: [
                CategoryService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile()

        service = module.get<CategoryService>(CategoryService)

        // Reset all mocks
        resetMockPrismaService(mockPrisma)
        mockCheckPermission.mockReset()
        mockZodValidation.mockReset()
    })

    afterEach(async () => {
        await module.close()
    })

    describe('execute', () => {
        it('should process rules and execute successfully', async () => {
            const tokenData = AuthDataFactory.createTokenData({
                data: { permissions: ['api-criar-category'] }
            })
            const createData = { name: 'Technology' }
            const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

            const mockCategory = TestDataFactory.createCategory({
                name: 'Technology'
            })

            // Mock successful permission check
            mockCheckPermission.mockResolvedValue({ permitted: true })

            // Mock successful validation
            mockZodValidation.mockReturnValue(createData)

            // Mock unique name check (no existing category)
            mockPrisma.category.findFirst.mockResolvedValue(null)

            // Mock successful creation
            mockPrisma.category.create.mockResolvedValue(mockCategory)

            const result = await service.execute(executionDTO)

            expect(result).toEqual({
                data: {
                    count: 1,
                    items: [mockCategory]
                }
            })
        })

        it('should return error if rule fails', async () => {
            const tokenData = AuthDataFactory.createTokenData({
                data: { permissions: [] } // No permissions
            })
            const createData = { name: 'Technology' }
            const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

            // Mock failed permission check
            mockCheckPermission.mockResolvedValue({ permitted: false })

            const result = await service.execute(executionDTO)

            expect(result).toEqual({
                error: { forbidden: 'Sem permissão para o recurso' }
            })
        })
    })

    describe('create', () => {
        describe('rules', () => {
            it('should fail if user has no permission', async () => {
                const tokenData = AuthDataFactory.createTokenData({
                    data: { permissions: [] }
                })
                const createData = { name: 'Technology' }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: false })

                const result = await service.create.rules.perm(executionDTO as any)

                expect(result.error).toEqual({
                    error: { forbidden: 'Sem permissão para o recurso' }
                })
            })

            it('should pass if user has permission', async () => {
                const tokenData = AuthDataFactory.createTokenData({
                    data: { permissions: ['api-criar-category'] }
                })
                const createData = { name: 'Technology' }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: true })

                const result = await service.create.rules.perm(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(result).toBe(executionDTO)
            })

            it('should fail if validation fails', async () => {
                const createData = { name: '' } // Invalid empty name
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                mockZodValidation.mockReturnValue({
                    errors: [{ field: 'name', message: 'Name is required' }]
                })

                const result = await service.create.rules.validateDTOData(executionDTO as any)

                expect(result.error).toEqual({
                    error: {
                        errors: [{ field: 'name', message: 'Name is required' }]
                    }
                })
            })

            it('should pass if validation succeeds', async () => {
                const createData = { name: 'Technology' }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                mockZodValidation.mockReturnValue(createData)

                const result = await service.create.rules.validateDTOData(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(result.datap).toBe(createData)
            })

            it('should fail if category name already exists', async () => {
                const createData = { name: 'Technology' }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)
                const existingCategory = TestDataFactory.createCategory({ name: 'Technology' })

                mockPrisma.category.findFirst.mockResolvedValue(existingCategory)

                const result = await service.create.rules.uniqueName(executionDTO as any)

                expect(result.error).toEqual({
                    error: {
                        errors: [
                            {
                                message: 'Nome já existe',
                                path: ['name'],
                                code: 'custom',
                            },
                        ],
                    },
                })
            })

            it('should pass if category name is unique', async () => {
                const createData = { name: 'Science' }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                mockPrisma.category.findFirst.mockResolvedValue(null)

                const result = await service.create.rules.uniqueName(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(result).toBe(executionDTO)
            })
        })

        describe('execution', () => {
            it('should create category successfully', async () => {
                const createData = { name: 'Sports' }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)
                const mockCategory = TestDataFactory.createCategory({
                    name: 'Sports'
                })

                mockPrisma.category.create.mockResolvedValue(mockCategory)

                const result = await service.create.execution(executionDTO as any)

                expect(mockPrisma.category.create).toHaveBeenCalledWith({
                    data: createData,
                })

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: [mockCategory]
                    }
                })
            })
        })
    })

    describe('get', () => {
        describe('rules', () => {
            it('should fail if user has no permission', async () => {
                const tokenData = AuthDataFactory.createTokenData({
                    data: { permissions: [] }
                })
                const getData = { take: 10, skip: 0 }
                const executionDTO = AuthDataFactory.createExecutionDTO('get', getData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: false })

                const result = await service.get.rules.perm(executionDTO as any)

                expect(result.error).toEqual({
                    error: { forbidden: 'Sem permissão para o recurso' }
                })
            })

            it('should pass if user has permission', async () => {
                const tokenData = AuthDataFactory.createTokenData({
                    data: { permissions: ['api-ler-category'] }
                })
                const getData = { take: 10, skip: 0 }
                const executionDTO = AuthDataFactory.createExecutionDTO('get', getData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: true })

                const result = await service.get.rules.perm(executionDTO as any)

                expect(result.error).toBeUndefined()
            })
        })

        describe('execution', () => {
            it('should get categories successfully with default pagination', async () => {
                const getData = {}
                const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)
                const mockCategories = [
                    TestDataFactory.createCategory({ id: 1, name: 'Technology' }),
                    TestDataFactory.createCategory({ id: 2, name: 'Sports' })
                ]

                mockPrisma.category.findMany.mockResolvedValue(mockCategories)
                mockPrisma.category.count.mockResolvedValue(2)

                const result = await service.get.execution(executionDTO as any)

                expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
                    where: {},
                    take: 10, // default
                    skip: 0, // default
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        posts: {
                            include: {
                                post: true,
                            },
                        },
                    },
                })

                expect(result).toEqual({
                    data: {
                        count: 2,
                        items: mockCategories
                    }
                })
            })

            it('should get categories with custom pagination', async () => {
                const getData = { take: 5, skip: 10 }
                const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)
                const mockCategories = [TestDataFactory.createCategory()]

                mockPrisma.category.findMany.mockResolvedValue(mockCategories)
                mockPrisma.category.count.mockResolvedValue(1)

                const result = await service.get.execution(executionDTO as any)

                expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        take: 5,
                        skip: 10
                    })
                )

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: mockCategories
                    }
                })
            })
        })
    })

    describe('update', () => {
        describe('rules', () => {
            it('should fail if user has no permission', async () => {
                const tokenData = AuthDataFactory.createTokenData({
                    data: { permissions: [] }
                })
                const updateData = { id: 1, name: 'Updated Category' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: false })

                const result = await service.update.rules.perm(executionDTO as any)

                expect(result.error).toEqual({
                    error: { forbidden: 'Sem permissão para o recurso' }
                })
            })

            it('should fail if category does not exist', async () => {
                const updateData = { id: 999, name: 'Updated Category' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)

                mockPrisma.category.findUnique.mockResolvedValue(null)

                const result = await service.update.rules.checkExists(executionDTO as any)

                expect(result.error).toEqual({
                    error: { notFound: 'Category não encontrada' }
                })
            })

            it('should pass if category exists', async () => {
                const updateData = { id: 1, name: 'Updated Category' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)
                const mockCategory = TestDataFactory.createCategory()

                mockPrisma.category.findUnique.mockResolvedValue(mockCategory)

                const result = await service.update.rules.checkExists(executionDTO as any)

                expect(result.error).toBeUndefined()
            })
        })

        describe('execution', () => {
            it('should update category successfully', async () => {
                const updateData = { id: 1, name: 'Updated Technology' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)
                const mockUpdatedCategory = TestDataFactory.createCategory({
                    name: 'Updated Technology',
                    posts: []
                })

                mockPrisma.category.update.mockResolvedValue(mockUpdatedCategory)

                const result = await service.update.execution(executionDTO as any)

                expect(mockPrisma.category.update).toHaveBeenCalledWith({
                    where: { id: 1 },
                    data: { name: 'Updated Technology' }, // id removed
                    include: {
                        posts: {
                            include: {
                                post: true,
                            },
                        },
                    },
                })

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: [mockUpdatedCategory]
                    }
                })
            })
        })
    })

    describe('delete', () => {
        describe('rules', () => {
            it('should fail if user has no permission', async () => {
                const tokenData = AuthDataFactory.createTokenData({
                    data: { permissions: [] }
                })
                const deleteData = { id: 1 }
                const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: false })

                const result = await service.delete.rules.perm(executionDTO as any)

                expect(result.error).toEqual({
                    error: { forbidden: 'Sem permissão para o recurso' }
                })
            })

            it('should fail if category does not exist', async () => {
                const deleteData = { id: 999 }
                const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)

                mockPrisma.category.findUnique.mockResolvedValue(null)

                const result = await service.delete.rules.checkExists(executionDTO as any)

                expect(result.error).toEqual({
                    error: { notFound: 'Category não encontrada' }
                })
            })
        })

        describe('execution', () => {
            it('should delete category and related post relationships successfully', async () => {
                const deleteData = { id: 1 }
                const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)
                const mockDeletedCategory = TestDataFactory.createCategory()

                mockPrisma.postCategory.deleteMany.mockResolvedValue({ count: 3 })
                mockPrisma.category.delete.mockResolvedValue(mockDeletedCategory)

                const result = await service.delete.execution(executionDTO as any)

                expect(mockPrisma.postCategory.deleteMany).toHaveBeenCalledWith({
                    where: { categoryId: 1 }
                })

                expect(mockPrisma.category.delete).toHaveBeenCalledWith({
                    where: { id: 1 }
                })

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: [mockDeletedCategory]
                    }
                })
            })
        })
    })
}) 