jest.mock('./task.entity', () => ({
  Task: class Task {},
}));
import { Task } from './task.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './task.service.js';


describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<any>;

  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    category: 'Work',
    userId: 'user1',
    organizationId: 'org1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      jest.spyOn(repository, 'create').mockReturnValue(mockTask as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockTask as any);

      const result = await service.create(
        { title: 'Test Task', description: 'Test Description' },
        'user1',
        'org1'
      );

      expect(result).toEqual(mockTask);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return tasks for accessible organizations', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockTask] as any);

      const result = await service.findAll(['org1', 'org2']);

      expect(result).toEqual([mockTask]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a task if found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTask as any);

      const result = await service.findOne('1', ['org1']);

      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('999', ['org1'])).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updated = { ...mockTask, title: 'Updated Title' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTask as any);
      jest.spyOn(repository, 'save').mockResolvedValue(updated as any);

      const result = await service.update('1', { title: 'Updated Title' }, ['org1']);

      expect(result.title).toBe('Updated Title');
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTask as any);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockTask as any);

      await service.remove('1', ['org1']);

      expect(repository.remove).toHaveBeenCalledWith(mockTask);
    });
  });
});