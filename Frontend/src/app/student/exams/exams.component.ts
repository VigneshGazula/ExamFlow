import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExamService, StudentExamSeriesResponse, ExamResponse } from '../../services/exam.service';
import { StudentProfileService } from '../../services/student-profile.service';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.css'
})
export class ExamsComponent implements OnInit {
  examSeriesList: StudentExamSeriesResponse[] = [];
  selectedExamSeries: StudentExamSeriesResponse | null = null;
  exams: ExamResponse[] = [];
  isLoading = true;
  isLoadingExams = false;
  errorMessage = '';
  studentBranch = '';
  studentBranchCode = '';
  studentYear = 0;

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
        // Convert department name to branch code
        this.studentBranchCode = this.departmentToBranch[profile.department] || profile.department;
        // Get student's year
        this.studentYear = parseInt(profile.year);
        this.loadExamSeries();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        
        // Check if it's an authentication error
        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 403) {
          // Forbidden - wrong role (logged in as Admin instead of Student)
          this.errorMessage = 'Access denied. Redirecting to dashboard...';
          console.error('403 Forbidden - Token might not have Student role. Please re-login as Student.');
          setTimeout(() => {
            // Redirect to student dashboard instead of login
            this.router.navigate(['/student/dashboard']);
          }, 2000);
        } else if (error.status === 404) {
          // Profile not found - redirect to profile completion
          this.errorMessage = 'Profile not found. Redirecting to profile setup...';
          setTimeout(() => {
            this.router.navigate(['/student/complete-profile']);
          }, 1500);
        } else {
          this.errorMessage = error.error?.message || 'Failed to load your profile. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }

  loadExamSeries(): void {
    this.isLoading = true;
    this.examService.getStudentExamSeries(this.studentBranchCode, this.studentYear).subscribe({
      next: (series) => {
        this.examSeriesList = series;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exam series:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 403) {
          // Forbidden - wrong role - redirect to dashboard
          this.errorMessage = 'Access denied. Redirecting to dashboard...';
          console.error('403 Forbidden - Please ensure you are logged in as a Student.');
          setTimeout(() => {
            this.router.navigate(['/student/dashboard']);
          }, 2000);
        } else {
          this.errorMessage = error.error?.message || 'Failed to load exam series. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }

  viewExamDetails(series: StudentExamSeriesResponse): void {
    this.selectedExamSeries = series;
    this.isLoadingExams = true;
    
    this.examService.getStudentExams(series.id, this.studentBranchCode).subscribe({
      next: (exams) => {
        this.exams = exams;
        this.isLoadingExams = false;
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 403) {
          // Forbidden - wrong role - redirect to dashboard
          this.errorMessage = 'Access denied. Redirecting to dashboard...';
          setTimeout(() => {
            this.router.navigate(['/student/dashboard']);
          }, 2000);
        } else {
          this.errorMessage = error.error?.message || 'Failed to load exam details. Please try again.';
        }
        
        this.isLoadingExams = false;
      }
    });
  }

  backToList(): void {
    this.selectedExamSeries = null;
    this.exams = [];
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

  formatTime(timeStr: string): string {
    // timeStr format: "HH:MM:SS"
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getExamStatus(examDate: string, startTime: string, endTime: string): string {
    const now = new Date();
    const examDateObj = new Date(examDate);
    
    const [startHour, startMinute] = startTime.split(':');
    const examStartDateTime = new Date(examDate);
    examStartDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    const [endHour, endMinute] = endTime.split(':');
    const examEndDateTime = new Date(examDate);
    examEndDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    if (now < examStartDateTime) {
      return 'Upcoming';
    } else if (now >= examStartDateTime && now <= examEndDateTime) {
      return 'Ongoing';
    } else {
      return 'Completed';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Upcoming':
        return 'status-upcoming';
      case 'Ongoing':
        return 'status-ongoing';
      case 'Completed':
        return 'status-completed';
      default:
        return '';
    }
  }

  getDaysUntilExam(examDate: string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getWeekday(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
}
