import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/user.entity';
import { Organization } from './modules/org/org.entity';
import { Role } from './modules/role/role.entity';
import { Task } from './modules/task/task.entity';
import { Permission } from './modules/permission/permission.entity';
import { UsersModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/org/org.module';
import { RolesModule } from './modules/role/role.module';
import { PermissionsModule } from './modules/permission/permission.module';
import { TasksModule } from './modules/task/task.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './modules/audit-log/interceptors/audit.interceptors';
import { AuditLog } from './modules/audit-log/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Organization, Role, Task, Permission, AuditLog],
      synchronize: true,
      logging: true,
    }),
    UsersModule,
    AuthModule,
    OrganizationsModule,
    RolesModule,
    PermissionsModule,
    TasksModule,
    AuditLogModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}