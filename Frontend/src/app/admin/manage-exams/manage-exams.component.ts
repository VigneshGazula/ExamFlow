import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExamService, ExamSeriesResponse } from '../../services/exam.service';

@Component({
  selector: 'app-manage-exams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-exams.component.html',
  styleUrl: './manage-exams.component.css'
})
export class ManageExamsComponent implements OnInit {
  examSeriesList: ExamSeriesResponse[] = [];
  upcomingExams: ExamSeriesResponse[] = [];
  ongoingExams: ExamSeriesResponse[] = [];
  completedExams: ExamSeriesResponse[] = [];
  isLoading = true;
  errorMessage = '';
  activeTab: 'all' | 'upcoming' | 'ongoing' | 'completed' = 'all';
  hallTicketStatus: { [key: string]: boolean } = {};

  examTypeLabels: { [key: number]: string } = {
    1: 'Semester',
    2: 'Midterm',
    3: 'Internal Lab',
    4: 'External Lab'
  };

  constructor(
    private examService: ExamService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExamSeries();
  }

  loadExamSeries(): void {
    this.isLoading = true;
    this.examService.getAllExamSeries().subscribe({
      next: (response) => {
        this.examSeriesList = response;
        this.categorizeExams();
        this.loadHallTicketStatus();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exam series:', error);
        
        // Handle 401 Unauthorized
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = error.error?.message || 'Failed to load exam series';
        }
        
        this.isLoading = false;
      }
    });
  }

  createNewSeries(): void {
    this.router.navigate(['/admin/manage-exams/create-series']);
  }

  scheduleExams(examSeriesId: string): void {
    this.router.navigate(['/admin/manage-exams/series', examSeriesId, 'schedule']);
  }

  getExamTypeLabel(examType: number): string {
    return this.examTypeLabels[examType] || 'Unknown';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  get semesterExamsCount(): number {
    return this.examSeriesList.filter(s => s.examType === 1).length;
  }

  get midtermExamsCount(): number {
    return this.examSeriesList.filter(s => s.examType === 2).length;
  }

  get labExamsCount(): number {
    return this.examSeriesList.filter(s => s.examType === 3 || s.examType === 4).length;
  }

  categorizeExams(): void {
    const now = new Date();
    
    this.upcomingExams = this.examSeriesList.filter(series => {
      const startDate = new Date(series.startDate);
      return startDate > now;
    });

    this.ongoingExams = this.examSeriesList.filter(series => {
      const startDate = new Date(series.startDate);
      const endDate = new Date(series.endDate);
      return startDate <= now && endDate >= now;
    });

    this.completedExams = this.examSeriesList.filter(series => {
      const endDate = new Date(series.endDate);
      return endDate < now;
    });
  }

  getExamStatus(series: ExamSeriesResponse): 'upcoming' | 'ongoing' | 'completed' {
    const now = new Date();
    const startDate = new Date(series.startDate);
    const endDate = new Date(series.endDate);

    if (startDate > now) {
      return 'upcoming';
    } else if (startDate <= now && endDate >= now) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  }

  isCompleted(series: ExamSeriesResponse): boolean {
    return this.getExamStatus(series) === 'completed';
  }

  setActiveTab(tab: 'all' | 'upcoming' | 'ongoing' | 'completed'): void {
    this.activeTab = tab;
  }

  getFilteredExams(): ExamSeriesResponse[] {
    switch (this.activeTab) {
      case 'upcoming':
        return this.upcomingExams;
      case 'ongoing':
        return this.ongoingExams;
      case 'completed':
        return this.completedExams;
      default:
        return this.examSeriesList;
    }
  }

  loadHallTicketStatus(): void {
    // In a real implementation, this would load from localStorage or API
    const stored = localStorage.getItem('hallTicketStatus');
    if (stored) {
      this.hallTicketStatus = JSON.parse(stored);
    }
  }

  toggleHallTicket(examSeriesId: string): void {
    this.hallTicketStatus[examSeriesId] = !this.hallTicketStatus[examSeriesId];
    localStorage.setItem('hallTicketStatus', JSON.stringify(this.hallTicketStatus));
  }

  isHallTicketReleased(examSeriesId: string): boolean {
    return this.hallTicketStatus[examSeriesId] || false;
  }
}
