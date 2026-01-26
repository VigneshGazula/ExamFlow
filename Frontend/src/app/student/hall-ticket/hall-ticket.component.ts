import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExamService, StudentExamSeriesResponse } from '../../services/exam.service';
import { StudentProfileService } from '../../services/student-profile.service';

@Component({
  selector: 'app-hall-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hall-ticket.component.html',
  styleUrl: './hall-ticket.component.css'
})
export class HallTicketComponent implements OnInit {
  examSeriesList: StudentExamSeriesResponse[] = [];
  completedExamSeries: StudentExamSeriesResponse[] = [];
  isLoading = true;
  errorMessage = '';
  studentBranch = '';
  studentBranchCode = '';
  studentYear = 0;
  hallTicketStatus: { [key: string]: boolean } = {};

  // Map department names to branch codes
  private departmentToBranch: { [key: string]: string } = {
    'Computer Science': 'CSE',
    'Information Technology': 'IT',
    'Electronics and Communication': 'ECE',
    'Electrical Engineering': 'EEE',
    'Mechanical Engineering': 'MECH',
    'Civil Engineering': 'CIVIL',
    'Chemical Engineering': 'CHEM'
  };

  constructor(
    private examService: ExamService,
    private studentProfileService: StudentProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStudentProfile();
  }

  loadStudentProfile(): void {
    this.studentProfileService.getProfile().subscribe({
      next: (profile) => {
        this.studentBranch = profile.department;
        this.studentBranchCode = this.departmentToBranch[profile.department] || profile.department;
        this.studentYear = parseInt(profile.year);
        this.loadExamSeries();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 404) {
          this.errorMessage = 'Profile not found. Please complete your profile.';
          setTimeout(() => {
            this.router.navigate(['/student/complete-profile']);
          }, 2000);
        } else {
          this.errorMessage = error.error?.message || 'Failed to load your profile. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }

  loadExamSeries(): void {
    this.isLoading = true;
    this.loadHallTicketStatus();
    
    this.examService.getStudentExamSeries(this.studentBranchCode, this.studentYear).subscribe({
      next: (series) => {
        this.examSeriesList = series;
        this.filterCompletedExams();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exam series:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = error.error?.message || 'Failed to load exam series. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }

  filterCompletedExams(): void {
    const now = new Date();
    this.completedExamSeries = this.examSeriesList.filter(series => {
      const endDate = new Date(series.endDate);
      return endDate < now;
    });
  }

  loadHallTicketStatus(): void {
    const stored = localStorage.getItem('hallTicketStatus');
    if (stored) {
      this.hallTicketStatus = JSON.parse(stored);
    }
  }

  isHallTicketReleased(examSeriesId: string): boolean {
    return this.hallTicketStatus[examSeriesId] || false;
  }

  downloadHallTicket(series: StudentExamSeriesResponse): void {
    // Frontend only implementation - show download dialog
    // In real implementation, this would download a PDF from backend
    
    const hallTicketData = {
      examSeriesName: series.name,
      examType: this.getExamTypeLabel(series.examType),
      branch: this.studentBranchCode,
      year: series.year,
      startDate: this.formatDate(series.startDate),
      endDate: this.formatDate(series.endDate),
      downloadDate: new Date().toLocaleDateString()
    };

    console.log('Downloading Hall Ticket:', hallTicketData);
    
    // Show success message
    alert(`🎫 Hall Ticket Download\n\n` +
          `Exam Series: ${hallTicketData.examSeriesName}\n` +
          `Type: ${hallTicketData.examType}\n` +
          `Branch: ${hallTicketData.branch}\n` +
          `Year: ${hallTicketData.year}\n` +
          `Period: ${hallTicketData.startDate} to ${hallTicketData.endDate}\n\n` +
          `✅ Hall ticket will be downloaded shortly!\n` +
          `(Frontend simulation - connect to backend for actual PDF download)`);
  }

  getExamTypeLabel(examType: number): string {
    const types: { [key: number]: string } = {
      1: 'Semester',
      2: 'Midterm',
      3: 'Internal Lab',
      4: 'External Lab'
    };
    return types[examType] || 'Unknown';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getExamSeriesStatus(series: StudentExamSeriesResponse): 'upcoming' | 'ongoing' | 'completed' {
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

  getDepartmentEmoji(department: string): string {
    const emojiMap: { [key: string]: string } = {
      'Computer Science': '💻',
      'Information Technology': '🖥️',
      'Electronics and Communication': '📡',
      'Electrical Engineering': '⚡',
      'Mechanical Engineering': '⚙️',
      'Civil Engineering': '🏗️',
      'Chemical Engineering': '🧪'
    };
    return emojiMap[department] || '📚';
  }

  get releasedCount(): number {
    return this.completedExamSeries.filter(s => this.isHallTicketReleased(s.id)).length;
  }

  get pendingCount(): number {
    return this.completedExamSeries.filter(s => !this.isHallTicketReleased(s.id)).length;
  }
}
