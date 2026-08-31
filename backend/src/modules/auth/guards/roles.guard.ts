import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    const adminRoles = ['admin', 'ADMIN', 'main_admin', 'sub_admin'];
    const userRoleStr = String(user.role || '');

    const hasRole = requiredRoles.some((reqRole) => {
      const reqRoleStr = String(reqRole);
      if (adminRoles.includes(reqRoleStr)) {
        return adminRoles.includes(userRoleStr);
      }
      return userRoleStr === reqRoleStr;
    });

    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    return true;
  }
}
