import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../infra/database/prisma.service'
import { Service as UserService } from '../modules/user/service'
import {
    createMockPrismaService,
    MockPrismaService,
    TestDataFactory,
    AuthDataFactory,
    ResponseFactory
} from './test-helpers'

// Mock das dependências externas
jest.mock('../@shared/utils', () => ({
    checkPermission: jest.fn()
}))

describe('UserService', () => {
    let service: UserService
    let mockPrisma: MockPrismaService
    let mockCheckPermission: jest.Mock

    beforeEach(async () => {
        // Criar mock do Prisma
        mockPrisma = createMockPrismaService()

        // Mock da função checkPermission
        mockCheckPermission = require('../@shared/utils').checkPermission as jest.Mock

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile()

        service = module.get<UserService>(UserService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('create method', () => {
        it('should create a user successfully', async () => {
            // Arrange
            const createData = { email: 'test@example.com', name: 'Test User' }
            const expectedUser = TestDataFactory.createUser(createData)
            const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

            // Mock permissões
            mockCheckPermission.mockResolvedValue({ permitted: true })

            // Mock que não existe usuário com mesmo email
            mockPrisma.user.findFirst.mockResolvedValue(null)

            // Mock criação do usuário
            mockPrisma.user.create.mockResolvedValue(expectedUser)

            // Act
            const result = await service.execute(executionDTO)

            // Assert
            expect(result).toEqual(ResponseFactory.createSuccessResponse([expectedUser]))
            expect(mockCheckPermission).toHaveBeenCalledWith({
                prisma: mockPrisma,
                token: executionDTO.tokenData,
                data: ['api-criar-user']
            })
            expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
                where: { email: createData.email }
            })
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: createData
            })
        })

        it('should fail when user lacks permission', async () => {
            // Arrange
            const createData = { email: 'test@example.com', name: 'Test User' }
            const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

            // Mock permissões negadas
            mockCheckPermission.mockResolvedValue({ permitted: false })

            // Act
            const result = await service.execute(executionDTO)

            // Assert
            expect(result).toEqual(ResponseFactory.createErrorResponse('forbidden', 'Sem permissão para o recurso'))
            expect(mockPrisma.user.create).not.toHaveBeenCalled()
        })

        it('should fail when email already exists', async () => {
            // Arrange
            const createData = { email: 'test@example.com', name: 'Test User' }
            const existingUser = TestDataFactory.createUser({ email: createData.email })
            const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

            // Mock permissões
            mockCheckPermission.mockResolvedValue({ permitted: true })

            // Mock que já existe usuário com mesmo email
            mockPrisma.user.findFirst.mockResolvedValue(existingUser)

            // Act
            const result = await service.execute(executionDTO)

            // Assert
            expect(result).toEqual({
                error: {
                    errors: [
                        {
                            message: 'Email já existe',
                            path: ['email'],
                            code: 'custom',
                        },
                    ],
                },
            })
            expect(mockPrisma.user.create).not.toHaveBeenCalled()
        })

        it('should fail with invalid email format', async () => {
            // Arrange
            const createData = { email: 'invalid-email', name: 'Test User' }
            const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

            // Mock permissões
            mockCheckPermission.mockResolvedValue({ permitted: true })

            // Act
            const result = await service.execute(executionDTO)

            // Assert
            expect(result.error?.errors).toBeDefined()
            expect(mockPrisma.user.create).not.toHaveBeenCalled()
        })
    })

    describe('get method', () => {
        it('should retrieve users with pagination', async () => {
            // Arrange
            const users = [
                TestDataFactory.createUser({ id: 1, email: 'user1@test.com' }),
                TestDataFactory.createUser({ id: 2, email: 'user2@test.com' })
            ]
            const getData = { take: 10, skip: 0 }
            const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)

            // Mock permissões
            mockCheckPermission.mockResolvedValue({ permitted: true })

            // Mock busca de usuários
            mockPrisma.user.findMany.mockResolvedValue(users)
            mockPrisma.user.count.mockResolvedValue(2)

            // Act
            const result = await service.execute(executionDTO)

            // Assert
            expect(result).toEqual(ResponseFactory.createSuccessResponse(users, 2))
            expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
                where: {},
                take: 10,
                skip: 0,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    posts: true,
                    profile: true,
                },
            })
            expect(mockPrisma.user.count).toHaveBeenCalled()
        })

        it('should fail when user lacks permission to read', async () => {
            // Arrange
            const getData = { take: 10, skip: 0 }
            const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)

            // Mock permissões negadas
            mockCheckPermission.mockResolvedValue({ permitted: false })

            // Act
            const result = await service.execute(executionDTO)

            // Assert
            expect(result).toEqual(ResponseFactory.createErrorResponse('forbidden', 'Sem permissão para o recurso'))
            expect(mockPrisma.user.findMany).not.toHaveBeenCalled()
        })
    })

    describe('update method', () => {
        it('should update a user successfully', async () => {
            // Arrange
            const userId = 1
            const updateData = { id: userId, email: 'updated@test.com', name: 'Updated User' }
            const existingUser = TestDataFactory.createUser({ id: userId })
            const updatedUser = TestDataFactory.createUser(updateData)
            const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)

            // Mock permissões
            mockCheckPermission.mockResolvedValue({ permitted: true })

            // Mock que usuário existe
            mockPrisma.user.findUnique.mockResolvedValue(existingUser)

            // Mock update
            mockPrisma.user.update.mockResolvedValue(updatedUser)

            // Act
            const result = await service.execute(executionDTO)

            // Assert
            expect(result).toEqual(ResponseFactory.createSuccessResponse([updatedUser]))
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId }
            })
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { email: updateData.email, name: updateData.name },
                include: {
                    posts: true,
                    profile: true,
                },
            })
        })

        it('should fail when user does not exist', async () => {
            // Arrange
            const userId = 999
            const updateData = { id: userId, email: 'updated@test.com', name: 'Updated User' }
            const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)

            // Mock permissões
            mockCheckPermission.mockResolvedValue({ permitted: true })

            // Mock que usuário não existe
            mockPrisma.user.findUnique.mockResolvedValue(null)

            // Act
            const result = await service.execute(executionDTO)

            // Assert
            expect(result).toEqual(ResponseFactory.createErrorResponse('notFound', 'User não encontrado'))
            expect(mockPrisma.user.update).not.toHaveBeenCalled()
        })
    })

    describe('delete method', () => {
        it('should delete a user successfully', async () => {
            // Arrange
            const userId = 1
            const deleteData = { id: userId }
            const existingUser = TestDataFactory.createUser({ id: userId })
            const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)

            // Mock permissões
            mockCheckPermission.mockResolvedValue({ permitted: true })

            // Mock que usuário existe
            mockPrisma.user.findUnique.mockResolvedValue(existingUser)

            // Mock delete
            mockPrisma.user.delete.mockResolvedValue(existingUser)

            // Act
            const result = await service.execute(executionDTO)

            // Assert
            expect(result).toEqual(ResponseFactory.createSuccessResponse([existingUser]))
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId }
            })
            expect(mockPrisma.user.delete).toHaveBeenCalledWith({
                where: { id: userId }
            })
        })

        it('should fail when user does not exist', async () => {
            // Arrange
            const userId = 999
            const deleteData = { id: userId }
            const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)

            // Mock permissões
            mockCheckPermission.mockResolvedValue({ permitted: true })

            // Mock que usuário não existe
            mockPrisma.user.findUnique.mockResolvedValue(null)

            // Act
            const result = await service.execute(executionDTO)

            // Assert
            expect(result).toEqual(ResponseFactory.createErrorResponse('notFound', 'User não encontrado'))
            expect(mockPrisma.user.delete).not.toHaveBeenCalled()
        })
    })
}) 