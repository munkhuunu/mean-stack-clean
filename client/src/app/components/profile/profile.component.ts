import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h1 class="h3 mb-4">Profile</h1>

      <div class="text-center py-5">
        <i class="fas fa-user fa-4x text-muted mb-3"></i>
        <h4>Profile Component</h4>
        <p class="text-muted">This component will handle user profile management.</p>
      </div>
    </div>
  `
})
export class ProfileComponent {}