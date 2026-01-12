import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { Task, CreateTaskDto } from '../../core/models/task.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  pendingTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  completedTasks: Task[] = [];
  
  currentUser: User | null = null;
  loading = false;
  error = '';
  darkMode = false;

  // filters
  filterCategory = 'all';
  searchTerm = '';

  // modal state
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedTask: Task | null = null;

  // form data
  taskForm: CreateTaskDto = {
    title: '',
    description: '',
    status: 'pending',
    category: 'Work',
  };

  // chart data
  showChart = false;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router
  ) {
    // load dark mode preference
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.applyDarkMode();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTasks();
  }

  // keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // ctrl/cmd + k = open create modal
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.openCreateModal();
    }
    // escape = close modal
    if (event.key === 'Escape' && this.showModal) {
      this.closeModal();
    }
    // ctrl/cmd + / = toggle chart
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault();
      this.showChart = !this.showChart;
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.organizeTasks();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'failed to load tasks';
        this.loading = false;
      }
    });
  }

  organizeTasks(): void {
    const filtered = this.tasks.filter(task => {
      const matchesCategory = this.filterCategory === 'all' || task.category === this.filterCategory;
      const matchesSearch = !this.searchTerm || 
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });

    this.pendingTasks = filtered.filter(t => t.status === 'pending');
    this.inProgressTasks = filtered.filter(t => t.status === 'in-progress');
    this.completedTasks = filtered.filter(t => t.status === 'completed');
  }

  onFilterChange(): void {
    this.organizeTasks();
  }

  // drag and drop handler
  drop(event: CdkDragDrop<Task[]>, newStatus: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // update task status in backend
      const task = event.container.data[event.currentIndex];
      this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (err) => {
          this.error = 'failed to update task';
          this.loadTasks(); // revert on error
        }
      });
    }
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.taskForm = {
      title: '',
      description: '',
      status: 'pending',
      category: 'Work',
    };
    this.showModal = true;
  }

  openEditModal(task: Task): void {
    this.modalMode = 'edit';
    this.selectedTask = task;
    this.taskForm = {
      title: task.title,
      description: task.description,
      status: task.status,
      category: task.category,
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTask = null;
    this.error = '';
  }

  saveTask(): void {
    if (!this.taskForm.title.trim()) {
      this.error = 'title is required';
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.modalMode === 'create') {
      this.taskService.createTask(this.taskForm).subscribe({
        next: () => {
          this.loadTasks();
          this.closeModal();
        },
        error: (err) => {
          this.error = 'failed to create task';
          this.loading = false;
        }
      });
    } else if (this.selectedTask) {
      this.taskService.updateTask(this.selectedTask.id, this.taskForm).subscribe({
        next: () => {
          this.loadTasks();
          this.closeModal();
        },
        error: (err) => {
          this.error = 'failed to update task';
          this.loading = false;
        }
      });
    }
  }

  deleteTask(task: Task): void {
    if (!confirm(`delete "${task.title}"?`)) return;

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (err) => {
        this.error = 'failed to delete task';
      }
    });
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyDarkMode();
  }

  applyDarkMode(): void {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // chart calculations
  get taskStats() {
    const total = this.tasks.length;
    const pending = this.pendingTasks.length;
    const inProgress = this.inProgressTasks.length;
    const completed = this.completedTasks.length;

    return {
      total,
      pending,
      inProgress,
      completed,
      pendingPercent: total > 0 ? (pending / total) * 100 : 0,
      inProgressPercent: total > 0 ? (inProgress / total) * 100 : 0,
      completedPercent: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Work': '💼',
      'Personal': '🏠',
    };
    return icons[category] || '📝';
  }
}