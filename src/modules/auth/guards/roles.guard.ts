import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    let roles: (string | number)[] = [];

    try {
      const rawRoles = user?.roles;
      roles = Array.isArray(rawRoles)
        ? rawRoles
        : typeof rawRoles === 'string'
          ? [rawRoles]
          : rawRoles != null
            ? [String(rawRoles)]
            : [];
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }

    const requiredList = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];
    const normalizedUserRoles = roles.map((r) => String(r));
    const hasAnyRole = requiredList.some((r: any) =>
      normalizedUserRoles.includes(String(r)),
    );

    if (user && !hasAnyRole) {
      throw new ForbiddenException();
    }

    return true;
  }
}
