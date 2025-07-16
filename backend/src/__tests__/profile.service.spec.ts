import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../infra/database/prisma.service'
import { Service as ProfileService } from '../modules/profile/service'
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

describe('ProfileService', () => {
    let service: ProfileService
    let mockPrisma: MockPrismaService
    let module: TestingModule

    const mockCheckPermission = checkPermission as jest.MockedFunction<typeof checkPermission>
    const mockZodValidation = ZodValidationError.validate as jest.MockedFunction<typeof ZodValidationError.validate>

    beforeEach(async () => {
        mockPrisma = createMockPrismaService()

        module = await Test.createTestingModule({
            providers: [
                ProfileService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile()

        service = module.get<ProfileService>(ProfileService)

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
                data: { permissions: ['api-criar-profile'] }
            })
            const createData = { bio: 'Test bio', user: { connect: { id: 1 } } }
            const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

            const mockUser = TestDataFactory.createUser()
            const mockProfile = TestDataFactory.createProfile({
                bio: 'Test bio',
                userId: 1,
                user: mockUser
            })

            // Mock successful permission check
            mockCheckPermission.mockResolvedValue({ permitted: true })

            // Mock successful validation
            mockZodValidation.mockReturnValue(createData)

            // Mock user exists
            mockPrisma.user.findUnique.mockResolvedValue(mockUser)

            // Mock unique userId check (no existing profile)
            mockPrisma.profile.findFirst.mockResolvedValue(null)

            // Mock successful creation
            mockPrisma.profile.create.mockResolvedValue(mockProfile)

            const result = await service.execute(executionDTO)

            expect(result).toEqual({
                data: {
                    count: 1,
                    items: [mockProfile]
                }
            })
        })

        it('should return error if rule fails', async () => {
            const tokenData = AuthDataFactory.createTokenData({
                data: { permissions: [] } // No permissions
            })
            const createData = { bio: 'Test bio', user: { connect: { id: 1 } } }
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
                const createData = { bio: 'Test bio', user: { connect: { id: 1 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: false })

                const result = await service.create.rules.perm(executionDTO as any)

                expect(result.error).toEqual({
                    error: { forbidden: 'Sem permissão para o recurso' }
                })
            })

            it('should pass if user has permission', async () => {
                const tokenData = AuthDataFactory.createTokenData({
                    data: { permissions: ['api-criar-profile'] }
                })
                const createData = { bio: 'Test bio', user: { connect: { id: 1 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: true })

                const result = await service.create.rules.perm(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(result).toBe(executionDTO)
            })

            it('should fail if validation fails', async () => {
                const createData = { bio: '', user: { connect: { id: 'invalid' } } } // Invalid data
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                mockZodValidation.mockReturnValue({
                    errors: [
                        { field: 'user', message: 'Invalid user ID format' }
                    ]
                })

                const result = await service.create.rules.validateDTOData(executionDTO as any)

                expect(result.error).toEqual({
                    error: {
                        errors: [
                            { field: 'user', message: 'Invalid user ID format' }
                        ]
                    }
                })
            })

            it('should pass if validation succeeds', async () => {
                const createData = { bio: 'Test bio', user: { connect: { id: 1 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                mockZodValidation.mockReturnValue(createData)

                const result = await service.create.rules.validateDTOData(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(result.datap).toBe(createData)
            })

            it('should fail if user does not exist', async () => {
                const createData = { bio: 'Test bio', user: { connect: { id: 999 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                mockPrisma.user.findUnique.mockResolvedValue(null)

                const result = await service.create.rules.checkUserExists(executionDTO as any)

                expect(result.error).toEqual({
                    error: { notFound: 'Usuário não encontrado' }
                })
            })

            it('should pass if user exists', async () => {
                const createData = { bio: 'Test bio', user: { connect: { id: 1 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)
                const mockUser = TestDataFactory.createUser()

                mockPrisma.user.findUnique.mockResolvedValue(mockUser)

                const result = await service.create.rules.checkUserExists(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(result).toBe(executionDTO)
            })

            it('should skip user check if no user id provided', async () => {
                const createData = { bio: 'Test bio' }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                const result = await service.create.rules.checkUserExists(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
            })

            it('should fail if user already has a profile', async () => {
                const createData = { bio: 'Test bio', user: { connect: { id: 1 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)
                const existingProfile = TestDataFactory.createProfile({ userId: 1 })

                mockPrisma.profile.findFirst.mockResolvedValue(existingProfile)

                const result = await service.create.rules.uniqueUserId(executionDTO as any)

                expect(result.error).toEqual({
                    error: {
                        errors: [
                            {
                                message: 'Usuário já possui um perfil',
                                path: ['user'],
                                code: 'custom',
                            },
                        ],
                    },
                })
            })

            it('should pass if user does not have a profile yet', async () => {
                const createData = { bio: 'New user bio', user: { connect: { id: 2 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                mockPrisma.profile.findFirst.mockResolvedValue(null)

                const result = await service.create.rules.uniqueUserId(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(result).toBe(executionDTO)
            })

            it('should skip uniqueUserId check if no user id provided', async () => {
                const createData = { bio: 'Test bio' }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

                const result = await service.create.rules.uniqueUserId(executionDTO as any)

                expect(result.error).toBeUndefined()
                expect(mockPrisma.profile.findFirst).not.toHaveBeenCalled()
            })
        })

        describe('execution', () => {
            it('should create profile successfully', async () => {
                const createData = { bio: 'Software Developer', user: { connect: { id: 1 } } }
                const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)
                const mockProfile = TestDataFactory.createProfile({
                    bio: 'Software Developer',
                    userId: 1,
                    user: TestDataFactory.createUser()
                })

                mockPrisma.profile.create.mockResolvedValue(mockProfile)

                const result = await service.create.execution(executionDTO as any)

                expect(mockPrisma.profile.create).toHaveBeenCalledWith({
                    data: createData,
                    include: {
                        user: true,
                    },
                })

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: [mockProfile]
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
                    data: { permissions: ['api-ler-profile'] }
                })
                const getData = { take: 10, skip: 0 }
                const executionDTO = AuthDataFactory.createExecutionDTO('get', getData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: true })

                const result = await service.get.rules.perm(executionDTO as any)

                expect(result.error).toBeUndefined()
            })
        })

        describe('execution', () => {
            it('should get profiles successfully with default pagination', async () => {
                const getData = {}
                const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)
                const mockProfiles = [
                    TestDataFactory.createProfile({ id: 1, bio: 'Developer' }),
                    TestDataFactory.createProfile({ id: 2, bio: 'Designer' })
                ]

                mockPrisma.profile.findMany.mockResolvedValue(mockProfiles)
                mockPrisma.profile.count.mockResolvedValue(2)

                const result = await service.get.execution(executionDTO as any)

                expect(mockPrisma.profile.findMany).toHaveBeenCalledWith({
                    where: {},
                    take: 10, // default
                    skip: 0, // default
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        user: true,
                    },
                })

                expect(result).toEqual({
                    data: {
                        count: 2,
                        items: mockProfiles
                    }
                })
            })

            it('should get profiles with custom pagination', async () => {
                const getData = { take: 5, skip: 10 }
                const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)
                const mockProfiles = [TestDataFactory.createProfile()]

                mockPrisma.profile.findMany.mockResolvedValue(mockProfiles)
                mockPrisma.profile.count.mockResolvedValue(1)

                const result = await service.get.execution(executionDTO as any)

                expect(mockPrisma.profile.findMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        take: 5,
                        skip: 10
                    })
                )

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: mockProfiles
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
                const updateData = { id: 1, bio: 'Updated bio' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData, tokenData)

                mockCheckPermission.mockResolvedValue({ permitted: false })

                const result = await service.update.rules.perm(executionDTO as any)

                expect(result.error).toEqual({
                    error: { forbidden: 'Sem permissão para o recurso' }
                })
            })

            it('should fail if profile does not exist', async () => {
                const updateData = { id: 999, bio: 'Updated bio' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)

                mockPrisma.profile.findUnique.mockResolvedValue(null)

                const result = await service.update.rules.checkExists(executionDTO as any)

                expect(result.error).toEqual({
                    error: { notFound: 'Profile não encontrado' }
                })
            })

            it('should pass if profile exists', async () => {
                const updateData = { id: 1, bio: 'Updated bio' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)
                const mockProfile = TestDataFactory.createProfile()

                mockPrisma.profile.findUnique.mockResolvedValue(mockProfile)

                const result = await service.update.rules.checkExists(executionDTO as any)

                expect(result.error).toBeUndefined()
            })
        })

        describe('execution', () => {
            it('should update profile successfully', async () => {
                const updateData = { id: 1, bio: 'Updated Software Developer' }
                const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)
                const mockUpdatedProfile = TestDataFactory.createProfile({
                    bio: 'Updated Software Developer',
                    user: TestDataFactory.createUser()
                })

                mockPrisma.profile.update.mockResolvedValue(mockUpdatedProfile)

                const result = await service.update.execution(executionDTO as any)

                expect(mockPrisma.profile.update).toHaveBeenCalledWith({
                    where: { id: 1 },
                    data: { bio: 'Updated Software Developer' }, // id removed
                    include: {
                        user: true,
                    },
                })

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: [mockUpdatedProfile]
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

            it('should fail if profile does not exist', async () => {
                const deleteData = { id: 999 }
                const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)

                mockPrisma.profile.findUnique.mockResolvedValue(null)

                const result = await service.delete.rules.checkExists(executionDTO as any)

                expect(result.error).toEqual({
                    error: { notFound: 'Profile não encontrado' }
                })
            })
        })

        describe('execution', () => {
            it('should delete profile successfully', async () => {
                const deleteData = { id: 1 }
                const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)
                const mockDeletedProfile = TestDataFactory.createProfile()

                mockPrisma.profile.delete.mockResolvedValue(mockDeletedProfile)

                const result = await service.delete.execution(executionDTO as any)

                expect(mockPrisma.profile.delete).toHaveBeenCalledWith({
                    where: { id: 1 }
                })

                expect(result).toEqual({
                    data: {
                        count: 1,
                        items: [mockDeletedProfile]
                    }
                })
            })
        })
    })
}) 