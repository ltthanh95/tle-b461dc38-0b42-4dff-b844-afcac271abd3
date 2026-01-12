import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Task } from '../../core/models/task.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let taskService: jest.Mocked<TaskService>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  const mockUser = {
    id: '1',
    email: 'test@test.com',
    name: 'Test User',
    role: { id: 'role1', name: 'Admin' },
    organization: { id: 'org1', name: 'Test Org' },
  };

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Desc 1',
      status: 'pending',
      category: 'Work',
      userId: '1',
      organizationId: 'org1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Desc 2',
      status: 'completed',
      category: 'Personal',
      userId: '1',
      organizationId: 'org1',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    },
  ];

  beforeEach(async () => {
    const taskServiceMock = {
      getTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    } as any;

    const authServiceMock = {
      getCurrentUser: jest.fn(),
      logout: jest.fn(),
    } as any;

    const routerMock = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    taskService = TestBed.inject(TaskService) as jest.Mocked<TaskService>;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    authService.getCurrentUser.mockReturnValue(mockUser as any);
    taskService.getTasks.mockReturnValue(of(mockTasks));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', () => {
    expect(taskService.getTasks).toHaveBeenCalled();
    expect(component.tasks.length).toBe(2);
  });

  it('should organize tasks by status', () => {
    expect(component.pendingTasks.length).toBe(1);
    expect(component.completedTasks.length).toBe(1);
  });

  it('should filter tasks by category', () => {
    component.filterCategory = 'Work';
    component.onFilterChange();

    expect(component.pendingTasks.length).toBe(1);
    expect(component.pendingTasks[0].category).toBe('Work');
  });

  it('should search tasks by title', () => {
    component.searchTerm = 'Task 1';
    component.onFilterChange();

    expect(component.pendingTasks.length).toBe(1);
    expect(component.pendingTasks[0].title).toBe('Task 1');
  });

  it('should create task', () => {
    const newTask = mockTasks[0];
    taskService.createTask.mockReturnValue(of(newTask));
    taskService.getTasks.mockReturnValue(of([...mockTasks, newTask]));

    component.taskForm = { title: 'New Task', description: 'Desc' };
    component.modalMode = 'create';
    component.saveTask();

    expect(taskService.createTask).toHaveBeenCalled();
  });

  it('should delete task after confirmation', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    taskService.deleteTask.mockReturnValue(of(undefined as any));
    taskService.getTasks.mockReturnValue(of([mockTasks[1]]));

    component.deleteTask(mockTasks[0]);

    expect(taskService.deleteTask).toHaveBeenCalledWith('1');
    confirmSpy.mockRestore();
  });

  it('should toggle dark mode', () => {
    component.darkMode = false;
    component.toggleDarkMode();

    expect(component.darkMode).toBe(true);
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('should logout and navigate to login', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should calculate task stats correctly', () => {
    const stats = component.taskStats;

    expect(stats.total).toBe(2);
    expect(stats.pending).toBe(1);
    expect(stats.completed).toBe(1);
    expect(stats.completedPercent).toBe(50);
  });
});