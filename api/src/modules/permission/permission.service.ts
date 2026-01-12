import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepo.create(createPermissionDto);
    return this.permissionRepo.save(permission);
  }

  async createMany(permissions: CreatePermissionDto[]): Promise<Permission[]> {
    const permissionEntities = this.permissionRepo.create(permissions);
    return this.permissionRepo.save(permissionEntities);
  }

  async findByRoleId(roleId: string): Promise<Permission[]> {
    return this.permissionRepo.find({
      where: { roleId },
    });
  }

  async hasPermission(roleId: string, resource: string, action: string): Promise<boolean> {
    const permission = await this.permissionRepo.findOne({
      where: { roleId, resource, action },
    });
    return !!permission;
  }

  async removeByRoleId(roleId: string): Promise<void> {
    await this.permissionRepo.delete({ roleId });
  }
}