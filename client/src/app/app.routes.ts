import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/tasks/task-list/task-list.component').then(m => m.TaskListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks/create',
    loadComponent: () => import('./components/tasks/task-form/task-form.component').then(m => m.TaskFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks/:id/edit',
    loadComponent: () => import('./components/tasks/task-form/task-form.component').then(m => m.TaskFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];