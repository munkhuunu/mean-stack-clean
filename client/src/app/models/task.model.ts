import { User } from './user.model';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  completedAt?: Date;
  userId: string | User;
  tags: string[];
  attachments?: TaskAttachment[];
  createdAt: Date;
  updatedAt: Date;
  isOverdue?: boolean;
  daysUntilDue?: number;
}

export interface TaskAttachment {
  filename: string;
  originalName: string;
  size: number;
  uploadDate: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date | string;
  tags?: string[];
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {}

export interface TasksResponse {
  success: boolean;
  message: string;
  data: {
    tasks: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data: {
    task: Task;
  };
}

export interface TaskStats {
  statusStats: { _id: string; count: number }[];
  priorityStats: { _id: string; count: number }[];
  overdue: number;
  total: number;
}

export interface TaskStatsResponse {
  success: boolean;
  message: string;
  data: TaskStats;
}

export interface TaskQueryParams {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
  sort?: string;
}