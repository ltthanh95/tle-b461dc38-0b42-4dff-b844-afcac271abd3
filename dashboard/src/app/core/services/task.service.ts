import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'http://localhost:3000/api/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.API_URL);
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/${id}`);
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.API_URL, task);
  }

  updateTask(id: string, task: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/${id}`, task);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getTasksByCategory(category: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/by-category?category=${category}`);
  }

  getTasksByStatus(status: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/by-status?status=${status}`);
  }
}