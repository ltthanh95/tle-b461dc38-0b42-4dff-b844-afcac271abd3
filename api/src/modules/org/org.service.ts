import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './org.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
  ) {}

  async create(createOrgDto: CreateOrganizationDto): Promise<Organization> {
    if (createOrgDto.parentId) {
      const parent = await this.findOne(createOrgDto.parentId);
    
      if (parent.parentId) {
        throw new BadRequestException('maximum 2-level hierarchy allowed');
      }
    }

    const org = this.orgRepo.create(createOrgDto);
    return this.orgRepo.save(org);
  }

  async findAll(): Promise<Organization[]> {
    return this.orgRepo.find({
      relations: ['parent', 'children'],
    });
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({
      where: { id },
      relations: ['parent', 'children', 'users'],
    });

    if (!org) {
      throw new NotFoundException('organization not found');
    }

    return org;
  }

  async getChildOrganizations(parentId: string): Promise<Organization[]> {
    return this.orgRepo.find({
      where: { parentId },
    });
  }

  async getAllOrgIdsInHierarchy(orgId: string): Promise<string[]> {
    const org = await this.findOne(orgId);
    const orgIds = [orgId];
    if (org.children && org.children.length > 0) {
      const childIds = org.children.map(child => child.id);
      orgIds.push(...childIds);
    }

    return orgIds;
  }

  async update(id: string, updateOrgDto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.findOne(id);

    if (updateOrgDto.parentId) {
      const parent = await this.findOne(updateOrgDto.parentId);
      
      if (parent.parentId) {
        throw new BadRequestException('maximum 2-level hierarchy allowed');
      }
      if (updateOrgDto.parentId === id) {
        throw new BadRequestException('organization cannot be its own parent');
      }
    }

    Object.assign(org, updateOrgDto);
    return this.orgRepo.save(org);
  }

  async remove(id: string): Promise<void> {
    const org = await this.findOne(id);


    if (org.children && org.children.length > 0) {
      throw new BadRequestException('cannot delete organization with children');
    }


    if (org.users && org.users.length > 0) {
      throw new BadRequestException('cannot delete organization with users');
    }

    await this.orgRepo.remove(org);
  }
}