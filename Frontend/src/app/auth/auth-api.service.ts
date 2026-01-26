import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  userId: string;
  password: string;
  loginAs: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface SignupResponse {
  message: string;
  userId: string;
  role: string;
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

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  signup(data: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, data);
  }

  storeToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('jwt', token);
      // Extract and store user info from token
      this.extractAndStoreUserInfo(token);
    }
  }

  private extractAndStoreUserInfo(token: string): void {
    try {
      // Decode JWT token (format: header.payload.signature)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      // Store user info
      const userInfo = {
        fullName: decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
                  decodedPayload.name || 
                  decodedPayload.fullName || 
                  'User',
        email: decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
               decodedPayload.email || 
               '',
        userId: decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                decodedPayload.sub || 
                decodedPayload.userId || 
                ''
      };
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('jwt');
    }
    return null;
  }

  storeRole(role: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('role', role);
    }
  }

  getRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('role');
    }
    return null;
  }

  clearAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('role');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('hallTicketStatus');
    }
  }
}
