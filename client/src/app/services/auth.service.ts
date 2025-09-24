import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ChangePasswordRequest,
  UpdateProfileRequest
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response.data.token, response.data.user);
          }
        })
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response.data.token, response.data.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getProfile(): Observable<{ success: boolean; message: string; data: { user: User } }> {
    return this.http.get<{ success: boolean; message: string; data: { user: User } }>(`${this.API_URL}/auth/profile`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.updateUserData(response.data.user);
          }
        })
      );
  }

  updateProfile(userData: UpdateProfileRequest): Observable<{ success: boolean; message: string; data: { user: User } }> {
    return this.http.put<{ success: boolean; message: string; data: { user: User } }>(`${this.API_URL}/auth/profile`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.updateUserData(response.data.user);
          }
        })
      );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/auth/change-password`, passwordData);
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private updateUserData(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}