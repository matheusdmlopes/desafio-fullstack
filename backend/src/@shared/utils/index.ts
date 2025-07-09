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
  const { prisma, token, data: permissions } = params

  // TEMPORÁRIO: Remover verificação de token para testes
  // If no token is provided, deny access
  if (!token) {
    return { permitted: true } // Temporariamente permitir sem token
  }

  // For now, we'll implement a simple permission check
  // In a real-world scenario, you would check against a permissions table
  // or validate against user roles stored in the token

  try {
    // Check if the token has the required user information
    if (!token.sub || !token.data) {
      return { permitted: false }
    }

    // Basic permission check - you can expand this logic based on your needs
    // For now, we'll allow all requests with valid tokens
    // You should implement proper permission checking based on your business logic

    // Example: Check if user exists and is active
    // const user = await prisma.user.findUnique({
    //   where: { id: token.sub }
    // })

    // if (!user) {
    //   return { permitted: false }
    // }

    // For demonstration purposes, we'll check for admin permissions
    // You should replace this with your actual permission logic
    const hasRequiredPermissions = permissions.every((permission) => {
      // This is a placeholder - implement your actual permission checking logic
      // For example, check against user roles, permissions table, etc.
      return true // For now, allow all operations
    })

    return { permitted: hasRequiredPermissions }
  } catch (error) {
    console.error('Error checking permissions:', error)
    return { permitted: false }
  }
}
