import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../infra/database/prisma.service'
import { Service as LargeTableService } from '../modules/large-table/service'
import {
  createMockPrismaService,
  TestDataFactory,
  AuthDataFactory,
  ResponseFactory,
  MockPrismaService,
  resetMockPrismaService,
} from './test-helpers'

// Mock dos módulos externos
jest.mock('../@shared/utils', () => ({
  checkPermission: jest.fn(),
}))

jest.mock('../@shared/graphql/errors', () => ({
  ZodValidationError: {
    validate: jest.fn(),
  },
}))

import { checkPermission } from '../@shared/utils'
import { ZodValidationError } from '../@shared/graphql/errors'

describe('LargeTableService', () => {
  let service: LargeTableService
  let mockPrisma: MockPrismaService
  let module: TestingModule

  const mockCheckPermission = checkPermission as jest.MockedFunction<typeof checkPermission>
  const mockZodValidation = ZodValidationError.validate as jest.MockedFunction<typeof ZodValidationError.validate>

  beforeEach(async () => {
    mockPrisma = createMockPrismaService()

    module = await Test.createTestingModule({
      providers: [
        LargeTableService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile()

    service = module.get<LargeTableService>(LargeTableService)

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
        data: { permissions: ['api-criar-large-table'] },
      })
      const createData = {
        name: 'Test Record',
        value: 123.45,
        timestamp: new Date('2024-01-01'),
        details: 'Test details',
      }
      const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

      const mockLargeTable = {
        id: 1,
        name: 'Test Record',
        value: 123.45,
        timestamp: new Date('2024-01-01'),
        details: 'Test details',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      // Mock successful permission check
      mockCheckPermission.mockResolvedValue({ permitted: true })

      // Mock successful validation
      mockZodValidation.mockReturnValue(createData)

      // Mock successful creation
      mockPrisma.largeTable.create.mockResolvedValue(mockLargeTable)

      const result = await service.execute(executionDTO)

      expect(result).toEqual({
        data: {
          count: 1,
          items: [mockLargeTable],
        },
      })
    })

    it('should return error if rule fails', async () => {
      const tokenData = AuthDataFactory.createTokenData({
        data: { permissions: [] }, // No permissions
      })
      const createData = {
        name: 'Test Record',
        value: 123.45,
        timestamp: new Date('2024-01-01'),
        details: 'Test details',
      }
      const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

      // Mock failed permission check
      mockCheckPermission.mockResolvedValue({ permitted: false })

      const result = await service.execute(executionDTO)

      expect(result).toEqual({
        error: { forbidden: 'Sem permissão para o recurso' },
      })
    })
  })

  describe('create', () => {
    describe('rules', () => {
      it('should fail if user has no permission', async () => {
        const tokenData = AuthDataFactory.createTokenData({
          data: { permissions: [] },
        })
        const createData = {
          name: 'Test Record',
          value: 123.45,
          timestamp: new Date('2024-01-01'),
          details: 'Test details',
        }
        const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

        mockCheckPermission.mockResolvedValue({ permitted: false })

        const result = await service.create.rules.perm(executionDTO as any)

        expect(result.error).toEqual({
          error: { forbidden: 'Sem permissão para o recurso' },
        })
      })

      it('should pass if user has permission', async () => {
        const tokenData = AuthDataFactory.createTokenData({
          data: { permissions: ['api-criar-large-table'] },
        })
        const createData = {
          name: 'Test Record',
          value: 123.45,
          timestamp: new Date('2024-01-01'),
          details: 'Test details',
        }
        const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

        mockCheckPermission.mockResolvedValue({ permitted: true })

        const result = await service.create.rules.perm(executionDTO as any)

        expect(result.error).toBeUndefined()
        expect(result).toBe(executionDTO)
      })

      it('should fail if validation fails', async () => {
        const createData = {
          name: '',
          value: 'invalid',
          timestamp: 'invalid-date',
          details: '',
        } // Invalid data
        const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

        mockZodValidation.mockReturnValue({
          errors: [
            { field: 'name', message: 'Name is required' },
            { field: 'value', message: 'Value must be a number' },
            { field: 'timestamp', message: 'Invalid date format' },
            { field: 'details', message: 'Details are required' },
          ],
        })

        const result = await service.create.rules.validateDTOData(executionDTO as any)

        expect(result.error).toEqual({
          error: {
            errors: [
              { field: 'name', message: 'Name is required' },
              { field: 'value', message: 'Value must be a number' },
              { field: 'timestamp', message: 'Invalid date format' },
              { field: 'details', message: 'Details are required' },
            ],
          },
        })
      })

      it('should pass if validation succeeds', async () => {
        const createData = {
          name: 'Analytics Data',
          value: 999.99,
          timestamp: new Date('2024-01-01'),
          details: 'Important analytics data point',
        }
        const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

        mockZodValidation.mockReturnValue(createData)

        const result = await service.create.rules.validateDTOData(executionDTO as any)

        expect(result.error).toBeUndefined()
        expect(result.datap).toBe(createData)
      })
    })

    describe('execution', () => {
      it('should create large table record successfully', async () => {
        const createData = {
          name: 'Performance Metric',
          value: 42.0,
          timestamp: new Date('2024-01-01'),
          details: 'Server response time measurement',
        }
        const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)
        const mockLargeTable = {
          id: 1,
          name: 'Performance Metric',
          value: 42.0,
          timestamp: new Date('2024-01-01'),
          details: 'Server response time measurement',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }

        mockPrisma.largeTable.create.mockResolvedValue(mockLargeTable)

        const result = await service.create.execution(executionDTO as any)

        expect(mockPrisma.largeTable.create).toHaveBeenCalledWith({
          data: createData,
        })

        expect(result).toEqual({
          data: {
            count: 1,
            items: [mockLargeTable],
          },
        })
      })
    })
  })

  describe('get', () => {
    describe('rules', () => {
      it('should fail if user has no permission', async () => {
        const tokenData = AuthDataFactory.createTokenData({
          data: { permissions: [] },
        })
        const getData = { take: 10, skip: 0 }
        const executionDTO = AuthDataFactory.createExecutionDTO('get', getData, tokenData)

        mockCheckPermission.mockResolvedValue({ permitted: false })

        const result = await service.get.rules.perm(executionDTO as any)

        expect(result.error).toEqual({
          error: { forbidden: 'Sem permissão para o recurso' },
        })
      })

      it('should pass if user has permission', async () => {
        const tokenData = AuthDataFactory.createTokenData({
          data: { permissions: ['api-ler-large-table'] },
        })
        const getData = { take: 10, skip: 0 }
        const executionDTO = AuthDataFactory.createExecutionDTO('get', getData, tokenData)

        mockCheckPermission.mockResolvedValue({ permitted: true })

        const result = await service.get.rules.perm(executionDTO as any)

        expect(result.error).toBeUndefined()
      })
    })

    describe('execution', () => {
      it('should get large table records successfully with default pagination', async () => {
        const getData = {}
        const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)
        const mockLargeTables = [
          {
            id: 1,
            name: 'Metric 1',
            value: 100.0,
            timestamp: new Date('2024-01-01'),
            details: 'First metric',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          {
            id: 2,
            name: 'Metric 2',
            value: 200.0,
            timestamp: new Date('2024-01-02'),
            details: 'Second metric',
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
          },
        ]

        mockPrisma.largeTable.findMany.mockResolvedValue(mockLargeTables)
        mockPrisma.largeTable.count.mockResolvedValue(2)

        const result = await service.get.execution(executionDTO as any)

        expect(mockPrisma.largeTable.findMany).toHaveBeenCalledWith({
          where: {},
          take: 10, // default
          skip: 0, // default
          orderBy: {
            timestamp: 'desc',
          },
        })

        expect(result).toEqual({
          data: {
            count: 2,
            items: mockLargeTables,
          },
        })
      })

      it('should get large table records with custom pagination', async () => {
        const getData = { take: 5, skip: 10 }
        const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)
        const mockLargeTables = [
          {
            id: 3,
            name: 'Metric 3',
            value: 300.0,
            timestamp: new Date('2024-01-03'),
            details: 'Third metric',
            createdAt: new Date('2024-01-03'),
            updatedAt: new Date('2024-01-03'),
          },
        ]

        mockPrisma.largeTable.findMany.mockResolvedValue(mockLargeTables)
        mockPrisma.largeTable.count.mockResolvedValue(1)

        const result = await service.get.execution(executionDTO as any)

        expect(mockPrisma.largeTable.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 5,
            skip: 10,
          }),
        )

        expect(result).toEqual({
          data: {
            count: 1,
            items: mockLargeTables,
          },
        })
      })
    })
  })

  describe('update', () => {
    describe('rules', () => {
      it('should fail if user has no permission', async () => {
        const tokenData = AuthDataFactory.createTokenData({
          data: { permissions: [] },
        })
        const updateData = { id: 1, name: 'Updated Metric', value: 999.0 }
        const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData, tokenData)

        mockCheckPermission.mockResolvedValue({ permitted: false })

        const result = await service.update.rules.perm(executionDTO as any)

        expect(result.error).toEqual({
          error: { forbidden: 'Sem permissão para o recurso' },
        })
      })

      it('should fail if large table record does not exist', async () => {
        const updateData = { id: 999, name: 'Updated Metric' }
        const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)

        mockPrisma.largeTable.findUnique.mockResolvedValue(null)

        const result = await service.update.rules.checkExists(executionDTO as any)

        expect(result.error).toEqual({
          error: { notFound: 'LargeTable não encontrado' },
        })
      })

      it('should pass if large table record exists', async () => {
        const updateData = { id: 1, name: 'Updated Metric' }
        const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)
        const mockLargeTable = {
          id: 1,
          name: 'Original Metric',
          value: 100.0,
          timestamp: new Date('2024-01-01'),
          details: 'Original details',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }

        mockPrisma.largeTable.findUnique.mockResolvedValue(mockLargeTable)

        const result = await service.update.rules.checkExists(executionDTO as any)

        expect(result.error).toBeUndefined()
      })
    })

    describe('execution', () => {
      it('should update large table record successfully', async () => {
        const updateData = {
          id: 1,
          name: 'Updated Performance Metric',
          value: 84.0,
          details: 'Updated server response time measurement',
        }
        const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)
        const mockUpdatedLargeTable = {
          id: 1,
          name: 'Updated Performance Metric',
          value: 84.0,
          timestamp: new Date('2024-01-01'),
          details: 'Updated server response time measurement',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        }

        mockPrisma.largeTable.update.mockResolvedValue(mockUpdatedLargeTable)

        const result = await service.update.execution(executionDTO as any)

        expect(mockPrisma.largeTable.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: {
            name: 'Updated Performance Metric',
            value: 84.0,
            details: 'Updated server response time measurement',
          }, // id removed
        })

        expect(result).toEqual({
          data: {
            count: 1,
            items: [mockUpdatedLargeTable],
          },
        })
      })
    })
  })

  describe('delete', () => {
    describe('rules', () => {
      it('should fail if user has no permission', async () => {
        const tokenData = AuthDataFactory.createTokenData({
          data: { permissions: [] },
        })
        const deleteData = { id: 1 }
        const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData, tokenData)

        mockCheckPermission.mockResolvedValue({ permitted: false })

        const result = await service.delete.rules.perm(executionDTO as any)

        expect(result.error).toEqual({
          error: { forbidden: 'Sem permissão para o recurso' },
        })
      })

      it('should fail if large table record does not exist', async () => {
        const deleteData = { id: 999 }
        const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)

        mockPrisma.largeTable.findUnique.mockResolvedValue(null)

        const result = await service.delete.rules.checkExists(executionDTO as any)

        expect(result.error).toEqual({
          error: { notFound: 'LargeTable não encontrado' },
        })
      })
    })

    describe('execution', () => {
      it('should delete large table record successfully', async () => {
        const deleteData = { id: 1 }
        const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)
        const mockDeletedLargeTable = {
          id: 1,
          name: 'Deleted Metric',
          value: 42.0,
          timestamp: new Date('2024-01-01'),
          details: 'This record will be deleted',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }

        mockPrisma.largeTable.delete.mockResolvedValue(mockDeletedLargeTable)

        const result = await service.delete.execution(executionDTO as any)

        expect(mockPrisma.largeTable.delete).toHaveBeenCalledWith({
          where: { id: 1 },
        })

        expect(result).toEqual({
          data: {
            count: 1,
            items: [mockDeletedLargeTable],
          },
        })
      })
    })
  })
})
