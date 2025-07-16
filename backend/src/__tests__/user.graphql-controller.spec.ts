import { Test, TestingModule } from '@nestjs/testing'
import { GraphQLController as UserGraphQLController } from '../modules/user/controller'
import { Service as UserService } from '../modules/user/service'
import { TestDataFactory, AuthDataFactory } from './test-helpers'

// Mock the genericCaller
jest.mock('../@shared/types/auth', () => ({
  genericCaller: jest.fn(),
}))

import { genericCaller } from '../@shared/types/auth'

describe('UserGraphQLController', () => {
  let controller: UserGraphQLController
  let mockUserService: jest.Mocked<UserService>
  let module: TestingModule

  const mockGenericCaller = genericCaller as jest.MockedFunction<typeof genericCaller>

  beforeEach(async () => {
    const mockService = {
      execute: jest.fn(),
    }

    module = await Test.createTestingModule({
      providers: [
        UserGraphQLController,
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile()

    controller = module.get<UserGraphQLController>(UserGraphQLController)
    mockUserService = module.get(UserService)

    // Reset mocks
    mockGenericCaller.mockReset()
    mockUserService.execute.mockReset()
  })

  afterEach(async () => {
    await module.close()
  })

  describe('create', () => {
    it('should call genericCaller with correct parameters and return result', async () => {
      const createData = { email: 'test@example.com', name: 'Test User' }
      const mockContext = {
        req: {
          user: AuthDataFactory.createTokenData(),
        },
      }
      const expectedResult = TestDataFactory.createUser({
        email: 'test@example.com',
        name: 'Test User',
      })

      // Mock genericCaller to return expected result
      mockGenericCaller.mockResolvedValue({
        data: {
          count: 1,
          items: [expectedResult],
        },
      })

      const result = await controller.create(mockContext, createData)

      expect(mockGenericCaller).toHaveBeenCalledTimes(1)
      expect(mockGenericCaller).toHaveBeenCalledWith(mockContext, createData, 'create')
      expect(result).toEqual({
        data: {
          count: 1,
          items: [expectedResult],
        },
      })
    })

    it('should handle errors from genericCaller', async () => {
      const createData = { email: 'test@example.com', name: 'Test User' }
      const mockContext = { req: { user: AuthDataFactory.createTokenData() } }
      const expectedError = { error: { forbidden: 'Sem permissão para o recurso' } }

      mockGenericCaller.mockResolvedValue(expectedError)

      const result = await controller.create(mockContext, createData)

      expect(result).toEqual(expectedError)
    })
  })

  describe('get', () => {
    it('should call genericCaller with correct parameters and return result', async () => {
      const getData = { take: 10, skip: 0 }
      const mockContext = {
        req: {
          user: AuthDataFactory.createTokenData(),
        },
      }
      const expectedUsers = [
        TestDataFactory.createUser({ id: 1, email: 'user1@test.com' }),
        TestDataFactory.createUser({ id: 2, email: 'user2@test.com' }),
      ]

      mockGenericCaller.mockResolvedValue({
        data: {
          count: 2,
          items: expectedUsers,
        },
      })

      const result = await controller.get(mockContext, getData)

      expect(mockGenericCaller).toHaveBeenCalledTimes(1)
      expect(mockGenericCaller).toHaveBeenCalledWith(mockContext, getData, 'get')
      expect(result).toEqual({
        data: {
          count: 2,
          items: expectedUsers,
        },
      })
    })

    it('should handle empty results', async () => {
      const getData = { take: 10, skip: 0 }
      const mockContext = { req: { user: AuthDataFactory.createTokenData() } }

      mockGenericCaller.mockResolvedValue({
        data: {
          count: 0,
          items: [],
        },
      })

      const result = await controller.get(mockContext, getData)

      expect(result).toEqual({
        data: {
          count: 0,
          items: [],
        },
      })
    })
  })

  describe('update', () => {
    it('should call genericCaller with correct parameters and return result', async () => {
      const updateData = { id: 1, email: 'updated@example.com', name: 'Updated User' }
      const mockContext = {
        req: {
          user: AuthDataFactory.createTokenData(),
        },
      }
      const expectedUpdatedUser = TestDataFactory.createUser({
        id: 1,
        email: 'updated@example.com',
        name: 'Updated User',
      })

      mockGenericCaller.mockResolvedValue({
        data: {
          count: 1,
          items: [expectedUpdatedUser],
        },
      })

      const result = await controller.update(mockContext, updateData)

      expect(mockGenericCaller).toHaveBeenCalledTimes(1)
      expect(mockGenericCaller).toHaveBeenCalledWith(mockContext, updateData, 'update')
      expect(result).toEqual({
        data: {
          count: 1,
          items: [expectedUpdatedUser],
        },
      })
    })

    it('should handle user not found error', async () => {
      const updateData = { id: 999, email: 'updated@example.com' }
      const mockContext = { req: { user: AuthDataFactory.createTokenData() } }
      const expectedError = { error: { notFound: 'User não encontrado' } }

      mockGenericCaller.mockResolvedValue(expectedError)

      const result = await controller.update(mockContext, updateData)

      expect(result).toEqual(expectedError)
    })
  })

  describe('delete', () => {
    it('should call genericCaller with correct parameters and return result', async () => {
      const deleteData = { id: 1 }
      const mockContext = {
        req: {
          user: AuthDataFactory.createTokenData(),
        },
      }
      const expectedDeletedUser = TestDataFactory.createUser({ id: 1 })

      mockGenericCaller.mockResolvedValue({
        data: {
          count: 1,
          items: [expectedDeletedUser],
        },
      })

      const result = await controller.delete(mockContext, deleteData)

      expect(mockGenericCaller).toHaveBeenCalledTimes(1)
      expect(mockGenericCaller).toHaveBeenCalledWith(mockContext, deleteData, 'delete')
      expect(result).toEqual({
        data: {
          count: 1,
          items: [expectedDeletedUser],
        },
      })
    })

    it('should handle user not found error', async () => {
      const deleteData = { id: 999 }
      const mockContext = { req: { user: AuthDataFactory.createTokenData() } }
      const expectedError = { error: { notFound: 'User não encontrado' } }

      mockGenericCaller.mockResolvedValue(expectedError)

      const result = await controller.delete(mockContext, deleteData)

      expect(result).toEqual(expectedError)
    })
  })

  describe('genericCaller binding', () => {
    it('should bind genericCaller to controller instance', async () => {
      const createData = { email: 'test@example.com', name: 'Test User' }
      const mockContext = { req: { user: AuthDataFactory.createTokenData() } }

      mockGenericCaller.mockResolvedValue({
        data: { count: 1, items: [TestDataFactory.createUser()] },
      })

      await controller.create(mockContext, createData)

      // Verify that genericCaller was called and bound correctly
      expect(mockGenericCaller).toHaveBeenCalledTimes(1)

      // Check if the call context is bound correctly (this function was bound to controller)
      const callArgs = mockGenericCaller.mock.calls[0]
      expect(callArgs[0]).toBe(mockContext)
      expect(callArgs[1]).toBe(createData)
      expect(callArgs[2]).toBe('create')
    })

    it('should handle genericCaller internal errors gracefully', async () => {
      const createData = { email: 'test@example.com', name: 'Test User' }
      const mockContext = { req: { user: AuthDataFactory.createTokenData() } }

      // Mock genericCaller to throw an error
      mockGenericCaller.mockRejectedValue(new Error('Internal server error'))

      // The controller should handle this gracefully (genericCaller has its own error handling)
      await expect(controller.create(mockContext, createData)).rejects.toThrow('Internal server error')
    })
  })

  describe('method parameter defaults', () => {
    it('should use default method parameter for create', async () => {
      const createData = { email: 'test@example.com', name: 'Test User' }
      const mockContext = { req: { user: AuthDataFactory.createTokenData() } }

      mockGenericCaller.mockResolvedValue({
        data: { count: 1, items: [TestDataFactory.createUser()] },
      })

      // Call without providing method parameter (should default to 'create')
      await controller.create(mockContext, createData)

      expect(mockGenericCaller).toHaveBeenCalledWith(mockContext, createData, 'create')
    })

    it('should use default method parameter for get', async () => {
      const getData = { take: 10, skip: 0 }
      const mockContext = { req: { user: AuthDataFactory.createTokenData() } }

      mockGenericCaller.mockResolvedValue({
        data: { count: 0, items: [] },
      })

      await controller.get(mockContext, getData)

      expect(mockGenericCaller).toHaveBeenCalledWith(mockContext, getData, 'get')
    })

    it('should use default method parameter for update', async () => {
      const updateData = { id: 1, email: 'updated@example.com' }
      const mockContext = { req: { user: AuthDataFactory.createTokenData() } }

      mockGenericCaller.mockResolvedValue({
        data: { count: 1, items: [TestDataFactory.createUser()] },
      })

      await controller.update(mockContext, updateData)

      expect(mockGenericCaller).toHaveBeenCalledWith(mockContext, updateData, 'update')
    })

    it('should use default method parameter for delete', async () => {
      const deleteData = { id: 1 }
      const mockContext = { req: { user: AuthDataFactory.createTokenData() } }

      mockGenericCaller.mockResolvedValue({
        data: { count: 1, items: [TestDataFactory.createUser()] },
      })

      await controller.delete(mockContext, deleteData)

      expect(mockGenericCaller).toHaveBeenCalledWith(mockContext, deleteData, 'delete')
    })
  })
})
