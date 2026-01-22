import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentProfileRequest {
  rollNumber: string;
  department: string;
  year: string;
  section: string;
}

export interface StudentProfileResponse {
  id: number;
  studentId: number;
  rollNumber: string;
  department: string;
  year: string;
  section: string;
  createdAt: string;
}

export interface ProfileStatusResponse {
  hasProfile: boolean;
  profile?: StudentProfileResponse;
}

@Injectable({ providedIn: 'root' })
export class StudentProfileService {
  private apiUrl = 'http://localhost:5275/api/StudentProfile';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    let token = '';
    
    // Only access localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('jwt') || '';
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  checkProfileStatus(): Observable<ProfileStatusResponse> {
    return this.http.get<ProfileStatusResponse>(`${this.apiUrl}/status`, {
      headers: this.getHeaders()
    });
  }

  getProfile(): Observable<StudentProfileResponse> {
    return this.http.get<StudentProfileResponse>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  createProfile(data: StudentProfileRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data, {
      headers: this.getHeaders()
    });
  }
}
