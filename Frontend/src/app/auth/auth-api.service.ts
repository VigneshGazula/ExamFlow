import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  userId: string;
  password: string;
  loginAs: string;
}

export interface SignupRequest {
  userId: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  role: string;
}

export interface ErrorResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private apiUrl = 'http://localhost:5275/api/Auth';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  signup(data: SignupRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  storeToken(token: string): void {
    localStorage.setItem('jwt', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  storeRole(role: string): void {
    localStorage.setItem('role', role);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  clearAuth(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
  }
}
