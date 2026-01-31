import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HallTicketService, ExamSeriesEligibility, HallTicketDownload } from '../../services/hall-ticket.service';

@Component({
  selector: 'app-hall-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hall-ticket.component.html',
  styleUrl: './hall-ticket.component.css'
})
export class HallTicketComponent implements OnInit {
  examSeriesList: ExamSeriesEligibility[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Download state
  isDownloading = false;
  downloadingExamId: string | null = null;
  hallTicketData: HallTicketDownload | null = null;
  showHallTicketModal = false;

  constructor(
    private hallTicketService: HallTicketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExamSeries();
  }

  loadExamSeries(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.hallTicketService.getStudentExamSeries().subscribe({
      next: (data) => {
        this.examSeriesList = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exam series:', error);
        this.isLoading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = 'Failed to load hall tickets. Please try again.';
        }
      }
    });
  }

  downloadHallTicket(examSeriesId: string): void {
    this.isDownloading = true;
    this.downloadingExamId = examSeriesId;

    this.hallTicketService.downloadHallTicket(examSeriesId).subscribe({
      next: (data) => {
        this.hallTicketData = data;
        this.showHallTicketModal = true;
        this.isDownloading = false;
        this.downloadingExamId = null;
      },
      error: (error) => {
        console.error('Error downloading hall ticket:', error);
        this.isDownloading = false;
        this.downloadingExamId = null;
        
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 404) {
          alert('Hall ticket not available. Either you are not eligible or it hasn\'t been released yet.');
        } else {
          alert('Failed to download hall ticket. Please try again.');
        }
      }
    });
  }

  closeHallTicketModal(): void {
    this.showHallTicketModal = false;
    this.hallTicketData = null;
  }

  printHallTicket(): void {
    window.print();
  }

  getStatusClass(series: ExamSeriesEligibility): string {
    if (!series.isEligible) {
      return 'not-eligible';
    } else if (series.studentHasHallTicket) {
      return 'released';
    } else {
      return 'pending';
    }
  }

  getStatusText(series: ExamSeriesEligibility): string {
    if (!series.isEligible) {
      return 'Not Released for Department';
    } else if (series.studentHasHallTicket) {
      return 'Hall Ticket Available';
    } else {
      return 'Released for Department - Pending for You';
    }
  }

  getStatusIcon(series: ExamSeriesEligibility): string {
    if (!series.isEligible) {
      return 'bi-x-circle';
    } else if (series.studentHasHallTicket) {
      return 'bi-check-circle-fill';
    } else {
      return 'bi-hourglass-split';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }
}
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
