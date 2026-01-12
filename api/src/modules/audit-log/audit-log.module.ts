import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { RolesModule } from '../role/role.module';
import { OrganizationsModule } from '../org/org.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    RolesModule,
    OrganizationsModule,
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}