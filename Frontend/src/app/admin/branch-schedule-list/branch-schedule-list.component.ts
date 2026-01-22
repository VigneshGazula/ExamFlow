import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamService, BranchStatusResponse, ExamSeriesResponse } from '../../services/exam.service';

@Component({
  selector: 'app-branch-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './branch-schedule-list.component.html',
  styleUrl: './branch-schedule-list.component.css'
})
export class BranchScheduleListComponent implements OnInit {
  examSeriesId!: string;
  examSeries: ExamSeriesResponse | null = null;
  branches: BranchStatusResponse[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.examSeriesId = this.route.snapshot.paramMap.get('id') || '';
    if (this.examSeriesId) {
      this.loadExamSeries();
      this.loadBranches();
    }
  }

  loadExamSeries(): void {
    this.examService.getExamSeriesById(this.examSeriesId).subscribe({
      next: (response) => {
        this.examSeries = response;
      },
      error: (error) => {
        console.error('Error loading exam series:', error);
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = 'Failed to load exam series details';
        }
      }
    });
  }

  loadBranches(): void {
    this.isLoading = true;
    this.examService.getUnscheduledBranches(this.examSeriesId).subscribe({
      next: (response) => {
        this.branches = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = error.error?.message || 'Failed to load branch statuses';
        }
        this.isLoading = false;
      }
    });
  }

  scheduleExams(branch: string): void {
    this.router.navigate(['/admin/manage-exams/series', this.examSeriesId, 'branches', branch, 'scheduler']);
  }

  viewSummary(): void {
    this.router.navigate(['/admin/exam-series', this.examSeriesId, 'summary']);
  }

  get allBranchesScheduled(): boolean {
    return this.branches.length > 0 && this.branches.every(b => b.isScheduled);
  }
}
