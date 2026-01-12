import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      category: 'Work',
      userId: 'user1',
      organizationId: 'org1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('should fetch tasks', (done) => {
      service.getTasks().subscribe((tasks) => {
        expect(tasks).toEqual(mockTasks);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/tasks');
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });
  });

  describe('createTask', () => {
    it('should create a task', (done) => {
      const newTask = { title: 'New Task', description: 'Description' };

      service.createTask(newTask).subscribe((task) => {
        expect(task).toEqual(mockTasks[0]);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/tasks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTask);
      req.flush(mockTasks[0]);
    });
  });

  describe('updateTask', () => {
    it('should update a task', (done) => {
      const update = { title: 'Updated Task' };
      const updated = { ...mockTasks[0], title: 'Updated Task' };

      service.updateTask('1', update).subscribe((task) => {
        expect(task.title).toBe('Updated Task');
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/tasks/1');
      expect(req.request.method).toBe('PUT');
      req.flush(updated);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', (done) => {
      service.deleteTask('1').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/tasks/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});