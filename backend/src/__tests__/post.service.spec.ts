import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../infra/database/prisma.service'
import { Service as PostService } from '../modules/post/service'
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

describe('PostService', () => {
    let service: PostService
    let mockPrisma: MockPrismaService
    let module: TestingModule

    const mockCheckPermission = checkPermission as jest.MockedFunction<typeof checkPermission>
    const mockZodValidation = ZodValidationError.validate as jest.MockedFunction<typeof ZodValidationError.validate>

    beforeEach(async () => {
        mockPrisma = createMockPrismaService()

        module = await Test.createTestingModule({
            providers: [
                PostService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile()

        service = module.get<PostService>(PostService)

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
                data: { permissions: ['api-criar-post'] }
            })
            const createData = { title: 'Test Post', content: 'Test content', author: { connect: { id: 1 } } }
            const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

            const mockUser = TestDataFactory.createUser()
            const mockPost = TestDataFactory.createPost({
                title: 'Test Post',
                content: 'Test content',
                author: mockUser,
                categories: []
            })

            // Mock successful permission check
            mockCheckPermission.mockResolvedValue({ permitted: true })

            // Mock successful validation
            mockZodValidation.mockReturnValue(createData)

            // Mock author exists
            mockPrisma.user.findUnique.mockResolvedValue(mockUser)

            // Mock successful creation
            mockPrisma.post.create.mockResolvedValue(mockPost)

            const result = await service.execute(executionDTO)

            expect(result).toEqual({
                data: {
                    count: 1,
                    items: [mockPost]
                }
            })
        })

        it('should return error if rule fails', async () => {
            const tokenData = AuthDataFactory.createTokenData({
                data: { permissions: [] } // No permissions
            })
            const createData = { title: 'Test Post', content: 'Test content', author: { connect: { id: 1 } } }
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
                const createData = { title: 'Test Post', content: 'Test content', author: { connect: { id: 1 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: false })

                const result = await service.create.rules.perm(executionDTO as any)

                expect(result.error).toEqual({
                    error: { forbidden: 'Sem permissão para o recurso' }
                })
            })

            it('should pass if user has permission', async () => {
                const tokenData = AuthDataFactory.createTokenData({
                    data: { permissions: ['api-criar-post'] }
                })
                const createData = { title: 'Test Post', content: 'Test content', author: { connect: { id: 1 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: true })

                const result = await service.create.rules.perm(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(result).toBe(executionDTO)
            })

            it('should fail if validation fails', async () => {
                const createData = { title: '', content: 'Test content' } // Invalid title
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                mockZodValidation.mockReturnValue({
                    errors: [{ field: 'title', message: 'Title is required' }]
                })

                const result = await service.create.rules.validateDTOData(executionDTO as any)

                expect(result.error).toEqual({
                    error: { errors: [{ field: 'title', message: 'Title is required' }] }
                })
            })

            it('should pass if validation succeeds', async () => {
                const createData = { title: 'Test Post', content: 'Test content', author: { connect: { id: 1 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                mockZodValidation.mockReturnValue(createData)

                const result = await service.create.rules.validateDTOData(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(result.datap).toBe(createData)
            })

            it('should fail if author does not exist', async () => {
                const createData = { title: 'Test Post', content: 'Test content', author: { connect: { id: 999 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                mockPrisma.user.findUnique.mockResolvedValue(null)

                const result = await service.create.rules.checkAuthorExists(executionDTO as any)

                expect(result.error).toEqual({
                    error: { notFound: 'Autor não encontrado' }
                })
            })

            it('should pass if author exists', async () => {
                const createData = { title: 'Test Post', content: 'Test content', author: { connect: { id: 1 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)
                const mockUser = TestDataFactory.createUser()

                mockPrisma.user.findUnique.mockResolvedValue(mockUser)

                const result = await service.create.rules.checkAuthorExists(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(result).toBe(executionDTO)
            })

            it('should skip author check if no author id provided', async () => {
                const createData = { title: 'Test Post', content: 'Test content' }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                const result = await service.create.rules.checkAuthorExists(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
            })
        })

        describe('execution', () => {
            it('should create post successfully', async () => {
                const createData = { title: 'Test Post', content: 'Test content', author: { connect: { id: 1 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)
                const mockPost = TestDataFactory.createPost({
                    title: 'Test Post',
                    content: 'Test content',
                    author: TestDataFactory.createUser(),
                    categories: []
                })

                mockPrisma.post.create.mockResolvedValue(mockPost)

                const result = await service.create.execution(executionDTO)

                expect(mockPrisma.post.create).toHaveBeenCalledWith({
                    data: createData,
                    include: {
                        author: true,
                        categories: {
                            include: {
                                category: true,
                            },
                        },
                    },
                })

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: [mockPost]
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
                    data: { permissions: ['api-ler-post'] }
                })
                const getData = { take: 10, skip: 0 }
                const executionDTO = AuthDataFactory.createExecutionDTO('get', getData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: true })

                const result = await service.get.rules.perm(executionDTO as any)

                expect(result.error).toBeUndefined()
            })
        })

        describe('execution', () => {
            it('should get posts successfully with default pagination', async () => {
                const getData = {}
                const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)
                const mockPosts = [
                    TestDataFactory.createPost({ id: 1, title: 'Post 1' }),
                    TestDataFactory.createPost({ id: 2, title: 'Post 2' })
                ]

                mockPrisma.post.findMany.mockResolvedValue(mockPosts)
                mockPrisma.post.count.mockResolvedValue(2)

                const result = await service.get.execution(executionDTO)

                expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
                    where: {},
                    take: 10, // default
                    skip: 0, // default
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        author: true,
                        categories: {
                            include: {
                                category: true,
                            },
                        },
                    },
                })

                expect(result).toEqual({
                    data: {
                        count: 2,
                        items: mockPosts
                    }
                })
            })

            it('should get posts with custom pagination', async () => {
                const getData = { take: 5, skip: 10 }
                const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)
                const mockPosts = [TestDataFactory.createPost()]

                mockPrisma.post.findMany.mockResolvedValue(mockPosts)
                mockPrisma.post.count.mockResolvedValue(1)

                const result = await service.get.execution(executionDTO)

                expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        take: 5,
                        skip: 10
                    })
                )

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: mockPosts
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
                const updateData = { id: 1, title: 'Updated Post' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: false })

                const result = await service.update.rules.perm(executionDTO)

                expect(result.error).toEqual({
                    error: { forbidden: 'Sem permissão para o recurso' }
                })
            })

            it('should fail if post does not exist', async () => {
                const updateData = { id: 999, title: 'Updated Post' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)

                mockPrisma.post.findUnique.mockResolvedValue(null)

                const result = await service.update.rules.checkExists(executionDTO)

                expect(result.error).toEqual({
                    error: { notFound: 'Post não encontrado' }
                })
            })

            it('should pass if post exists', async () => {
                const updateData = { id: 1, title: 'Updated Post' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)
                const mockPost = TestDataFactory.createPost()

                mockPrisma.post.findUnique.mockResolvedValue(mockPost)

                const result = await service.update.rules.checkExists(executionDTO)

                expect(result.error).toBeUndefined()
            })
        })

        describe('execution', () => {
            it('should update post successfully', async () => {
                const updateData = { id: 1, title: 'Updated Post', content: 'Updated content' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)
                const mockUpdatedPost = TestDataFactory.createPost({
                    title: 'Updated Post',
                    content: 'Updated content',
                    author: TestDataFactory.createUser(),
                    categories: []
                })

                mockPrisma.post.update.mockResolvedValue(mockUpdatedPost)

                const result = await service.update.execution(executionDTO)

                expect(mockPrisma.post.update).toHaveBeenCalledWith({
                    where: { id: 1 },
                    data: { title: 'Updated Post', content: 'Updated content' }, // id removed
                    include: {
                        author: true,
                        categories: {
                            include: {
                                category: true,
                            },
                        },
                    },
                })

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: [mockUpdatedPost]
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

                const result = await service.delete.rules.perm(executionDTO)

                expect(result.error).toEqual({
                    error: { forbidden: 'Sem permissão para o recurso' }
                })
            })

            it('should fail if post does not exist', async () => {
                const deleteData = { id: 999 }
                const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)

                mockPrisma.post.findUnique.mockResolvedValue(null)

                const result = await service.delete.rules.checkExists(executionDTO)

                expect(result.error).toEqual({
                    error: { notFound: 'Post não encontrado' }
                })
            })
        })

        describe('execution', () => {
            it('should delete post and related categories successfully', async () => {
                const deleteData = { id: 1 }
                const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)
                const mockDeletedPost = TestDataFactory.createPost()

                mockPrisma.postCategory.deleteMany.mockResolvedValue({ count: 2 })
                mockPrisma.post.delete.mockResolvedValue(mockDeletedPost)

                const result = await service.delete.execution(executionDTO)

                expect(mockPrisma.postCategory.deleteMany).toHaveBeenCalledWith({
                    where: { postId: 1 }
                })

                expect(mockPrisma.post.delete).toHaveBeenCalledWith({
                    where: { id: 1 }
                })

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: [mockDeletedPost]
                    }
                })
            })
        })
    })
}) 