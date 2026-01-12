import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsService } from '../permission/permission.service';
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private permissionsService: PermissionsService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepo.findOne({
      where: { name: createRoleDto.name },
    });

    if (existing) {
      throw new ConflictException('role name already exists');
    }

    const role = this.roleRepo.create({ name: createRoleDto.name });
    const savedRole = await this.roleRepo.save(role);

    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      const permissionsToCreate = createRoleDto.permissions.map(p => ({
        resource: p.resource,
        action: p.action,
        roleId: savedRole.id,
      }));

      await this.permissionsService.createMany(permissionsToCreate);
    }

    return this.findOne(savedRole.id);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find({
      relations: ['permissions'],
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('role not found');
    }

    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepo.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existing = await this.roleRepo.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existing) {
        throw new ConflictException('role name already exists');
      }
    }

    Object.assign(role, updateRoleDto);
    return this.roleRepo.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.permissionsService.removeByRoleId(id);

    await this.roleRepo.remove(role);
  }

  async checkPermission(roleId: string, resource: string, action: string): Promise<boolean> {
    return this.permissionsService.hasPermission(roleId, resource, action);
  }
}