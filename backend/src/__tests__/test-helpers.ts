/**
 * Test Utilities - Mocks and Factories
 */

// Mock simplificado do PrismaService sem tipos complexos
export const createMockPrismaService = () => {
    return {
        user: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        post: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        category: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        profile: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        pokemon: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        largeTable: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        postCategory: {
            deleteMany: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
        }
    }
}

export type MockPrismaService = ReturnType<typeof createMockPrismaService>

export const resetMockPrismaService = (mockPrisma: MockPrismaService) => {
    Object.values(mockPrisma).forEach(model => {
        Object.values(model).forEach(method => {
            if (jest.isMockFunction(method)) {
                method.mockReset()
            }
        })
    })
}

// Factory para criar dados de teste
export class TestDataFactory {
    static createUser(overrides: Partial<any> = {}) {
        return {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            ...overrides
        }
    }

    static createPost(overrides: Partial<any> = {}) {
        return {
            id: 1,
            title: 'Test Post',
            content: 'Test content',
            published: false,
            authorId: 1,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            ...overrides
        }
    }

    static createCategory(overrides: Partial<any> = {}) {
        return {
            id: 1,
            name: 'Test Category',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            ...overrides
        }
    }

    static createProfile(overrides: Partial<any> = {}) {
        return {
            id: 1,
            bio: 'Test bio',
            userId: 1,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            ...overrides
        }
    }

    static createPokemon(overrides: Partial<any> = {}) {
        return {
            id: 1,
            name: 'Pikachu',
            type: 'Electric',
            ability: 'Static',
            image: 'pikachu.png',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            ...overrides
        }
    }
}

// Factory para criar tokens e dados de autenticação
export class AuthDataFactory {
    static createTokenData(overrides: Partial<any> = {}) {
        return {
            sub: '1',
            data: {
                permissions: [
                    'api-ler-user',
                    'api-criar-user',
                    'api-atualizar-user',
                    'api-deletar-user'
                ]
            },
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
            ...overrides
        }
    }

    static createExecutionDTO<T = any>(method: string, datap: any, tokenData?: any): T {
        return {
            tokenData: tokenData || this.createTokenData(),
            datap,
            method,
            customData: {},
            error: undefined
        } as T
    }
}

// Utilitários para responses
export class ResponseFactory {
    static createSuccessResponse(items: any[], count?: number) {
        return {
            data: {
                items,
                count: count ?? items.length
            }
        }
    }

    static createErrorResponse(errorType: string, message: string) {
        return {
            error: {
                [errorType]: message
            }
        }
    }
} 