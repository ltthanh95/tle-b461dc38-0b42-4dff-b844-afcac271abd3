import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { RolesModule } from '../role/role.module';
import { OrganizationsModule } from '../org/org.module';
import { TasksController } from './task.controller';
import { TasksService } from './task.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    RolesModule,
    OrganizationsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}