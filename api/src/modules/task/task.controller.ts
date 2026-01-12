import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    Query,
    UseGuards, 
    Request 
  } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from './guards/rbac.guard';
import { TasksService } from './task.service';
import { RequirePermissions } from './decorators/permission.decorator';
  
@Controller('tasks')
@UseGuards(JwtAuthGuard, RbacGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RequirePermissions('task', 'create')
  create(@Body() createTaskDto: CreateTaskDto, @Request() req:any) {
    return this.tasksService.create(
      createTaskDto,
      req.user.userId,
      req.user.organizationId,
    );
  }
  
  @Get()
  @RequirePermissions('task', 'read')
  findAll(@Request() req:any) {
    return this.tasksService.findAll(req.accessibleOrgIds);
  }

  @Get('by-category')
  @RequirePermissions('task', 'read')
  getByCategory(@Query('category') category: string, @Request() req:any) {
    return this.tasksService.getTasksByCategory(category, req.accessibleOrgIds);
  }
  
  @Get('by-status')
  @RequirePermissions('task', 'read')
  getByStatus(@Query('status') status: string, @Request() req:any) {
    return this.tasksService.getTasksByStatus(status, req.accessibleOrgIds);
  }
  
  @Get(':id')
  @RequirePermissions('task', 'read')
  findOne(@Param('id') id: string, @Request() req:any) {
    return this.tasksService.findOne(id, req.accessibleOrgIds);
  }
  
  @Put(':id')
  @RequirePermissions('task', 'update')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req:any,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.accessibleOrgIds);
  }
  
  @Delete(':id')
  @RequirePermissions('task', 'delete')
  remove(@Param('id') id: string, @Request() req:any) {
    return this.tasksService.remove(id, req.accessibleOrgIds);
  }
}