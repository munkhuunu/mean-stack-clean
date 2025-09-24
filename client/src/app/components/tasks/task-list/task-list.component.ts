import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Tasks</h1>
        <button class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>New Task
        </button>
      </div>

      <div class="text-center py-5">
        <i class="fas fa-tasks fa-4x text-muted mb-3"></i>
        <h4>Task List Component</h4>
        <p class="text-muted">This component will display and manage tasks.</p>
      </div>
    </div>
  `
})
export class TaskListComponent {}