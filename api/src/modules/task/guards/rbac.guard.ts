import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../role/role.service';
import { OrganizationsService } from '../../org/org.service';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
    private orgsService: OrganizationsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<{ resource: string; action: string }>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('user not authenticated');
    }

    const hasPermission = await this.rolesService.checkPermission(
      user.roleId,
      requiredPermission.resource,
      requiredPermission.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException('insufficient permissions');
    }

    const accessibleOrgIds = await this.orgsService.getAllOrgIdsInHierarchy(user.organizationId);
    request.accessibleOrgIds = accessibleOrgIds;

    return true;
  }
}