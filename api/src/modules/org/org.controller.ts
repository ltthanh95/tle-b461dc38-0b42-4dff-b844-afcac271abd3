import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationsService } from './org.service';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(@Body() createOrgDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrgDto);
  }

  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Get(':id/children')
  getChildren(@Param('id') id: string) {
    return this.organizationsService.getChildOrganizations(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrgDto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, updateOrgDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}