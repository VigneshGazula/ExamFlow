import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ExamService, ExamSeriesResponse } from '../../services/exam.service';

@Component({
  selector: 'app-manage-exams',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-exams.component.html',
  styleUrl: './manage-exams.component.css'
})
export class ManageExamsComponent implements OnInit {
  examSeriesList: ExamSeriesResponse[] = [];
  isLoading = true;
  errorMessage = '';

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
}
