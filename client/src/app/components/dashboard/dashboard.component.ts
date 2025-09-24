import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h3 mb-0">Dashboard</h1>
              <p class="text-muted mb-0">Welcome back, {{ currentUser?.name }}!</p>
            </div>
            <div class="text-end">
              <small class="text-muted">
                Last login: {{ formatDate(currentUser?.lastLogin) }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title mb-0">Total Tasks</h6>
                  <h3 class="mb-0">0</h3>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-tasks fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title mb-0">Completed</h6>
                  <h3 class="mb-0">0</h3>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-check-circle fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title mb-0">In Progress</h6>
                  <h3 class="mb-0">0</h3>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-spinner fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card bg-danger text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title mb-0">Overdue</h6>
                  <h3 class="mb-0">0</h3>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-exclamation-triangle fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="d-grid">
                    <button class="btn btn-primary btn-lg" type="button">
                      <i class="fas fa-plus me-2"></i>Create New Task
                    </button>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="d-grid">
                    <button class="btn btn-outline-primary btn-lg" type="button">
                      <i class="fas fa-list me-2"></i>View All Tasks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Recent Activity</h5>
            </div>
            <div class="card-body">
              <div class="text-center py-4">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p class="text-muted mb-0">No recent activity</p>
                <p class="text-muted">Start by creating your first task!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      transition: box-shadow 0.15s ease-in-out;
    }

    .card:hover {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .opacity-75 {
      opacity: 0.75;
    }

    .btn-lg {
      padding: 0.75rem 1.5rem;
      font-size: 1.1rem;
    }

    .text-muted {
      color: #6c757d !important;
    }

    .bg-primary .opacity-75 {
      opacity: 0.75;
    }

    .bg-success .opacity-75 {
      opacity: 0.75;
    }

    .bg-warning .opacity-75 {
      opacity: 0.75;
    }

    .bg-danger .opacity-75 {
      opacity: 0.75;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}