import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-vh-100 d-flex align-items-center bg-light">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="card shadow">
              <div class="card-body p-5">
                <div class="text-center mb-4">
                  <i class="fas fa-user-plus text-primary" style="font-size: 3rem;"></i>
                  <h2 class="mt-3 mb-1">Create Account</h2>
                  <p class="text-muted">Join our task management platform</p>
                </div>

                <!-- Alert -->
                <div *ngIf="errorMessage" class="alert alert-danger fade-in" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <!-- Register Form -->
                <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label for="name" class="form-label">Full Name</label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-user"></i>
                      </span>
                      <input
                        type="text"
                        class="form-control"
                        id="name"
                        formControlName="name"
                        placeholder="Enter your full name"
                        [class.is-invalid]="name?.invalid && name?.touched">
                    </div>
                    <div *ngIf="name?.invalid && name?.touched" class="invalid-feedback">
                      <div *ngIf="name?.errors?.['required']">Name is required</div>
                      <div *ngIf="name?.errors?.['minlength']">Name must be at least 2 characters</div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        class="form-control"
                        id="email"
                        formControlName="email"
                        placeholder="Enter your email"
                        [class.is-invalid]="email?.invalid && email?.touched">
                    </div>
                    <div *ngIf="email?.invalid && email?.touched" class="invalid-feedback">
                      <div *ngIf="email?.errors?.['required']">Email is required</div>
                      <div *ngIf="email?.errors?.['email']">Please enter a valid email</div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label for="password" class="form-label">Password</label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-lock"></i>
                      </span>
                      <input
                        [type]="showPassword ? 'text' : 'password'"
                        class="form-control"
                        id="password"
                        formControlName="password"
                        placeholder="Create a password"
                        [class.is-invalid]="password?.invalid && password?.touched">
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        (click)="togglePassword()">
                        <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                    <div *ngIf="password?.invalid && password?.touched" class="invalid-feedback">
                      <div *ngIf="password?.errors?.['required']">Password is required</div>
                      <div *ngIf="password?.errors?.['minlength']">Password must be at least 6 characters</div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="btn btn-primary w-100 mb-3"
                    [disabled]="registerForm.invalid || isLoading">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!isLoading" class="fas fa-user-plus me-2"></i>
                    {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                  </button>
                </form>

                <div class="text-center">
                  <p class="mb-0">
                    Already have an account?
                    <a routerLink="/login" class="text-decoration-none">Sign in here</a>
                  </p>
                </div>
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
      border-radius: 1rem;
    }

    .input-group-text {
      background-color: transparent;
      border-right: none;
    }

    .form-control {
      border-left: none;
    }

    .form-control:focus {
      border-left: none;
      box-shadow: none;
    }

    .input-group:focus-within .input-group-text {
      border-color: #86b7fe;
    }

    .btn {
      border-radius: 0.5rem;
      font-weight: 500;
    }

    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}