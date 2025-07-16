import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }

  async canActivate(context: ExecutionContext) {
    const role = this.reflector.get<string[]>('role', context.getHandler())
    const request = this.getRequest(context)

    const matchRole = role.includes(request.responsibleUserRole)

    if (!matchRole) {
      throw new UnauthorizedException('You do not have permission (RolesGuard)')
    }

    return matchRole
  }
}
