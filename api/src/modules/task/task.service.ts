import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    userId: string,
    organizationId: string,
  ): Promise<Task> {
    const task = this.taskRepo.create({
      ...createTaskDto,
      userId,
      organizationId,
      status: createTaskDto.status || 'pending',
    });

    return this.taskRepo.save(task);
  }

  async findAll(accessibleOrgIds: string[]): Promise<Task[]> {
    return this.taskRepo.find({
      where: {
        organizationId: In(accessibleOrgIds),
      },
      relations: ['user', 'organization'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string, accessibleOrgIds: string[]): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: {
        id,
        organizationId: In(accessibleOrgIds),
      },
      relations: ['user', 'organization'],
    });

    if (!task) {
      throw new NotFoundException('task not found or access denied');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    accessibleOrgIds: string[],
  ): Promise<Task> {
    const task = await this.findOne(id, accessibleOrgIds);

    Object.assign(task, updateTaskDto);
    task.updatedAt = new Date();

    return this.taskRepo.save(task);
  }

  async remove(id: string, accessibleOrgIds: string[]): Promise<void> {
    const task = await this.findOne(id, accessibleOrgIds);
    await this.taskRepo.remove(task);
  }

  async getTasksByCategory(category: string, accessibleOrgIds: string[]): Promise<Task[]> {
    return this.taskRepo.find({
      where: {
        category,
        organizationId: In(accessibleOrgIds),
      },
      relations: ['user', 'organization'],
    });
  }

  async getTasksByStatus(status: string, accessibleOrgIds: string[]): Promise<Task[]> {
    return this.taskRepo.find({
      where: {
        status,
        organizationId: In(accessibleOrgIds),
      },
      relations: ['user', 'organization'],
    });
  }
}