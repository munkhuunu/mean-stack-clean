import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <!-- Navigation -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary" *ngIf="authService.isAuthenticated()">
        <div class="container">
          <a class="navbar-brand" routerLink="/dashboard">
            <i class="fas fa-tasks me-2"></i>Task Manager
          </a>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                  <i class="fas fa-tachometer-alt me-1"></i>Dashboard
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/tasks" routerLinkActive="active">
                  <i class="fas fa-list me-1"></i>Tasks
                </a>
              </li>
            </ul>

            <ul class="navbar-nav">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i class="fas fa-user me-1"></i>{{ getCurrentUserName() }}
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/profile">
                    <i class="fas fa-user-edit me-2"></i>Profile
                  </a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="#" (click)="logout()">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                  </a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="footer bg-light mt-auto py-3" *ngIf="authService.isAuthenticated()">
        <div class="container">
          <div class="text-muted text-center">
            <small>&copy; 2024 MEAN Stack Task Manager. Built with Angular 17.</small>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      padding: 0;
    }

    .navbar-brand {
      font-weight: 700;
      font-size: 1.5rem;
    }

    .nav-link {
      font-weight: 500;
    }

    .footer {
      margin-top: auto;
    }

    @media (max-width: 768px) {
      .navbar-brand {
        font-size: 1.25rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'MEAN Stack Task Manager';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || 'User';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}