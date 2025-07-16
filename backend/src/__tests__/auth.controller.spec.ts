import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../modules/auth/auth.controller'
import * as jwt from 'jsonwebtoken'

// Mock do jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}))

describe('AuthController', () => {
  let controller: AuthController
  let mockJwt: jest.Mock

  beforeEach(async () => {
    // Reset mocks
    mockJwt = (jwt as any).sign as jest.Mock

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('autoLogin', () => {
    it('should generate a valid token and return user data', () => {
      // Arrange
      const mockToken = 'mocked-jwt-token'
      mockJwt.mockReturnValue(mockToken)

      // Act
      const result = controller.autoLogin()

      // Assert
      expect(result).toEqual({
        token: mockToken,
        user: {
          id: 1,
          email: 'demo@test.com',
          name: 'Demo User',
        },
      })

      // Verify JWT was called with correct payload structure
      expect(mockJwt).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 1,
          email: 'demo@test.com',
          data: expect.objectContaining({
            permissions: expect.arrayContaining([
              'api-ler-post',
              'api-criar-post',
              'api-atualizar-post',
              'api-deletar-post',
            ]),
          }),
          iat: expect.any(Number),
          exp: expect.any(Number),
        }),
        'demo-secret-key',
      )
    })

    it('should generate token with all required permissions', () => {
      // Arrange
      const mockToken = 'mocked-jwt-token'
      mockJwt.mockReturnValue(mockToken)

      // Act
      controller.autoLogin()

      // Assert - Verify all required permissions are included
      const calledPayload = mockJwt.mock.calls[0][0]
      const permissions = calledPayload.data.permissions

      const expectedPermissions = [
        'api-ler-post',
        'api-criar-post',
        'api-atualizar-post',
        'api-deletar-post',
        'api-ler-category',
        'api-criar-category',
        'api-atualizar-category',
        'api-deletar-category',
        'api-ler-user',
        'api-criar-user',
        'api-atualizar-user',
        'api-deletar-user',
        'api-ler-pokemon',
        'api-criar-pokemon',
        'api-atualizar-pokemon',
        'api-deletar-pokemon',
        'api-ler-profile',
        'api-criar-profile',
        'api-atualizar-profile',
        'api-deletar-profile',
        'api-ler-large-table',
        'api-criar-large-table',
        'api-atualizar-large-table',
        'api-deletar-large-table',
      ]

      expectedPermissions.forEach((permission) => {
        expect(permissions).toContain(permission)
      })
    })

    it('should generate token with 24 hour expiration', () => {
      // Arrange
      const mockToken = 'mocked-jwt-token'
      mockJwt.mockReturnValue(mockToken)
      const beforeTime = Math.floor(Date.now() / 1000)

      // Act
      controller.autoLogin()

      // Assert
      const calledPayload = mockJwt.mock.calls[0][0]
      const afterTime = Math.floor(Date.now() / 1000)

      // Check that iat is within a reasonable range
      expect(calledPayload.iat).toBeGreaterThanOrEqual(beforeTime)
      expect(calledPayload.iat).toBeLessThanOrEqual(afterTime)

      // Check that exp is exactly 24 hours from iat
      const expectedExp = calledPayload.iat + 24 * 60 * 60
      expect(calledPayload.exp).toBe(expectedExp)
    })

    it('should use correct JWT secret', () => {
      // Arrange
      const mockToken = 'mocked-jwt-token'
      mockJwt.mockReturnValue(mockToken)

      // Act
      controller.autoLogin()

      // Assert
      expect(mockJwt).toHaveBeenCalledWith(expect.any(Object), 'demo-secret-key')
    })
  })
})
