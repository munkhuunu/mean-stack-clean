import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Task,
  TasksResponse,
  TaskResponse,
  TaskStatsResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskQueryParams
} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTasks(params?: TaskQueryParams): Observable<TasksResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof TaskQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<TasksResponse>(`${this.API_URL}/tasks`, { params: httpParams });
  }

  getTask(id: string): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.API_URL}/tasks/${id}`);
  }

  createTask(taskData: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.API_URL}/tasks`, taskData);
  }

  updateTask(id: string, taskData: UpdateTaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.API_URL}/tasks/${id}`, taskData);
  }

  deleteTask(id: string): Observable<TaskResponse> {
    return this.http.delete<TaskResponse>(`${this.API_URL}/tasks/${id}`);
  }

  completeTask(id: string): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.API_URL}/tasks/${id}/complete`, {});
  }

  getTaskStats(): Observable<TaskStatsResponse> {
    return this.http.get<TaskStatsResponse>(`${this.API_URL}/tasks/stats`);
  }

  // Helper methods for task filtering and sorting
  getTasksByStatus(status: string, page: number = 1, limit: number = 10): Observable<TasksResponse> {
    return this.getTasks({ status, page, limit });
  }

  getTasksByPriority(priority: string, page: number = 1, limit: number = 10): Observable<TasksResponse> {
    return this.getTasks({ priority, page, limit });
  }

  searchTasks(query: string, page: number = 1, limit: number = 10): Observable<TasksResponse> {
    // This would require backend implementation for search
    return this.getTasks({ page, limit });
  }

  // Utility methods
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  isTaskOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'completed') {
      return false;
    }
    return new Date(task.dueDate) < new Date();
  }

  getDaysUntilDue(task: Task): number | null {
    if (!task.dueDate) return null;

    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}