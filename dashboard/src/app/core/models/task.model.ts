export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    category?: string;
    userId: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
    user?: {
      name: string;
      email: string;
    };
  }
  
  export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: string;
    category?: string;
  }
  
  export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: string;
    category?: string;
  }