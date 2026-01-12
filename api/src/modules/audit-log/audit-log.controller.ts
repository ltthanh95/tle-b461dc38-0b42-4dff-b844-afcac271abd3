import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../task/guards/rbac.guard';
import { RequirePermissions } from '../task/decorators/permission.decorator';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermissions('audit-log', 'read')
  findAll(@Query('userId') userId?: string, @Query('resource') resource?: string, @Query('action') action?: string) {
    if (userId) {
      return this.auditLogService.findByUser(userId);
    }
    if (resource) {
      return this.auditLogService.findByResource(resource);
    }
    if (action) {
      return this.auditLogService.findByAction(action);
    }
    return this.auditLogService.findAll();
  }
}