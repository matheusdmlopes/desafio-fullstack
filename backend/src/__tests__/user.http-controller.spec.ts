import { Test, TestingModule } from '@nestjs/testing'
import { HttpController as UserHttpController } from '../modules/user/http-controller'
import { Service as UserService } from '../modules/user/service'
import { TestDataFactory, ResponseFactory } from './test-helpers'

describe('UserHttpController', () => {
    let controller: UserHttpController
    let mockUserService: jest.Mocked<UserService>

    beforeEach(async () => {
        // Create mock service
        mockUserService = {
            execute: jest.fn(),
        } as any

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserHttpController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile()

        controller = module.get<UserHttpController>(UserHttpController)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('create', () => {
        it('should create a user successfully', async () => {
            // Arrange
            const createData = { email: 'test@example.com', name: 'Test User' }
            const createdUser = TestDataFactory.createUser(createData)
            const expectedResponse = ResponseFactory.createSuccessResponse([createdUser])

            const mockRequest = {
                tokenData: { sub: '1', data: { permissions: ['api-criar-user'] } }
            }

            mockUserService.execute.mockResolvedValue(expectedResponse)

            // Act
            const result = await controller.create(mockRequest, createData)

            // Assert
            expect(result).toEqual(expectedResponse)
            expect(mockUserService.execute).toHaveBeenCalledWith({
                tokenData: mockRequest.tokenData,
                datap: createData,
                method: 'create',
                customData: {},
                error: undefined
            })
        })

        it('should handle service errors', async () => {
            // Arrange
            const createData = { email: 'test@example.com', name: 'Test User' }
            const errorResponse = ResponseFactory.createErrorResponse('forbidden', 'Sem permissão')

            const mockRequest = {
                tokenData: { sub: '1', data: { permissions: [] } }
            }

            mockUserService.execute.mockResolvedValue(errorResponse)

            // Act
            const result = await controller.create(mockRequest, createData)

            // Assert
            expect(result).toEqual(errorResponse)
            expect(mockUserService.execute).toHaveBeenCalledWith({
                tokenData: mockRequest.tokenData,
                datap: createData,
                method: 'create',
                customData: {},
                error: undefined
            })
        })
    })

    describe('getAll', () => {
        it('should retrieve users with query parameters', async () => {
            // Arrange
            const queryParams = { skip: '0', take: '10' }
            const users = [
                TestDataFactory.createUser({ id: 1, email: 'user1@test.com' }),
                TestDataFactory.createUser({ id: 2, email: 'user2@test.com' })
            ]
            const expectedResponse = ResponseFactory.createSuccessResponse(users, 2)

            const mockRequest = {
                tokenData: { sub: '1', data: { permissions: ['api-ler-user'] } }
            }

            mockUserService.execute.mockResolvedValue(expectedResponse)

            // Act
            const result = await controller.getAll(mockRequest, queryParams)

            // Assert
            expect(result).toEqual(expectedResponse)
            expect(mockUserService.execute).toHaveBeenCalledWith({
                tokenData: mockRequest.tokenData,
                datap: {
                    skip: 0,
                    take: 10,
                    andWhere: undefined,
                    orWhere: undefined,
                    andWhereNot: undefined,
                    orWhereNot: undefined,
                    orderBy: undefined
                },
                method: 'get',
                customData: {},
                error: undefined
            })
        })
    })

    describe('getById', () => {
        it('should retrieve a specific user by ID', async () => {
            // Arrange
            const userId = '1'
            const user = TestDataFactory.createUser({ id: 1 })
            const expectedResponse = ResponseFactory.createSuccessResponse([user])

            const mockRequest = {
                tokenData: { sub: '1', data: { permissions: ['api-ler-user'] } }
            }

            mockUserService.execute.mockResolvedValue(expectedResponse)

            // Act
            const result = await controller.getById(mockRequest, userId)

            // Assert
            expect(result).toEqual(expectedResponse)
            expect(mockUserService.execute).toHaveBeenCalledWith({
                tokenData: mockRequest.tokenData,
                datap: {
                    andWhere: [{ field: 'id', fieldType: 'valueInt', valueInt: 1 }],
                    take: 1
                },
                method: 'get',
                customData: {},
                error: undefined
            })
        })

        it('should handle invalid user ID', async () => {
            // Arrange
            const userId = 'invalid'

            const mockRequest = {
                tokenData: { sub: '1', data: { permissions: ['api-ler-user'] } }
            }

            // Act
            const result = await controller.getById(mockRequest, userId)

            // Assert
            expect(result).toEqual({ error: { badRequest: 'Invalid ID format' } })
            expect(mockUserService.execute).not.toHaveBeenCalled()
        })
    })

    describe('update', () => {
        it('should update a user successfully', async () => {
            // Arrange
            const userId = '1'
            const updateData = { email: 'updated@test.com', name: 'Updated User' }
            const updatedUser = TestDataFactory.createUser({ id: 1, ...updateData })
            const expectedResponse = ResponseFactory.createSuccessResponse([updatedUser])

            const mockRequest = {
                tokenData: { sub: '1', data: { permissions: ['api-atualizar-user'] } }
            }

            mockUserService.execute.mockResolvedValue(expectedResponse)

            // Act
            const result = await controller.update(mockRequest, userId, updateData)

            // Assert
            expect(result).toEqual(expectedResponse)
            expect(mockUserService.execute).toHaveBeenCalledWith({
                tokenData: mockRequest.tokenData,
                datap: { id: 1, ...updateData },
                method: 'update',
                customData: {},
                error: undefined
            })
        })

        it('should handle invalid user ID', async () => {
            // Arrange
            const userId = 'invalid'
            const updateData = { email: 'updated@test.com', name: 'Updated User' }

            const mockRequest = {
                tokenData: { sub: '1', data: { permissions: ['api-atualizar-user'] } }
            }

            // Act
            const result = await controller.update(mockRequest, userId, updateData)

            // Assert
            expect(result).toEqual({ error: { badRequest: 'Invalid ID format' } })
            expect(mockUserService.execute).not.toHaveBeenCalled()
        })
    })

    describe('delete', () => {
        it('should delete a user successfully', async () => {
            // Arrange
            const userId = '1'
            const deletedUser = TestDataFactory.createUser({ id: 1 })
            const expectedResponse = ResponseFactory.createSuccessResponse([deletedUser])

            const mockRequest = {
                tokenData: { sub: '1', data: { permissions: ['api-deletar-user'] } }
            }

            mockUserService.execute.mockResolvedValue(expectedResponse)

            // Act
            const result = await controller.delete(mockRequest, userId)

            // Assert
            expect(result).toEqual(expectedResponse)
            expect(mockUserService.execute).toHaveBeenCalledWith({
                tokenData: mockRequest.tokenData,
                datap: { id: 1 },
                method: 'delete',
                customData: {},
                error: undefined
            })
        })

        it('should handle invalid user ID', async () => {
            // Arrange
            const userId = 'invalid'

            const mockRequest = {
                tokenData: { sub: '1', data: { permissions: ['api-deletar-user'] } }
            }

            // Act
            const result = await controller.delete(mockRequest, userId)

            // Assert
            expect(result).toEqual({ error: { badRequest: 'Invalid ID format' } })
            expect(mockUserService.execute).not.toHaveBeenCalled()
        })
    })
}) 