import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { PermissionsModule } from '../permission/permission.module';
import { RolesController } from './role.controller';
import { RolesService } from './role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    PermissionsModule,
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}