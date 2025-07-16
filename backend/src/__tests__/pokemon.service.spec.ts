import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../infra/database/prisma.service'
import { Service as PokemonService } from '../modules/pokemon/service'
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

describe('PokemonService', () => {
  let service: PokemonService
  let mockPrisma: MockPrismaService
  let module: TestingModule

  const mockCheckPermission = checkPermission as jest.MockedFunction<typeof checkPermission>
  const mockZodValidation = ZodValidationError.validate as jest.MockedFunction<typeof ZodValidationError.validate>

  beforeEach(async () => {
    mockPrisma = createMockPrismaService()

    module = await Test.createTestingModule({
      providers: [
        PokemonService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile()

    service = module.get<PokemonService>(PokemonService)

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
        data: { permissions: ['api-criar-pokemon'] },
      })
      const createData = {
        name: 'Pikachu',
        type: 'Electric',
        ability: 'Static',
        image: 'http://example.com/pikachu.png',
      }
      const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

      const mockPokemon = TestDataFactory.createPokemon({
        name: 'Pikachu',
        type: 'Electric',
        ability: 'Static',
        image: 'http://example.com/pikachu.png',
      })

      // Mock successful permission check
      mockCheckPermission.mockResolvedValue({ permitted: true })

      // Mock successful validation
      mockZodValidation.mockReturnValue(createData)

      // Mock unique name check (no existing pokemon)
      mockPrisma.pokemon.findFirst.mockResolvedValue(null)

      // Mock successful creation
      mockPrisma.pokemon.create.mockResolvedValue(mockPokemon)

      const result = await service.execute(executionDTO)

      expect(result).toEqual({
        data: {
          count: 1,
          items: [mockPokemon],
        },
      })
    })

    it('should return error if rule fails', async () => {
      const tokenData = AuthDataFactory.createTokenData({
        data: { permissions: [] }, // No permissions
      })
      const createData = {
        name: 'Pikachu',
        type: 'Electric',
        ability: 'Static',
        image: 'http://example.com/pikachu.png',
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
          name: 'Pikachu',
          type: 'Electric',
          ability: 'Static',
          image: 'http://example.com/pikachu.png',
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
          data: { permissions: ['api-criar-pokemon'] },
        })
        const createData = {
          name: 'Pikachu',
          type: 'Electric',
          ability: 'Static',
          image: 'http://example.com/pikachu.png',
        }
        const executionDTO = AuthDataFactory.createExecutionDTO('create', createData, tokenData)

        mockCheckPermission.mockResolvedValue({ permitted: true })

        const result = await service.create.rules.perm(executionDTO as any)

        expect(result.error).toBeUndefined()
        expect(result).toBe(executionDTO)
      })

      it('should fail if validation fails', async () => {
        const createData = { name: '', type: 'Electric', ability: 'Static', image: 'invalid-url' } // Invalid name and image
        const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

        mockZodValidation.mockReturnValue({
          errors: [
            { field: 'name', message: 'Name is required' },
            { field: 'image', message: 'Invalid URL format' },
          ],
        })

        const result = await service.create.rules.validateDTOData(executionDTO as any)

        expect(result.error).toEqual({
          error: {
            errors: [
              { field: 'name', message: 'Name is required' },
              { field: 'image', message: 'Invalid URL format' },
            ],
          },
        })
      })

      it('should pass if validation succeeds', async () => {
        const createData = {
          name: 'Pikachu',
          type: 'Electric',
          ability: 'Static',
          image: 'http://example.com/pikachu.png',
        }
        const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

        mockZodValidation.mockReturnValue(createData)

        const result = await service.create.rules.validateDTOData(executionDTO as any)

        expect(result.error).toBeUndefined()
        expect(result.datap).toBe(createData)
      })

      it('should fail if pokemon name already exists', async () => {
        const createData = {
          name: 'Pikachu',
          type: 'Electric',
          ability: 'Static',
          image: 'http://example.com/pikachu.png',
        }
        const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)
        const existingPokemon = TestDataFactory.createPokemon({ name: 'Pikachu' })

        mockPrisma.pokemon.findFirst.mockResolvedValue(existingPokemon)

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

      it('should pass if pokemon name is unique', async () => {
        const createData = {
          name: 'Charizard',
          type: 'Fire/Flying',
          ability: 'Blaze',
          image: 'http://example.com/charizard.png',
        }
        const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)

        mockPrisma.pokemon.findFirst.mockResolvedValue(null)

        const result = await service.create.rules.uniqueName(executionDTO as any)

        expect(result.error).toBeUndefined()
        expect(result).toBe(executionDTO)
      })
    })

    describe('execution', () => {
      it('should create pokemon successfully', async () => {
        const createData = {
          name: 'Bulbasaur',
          type: 'Grass/Poison',
          ability: 'Overgrow',
          image: 'http://example.com/bulbasaur.png',
        }
        const executionDTO = AuthDataFactory.createExecutionDTO('create', createData)
        const mockPokemon = TestDataFactory.createPokemon({
          name: 'Bulbasaur',
          type: 'Grass/Poison',
          ability: 'Overgrow',
          image: 'http://example.com/bulbasaur.png',
        })

        mockPrisma.pokemon.create.mockResolvedValue(mockPokemon)

        const result = await service.create.execution(executionDTO as any)

        expect(mockPrisma.pokemon.create).toHaveBeenCalledWith({
          data: createData,
        })

        expect(result).toEqual({
          data: {
            count: 1,
            items: [mockPokemon],
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
          data: { permissions: ['api-ler-pokemon'] },
        })
        const getData = { take: 10, skip: 0 }
        const executionDTO = AuthDataFactory.createExecutionDTO('get', getData, tokenData)

        mockCheckPermission.mockResolvedValue({ permitted: true })

        const result = await service.get.rules.perm(executionDTO as any)

        expect(result.error).toBeUndefined()
      })
    })

    describe('execution', () => {
      it('should get pokemon successfully with default pagination', async () => {
        const getData = {}
        const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)
        const mockPokemon = [
          TestDataFactory.createPokemon({ id: 1, name: 'Pikachu' }),
          TestDataFactory.createPokemon({ id: 2, name: 'Charizard' }),
        ]

        mockPrisma.pokemon.findMany.mockResolvedValue(mockPokemon)
        mockPrisma.pokemon.count.mockResolvedValue(2)

        const result = await service.get.execution(executionDTO as any)

        expect(mockPrisma.pokemon.findMany).toHaveBeenCalledWith({
          where: {},
          take: 10, // default
          skip: 0, // default
          orderBy: {
            createdAt: 'desc',
          },
        })

        expect(result).toEqual({
          data: {
            count: 2,
            items: mockPokemon,
          },
        })
      })

      it('should get pokemon with custom pagination', async () => {
        const getData = { take: 5, skip: 10 }
        const executionDTO = AuthDataFactory.createExecutionDTO('get', getData)
        const mockPokemon = [TestDataFactory.createPokemon()]

        mockPrisma.pokemon.findMany.mockResolvedValue(mockPokemon)
        mockPrisma.pokemon.count.mockResolvedValue(1)

        const result = await service.get.execution(executionDTO as any)

        expect(mockPrisma.pokemon.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 5,
            skip: 10,
          }),
        )

        expect(result).toEqual({
          data: {
            count: 1,
            items: mockPokemon,
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
        const updateData = { id: 1, name: 'Updated Pokemon' }
        const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData, tokenData)

        mockCheckPermission.mockResolvedValue({ permitted: false })

        const result = await service.update.rules.perm(executionDTO as any)

        expect(result.error).toEqual({
          error: { forbidden: 'Sem permissão para o recurso' },
        })
      })

      it('should fail if pokemon does not exist', async () => {
        const updateData = { id: 999, name: 'Updated Pokemon' }
        const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)

        mockPrisma.pokemon.findUnique.mockResolvedValue(null)

        const result = await service.update.rules.checkExists(executionDTO as any)

        expect(result.error).toEqual({
          error: { notFound: 'Pokemon não encontrado' },
        })
      })

      it('should pass if pokemon exists', async () => {
        const updateData = { id: 1, name: 'Updated Pokemon' }
        const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)
        const mockPokemon = TestDataFactory.createPokemon()

        mockPrisma.pokemon.findUnique.mockResolvedValue(mockPokemon)

        const result = await service.update.rules.checkExists(executionDTO as any)

        expect(result.error).toBeUndefined()
      })
    })

    describe('execution', () => {
      it('should update pokemon successfully', async () => {
        const updateData = { id: 1, name: 'Updated Pikachu', type: 'Electric/Psychic' }
        const executionDTO = AuthDataFactory.createExecutionDTO('update', updateData)
        const mockUpdatedPokemon = TestDataFactory.createPokemon({
          name: 'Updated Pikachu',
          type: 'Electric/Psychic',
        })

        mockPrisma.pokemon.update.mockResolvedValue(mockUpdatedPokemon)

        const result = await service.update.execution(executionDTO as any)

        expect(mockPrisma.pokemon.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { name: 'Updated Pikachu', type: 'Electric/Psychic' }, // id removed
        })

        expect(result).toEqual({
          data: {
            count: 1,
            items: [mockUpdatedPokemon],
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

      it('should fail if pokemon does not exist', async () => {
        const deleteData = { id: 999 }
        const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)

        mockPrisma.pokemon.findUnique.mockResolvedValue(null)

        const result = await service.delete.rules.checkExists(executionDTO as any)

        expect(result.error).toEqual({
          error: { notFound: 'Pokemon não encontrado' },
        })
      })
    })

    describe('execution', () => {
      it('should delete pokemon successfully', async () => {
        const deleteData = { id: 1 }
        const executionDTO = AuthDataFactory.createExecutionDTO('delete', deleteData)
        const mockDeletedPokemon = TestDataFactory.createPokemon()

        mockPrisma.pokemon.delete.mockResolvedValue(mockDeletedPokemon)

        const result = await service.delete.execution(executionDTO as any)

        expect(mockPrisma.pokemon.delete).toHaveBeenCalledWith({
          where: { id: 1 },
        })

        expect(result).toEqual({
          data: {
            count: 1,
            items: [mockDeletedPokemon],
          },
        })
      })
    })
  })
})
