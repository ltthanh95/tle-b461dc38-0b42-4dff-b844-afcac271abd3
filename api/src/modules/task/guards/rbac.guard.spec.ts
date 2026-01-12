jest.mock('../../user/user.entity', () => ({
  User: class User {},
}));

jest.mock('../../role/role.entity', () => ({
  Role: class Role {},
}));

jest.mock('../../permission/permission.entity', () => ({
  Permission: class Permission {},
}));

jest.mock('../../org/org.entity', () => ({
  Organization: class Organization {},
}));

jest.mock('../task.entity', () => ({
  Task: class Task {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacGuard } from './rbac.guard.js';
import { RolesService } from '../../role/role.service.js';
import { OrganizationsService } from '../../org/org.service.js';

describe('RbacGuard', () => {
  let guard: RbacGuard;
  let reflector: Reflector;
  let rolesService: RolesService;
  let orgsService: OrganizationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            checkPermission: jest.fn(),
          },
        },
        {
          provide: OrganizationsService,
          useValue: {
            getAllOrgIdsInHierarchy: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RbacGuard>(RbacGuard);
    reflector = module.get<Reflector>(Reflector);
    rolesService = module.get<RolesService>(RolesService);
    orgsService = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no permission required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

    const context = createMockExecutionContext();
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access when user has required permission', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      resource: 'task',
      action: 'read',
    });
    jest.spyOn(rolesService, 'checkPermission').mockResolvedValue(true);
    jest.spyOn(orgsService, 'getAllOrgIdsInHierarchy').mockResolvedValue(['org1', 'org2']);

    const context = createMockExecutionContext();
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(rolesService.checkPermission).toHaveBeenCalledWith('role1', 'task', 'read');
  });

  it('should deny access when user lacks required permission', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      resource: 'task',
      action: 'delete',
    });
    jest.spyOn(rolesService, 'checkPermission').mockResolvedValue(false);

    const context = createMockExecutionContext();

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should deny access when user not authenticated', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      resource: 'task',
      action: 'read',
    });

    const context = createMockExecutionContext(null);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  function createMockExecutionContext(user = { userId: '1', roleId: 'role1', organizationId: 'org1' }): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  }
});