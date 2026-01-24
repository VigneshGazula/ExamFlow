import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExamSeriesRequest {
  name: string;
  examType: number;
  year: number;
  branches: string[];
  startDate: string;
  endDate: string;
}

export interface ExamSeriesResponse {
  id: string;
  name: string;
  examType: number;
  year: number;
  branches: string[];
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
}

export interface BranchStatusResponse {
  branch: string;
  isScheduled: boolean;
  scheduledExamsCount: number;
}

export interface AvailableDateResponse {
  date: string;
  dayOfWeek: string;
  isScheduled: boolean;
  scheduledSubject?: string;
}

export interface ScheduleBranchRequest {
  exams: ExamScheduleItem[];
  globalStartTime: string;
  globalEndTime: string;
}

export interface ExamScheduleItem {
  examDate: string;
  subject?: string;
  isHoliday: boolean;
}

export interface ExamResponse {
  id: string;
  examSeriesId: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  branch: string;
  year: number;
  isHoliday: boolean;
}

export interface ExamSeriesSummaryResponse {
  examSeriesId: string;
  name: string;
  exams: ExamResponse[];
  branchScheduledCounts: { [key: string]: number };
}

export interface StudentExamSeriesResponse {
  id: string;
  name: string;
  examType: number;
  year: number;
  branch: string;
  startDate: string;
  endDate: string;
  totalExams: number;
  upcomingExams: number;
  completedExams: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ExamService {
  private apiUrl = 'http://localhost:5275/api/examseries';

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

  createExamSeries(data: ExamSeriesRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data, { headers: this.getHeaders() });
  }

  getAllExamSeries(): Observable<ExamSeriesResponse[]> {
    return this.http.get<ExamSeriesResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getExamSeriesById(id: string): Observable<ExamSeriesResponse> {
    return this.http.get<ExamSeriesResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getUnscheduledBranches(examSeriesId: string): Observable<BranchStatusResponse[]> {
    return this.http.get<BranchStatusResponse[]>(
      `${this.apiUrl}/${examSeriesId}/branches`,
      { headers: this.getHeaders() }
    );
  }

  getAvailableDates(examSeriesId: string, branch: string): Observable<AvailableDateResponse[]> {
    return this.http.get<AvailableDateResponse[]>(
      `${this.apiUrl}/${examSeriesId}/branches/${branch}/dates`,
      { headers: this.getHeaders() }
    );
  }

  getBranchSubjects(branch: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/branches/${branch}/subjects`,
      { headers: this.getHeaders() }
    );
  }

  scheduleBranchExams(examSeriesId: string, branch: string, data: ScheduleBranchRequest): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${examSeriesId}/branches/${branch}/schedule`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getExamSeriesSummary(examSeriesId: string): Observable<ExamSeriesSummaryResponse> {
    return this.http.get<ExamSeriesSummaryResponse>(
      `${this.apiUrl}/${examSeriesId}/summary`,
      { headers: this.getHeaders() }
    );
  }

  getAllBranches(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/branches`,
      { headers: this.getHeaders() }
    );
  }

  // Student-specific methods
  getStudentExamSeries(branch: string, year: number): Observable<StudentExamSeriesResponse[]> {
    return this.http.get<StudentExamSeriesResponse[]>(
      `${this.apiUrl}/student/${branch}/${year}`,
      { headers: this.getHeaders() }
    );
  }

  getStudentExams(examSeriesId: string, branch: string): Observable<ExamResponse[]> {
    return this.http.get<ExamResponse[]>(
      `${this.apiUrl}/${examSeriesId}/student/${branch}/exams`,
      { headers: this.getHeaders() }
    );
  }
}
