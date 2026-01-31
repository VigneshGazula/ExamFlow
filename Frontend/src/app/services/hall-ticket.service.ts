import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentForHallTicket {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  rollNumber: string;
  department: string;
  year: string;
  section: string;
  hallTicketReleased: boolean;
}

export interface ReleaseHallTicketRequest {
  examSeriesId: string;
  branches: string[];
  sections: string[];
  studentIds: number[];
  selectAll: boolean;
}

export interface ReleaseHallTicketResponse {
  success: boolean;
  message: string;
  totalStudents: number;
  newlyReleased: number;
  alreadyReleased: number;
  releasedStudentIds: string[];
}

export interface ExamSeriesEligibility {
  id: string;
  name: string;
  examType: number;
  examTypeName: string;
  startDate: string;
  endDate: string;
  year: number;
  status: string;
  isEligible: boolean;
  studentHasHallTicket: boolean;
}

export interface HallTicketDownload {
  hallTicketNumber: string;
  studentName: string;
  rollNumber: string;
  department: string;
  examSeriesName: string;
  issuedAt: string;
  examSchedule: ExamSchedule[];
}

export interface ExamSchedule {
  subjectName: string;
  subjectCode: string;
  examDate: string;
  examTime: string;
}

@Injectable({ providedIn: 'root' })
export class HallTicketService {
  private apiUrl = 'http://localhost:5275/api/hallticket';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    let token = '';
    
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('jwt') || '';
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get students with filters (Admin)
  getStudentsForHallTicket(
    examSeriesId?: string,
    branches?: string[],
    sections?: string[],
    year?: string
  ): Observable<StudentForHallTicket[]> {
    let params = new HttpParams();
    
    if (examSeriesId) {
      params = params.set('examSeriesId', examSeriesId);
    }
    if (branches && branches.length > 0) {
      branches.forEach(b => {
        params = params.append('branches', b);
      });
    }
    if (sections && sections.length > 0) {
      sections.forEach(s => {
        params = params.append('sections', s);
      });
    }
    if (year) {
      params = params.set('year', year);
    }

    return this.http.get<StudentForHallTicket[]>(`${this.apiUrl}/students`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  // Release hall tickets (Admin)
  releaseHallTickets(request: ReleaseHallTicketRequest): Observable<ReleaseHallTicketResponse> {
    return this.http.post<ReleaseHallTicketResponse>(
      `${this.apiUrl}/release`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Get exam series with eligibility status (Student)
  getStudentExamSeries(): Observable<ExamSeriesEligibility[]> {
    return this.http.get<ExamSeriesEligibility[]>(`${this.apiUrl}/student`, {
      headers: this.getHeaders()
    });
  }

  // Download hall ticket data (Student)
  downloadHallTicket(examSeriesId: string): Observable<HallTicketDownload> {
    return this.http.get<HallTicketDownload>(
      `${this.apiUrl}/${examSeriesId}/download`,
      { headers: this.getHeaders() }
    );
  }

  // Get available branches (Admin)
  getAvailableBranches(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/branches`, {
      headers: this.getHeaders()
    });
  }

  // Get available sections (Admin)
  getAvailableSections(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/sections`, {
      headers: this.getHeaders()
    });
  }
}

