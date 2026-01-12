jest.mock('../role/role.entity', () => ({ Role: class Role {} }));
jest.mock('../permission/permission.entity', () => ({ Permission: class Permission {} }));
jest.mock('../org/org.entity', () => ({ Organization: class Organization {} }));
jest.mock('./task.entity', () => ({ Task: class Task {} }));
jest.mock('../user/user.entity', () => ({ User: class User {} }));
jest.mock('./guards/rbac.guard', () => ({
  RbacGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './task.controller.js';
import { TasksService } from './task.service.js';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasks = [
    {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      category: 'Work',
      userId: 'user1',
      organizationId: 'org1',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getTasksByCategory: jest.fn(),
            getTasksByStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createDto = {
        title: 'New Task',
        description: 'Description',
        status: 'pending',
        category: 'Work',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockTasks[0] as any);

      const result = await controller.create(createDto, {
        user: { userId: 'user1', organizationId: 'org1' },
      } as any);

      expect(result).toEqual(mockTasks[0]);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user1', 'org1');
    });
  });

  describe('findAll', () => {
    it('should return all accessible tasks', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(mockTasks as any);

      const result = await controller.findAll({
        accessibleOrgIds: ['org1', 'org2'],
      } as any);

      expect(result).toEqual(mockTasks);
      expect(service.findAll).toHaveBeenCalledWith(['org1', 'org2']);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto = { title: 'Updated Task' };
      const updated = { ...mockTasks[0], title: 'Updated Task' };

      jest.spyOn(service, 'update').mockResolvedValue(updated as any);

      const result = await controller.update('1', updateDto, {
        accessibleOrgIds: ['org1'],
      } as any);

      expect(result.title).toBe('Updated Task');
      expect(service.update).toHaveBeenCalledWith('1', updateDto, ['org1']);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove('1', {
        accessibleOrgIds: ['org1'],
      } as any);

      expect(service.remove).toHaveBeenCalledWith('1', ['org1']);
    });
  });
});