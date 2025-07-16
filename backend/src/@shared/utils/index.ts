import { PrismaService } from 'src/infra/database/prisma.service'

interface CheckPermissionParams {
  prisma: PrismaService
  token: any
  data: string[]
}

interface CheckPermissionResult {
  permitted: boolean
}

export async function checkPermission(params: CheckPermissionParams): Promise<CheckPermissionResult> {
  const { prisma, token, data: requiredPermissions } = params

  // If no token is provided, deny access
  if (!token) {
    return { permitted: false }
  }

  try {
    // Extract user permissions from token
    // The token can have permissions in different structures based on how it comes from JWT strategy
    let userPermissions: string[] = []

    if (token.permissions && Array.isArray(token.permissions)) {
      // Direct from JWT strategy
      userPermissions = token.permissions
    } else if (token.data && token.data.permissions && Array.isArray(token.data.permissions)) {
      // From token payload
      userPermissions = token.data.permissions
    } else if (token.tokenData && token.tokenData.permissions && Array.isArray(token.tokenData.permissions)) {
      // Nested structure
      userPermissions = token.tokenData.permissions
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) => userPermissions.includes(permission))

    return { permitted: hasAllPermissions }
  } catch (error) {
    console.error('Error checking permissions:', error)
    return { permitted: false }
  }
}
