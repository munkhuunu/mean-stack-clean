import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h1 class="h3 mb-4">Create/Edit Task</h1>

      <div class="text-center py-5">
        <i class="fas fa-edit fa-4x text-muted mb-3"></i>
        <h4>Task Form Component</h4>
        <p class="text-muted">This component will handle task creation and editing.</p>
      </div>
    </div>
  `
})
export class TaskFormComponent {}