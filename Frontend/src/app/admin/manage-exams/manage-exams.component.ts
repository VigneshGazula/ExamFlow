import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExamService, ExamSeriesResponse } from '../../services/exam.service';
import { HallTicketService, StudentForHallTicket } from '../../services/hall-ticket.service';

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
  
  // Modal related properties
  showReleaseModal = false;
  selectedExamSeriesForRelease: ExamSeriesResponse | null = null;
  
  // Form data
  availableBranches: string[] = [];
  availableSections: string[] = [];
  studentsList: StudentForHallTicket[] = [];
  isLoadingStudents = false;
  
  // Release animation
  isReleasingHallTickets = false;
  showSuccessAnimation = false;
  
  // Selection state
  selectedBranches: Set<string> = new Set();
  selectedSections: Set<string> = new Set();
  selectedStudents: Set<number> = new Set();
  
  // Select all states
  selectAllBranches = false;
  selectAllSections = false;
  selectAllStudents = false;

  examTypeLabels: { [key: number]: string } = {
    1: 'Semester',
    2: 'Midterm',
    3: 'Internal Lab',
    4: 'External Lab'
  };

  constructor(
    private examService: ExamService,
    private hallTicketService: HallTicketService,
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

  openReleaseModal(series: ExamSeriesResponse): void {
    this.selectedExamSeriesForRelease = series;
    this.showReleaseModal = true;
    
    // Reset selections
    this.selectedBranches.clear();
    this.selectedSections.clear();
    this.selectedStudents.clear();
    this.selectAllBranches = false;
    this.selectAllSections = false;
    this.selectAllStudents = false;
    this.studentsList = [];
    
    // Load available branches from exam series
    this.availableBranches = series.branches;
    
    // Load available sections from database
    this.loadAvailableSections();
    
    // Load students without filters initially
    this.loadStudents();
  }

  loadAvailableSections(): void {
    this.hallTicketService.getAvailableSections().subscribe({
      next: (sections) => {
        this.availableSections = sections;
      },
      error: (error) => {
        console.error('Error loading sections:', error);
        // Fallback to default sections
        this.availableSections = ['A', 'B', 'C', 'D'];
      }
    });
  }

  loadStudents(): void {
    if (!this.selectedExamSeriesForRelease) return;
    
    this.isLoadingStudents = true;
    
    // Get year from exam series
    const year = this.selectedExamSeriesForRelease.year.toString();
    
    // Get selected branches (or all available branches if none selected)
    const branches = this.selectedBranches.size > 0 
      ? Array.from(this.selectedBranches) 
      : this.availableBranches;
    
    // Get selected sections (or undefined to get all)
    const sections = this.selectedSections.size > 0 
      ? Array.from(this.selectedSections) 
      : undefined;
    
    this.hallTicketService.getStudentsForHallTicket(
      this.selectedExamSeriesForRelease.id,
      branches,
      sections,
      year
    ).subscribe({
      next: (students) => {
        this.studentsList = students;
        this.isLoadingStudents = false;
        
        // Auto-deselect students that are no longer in the list
        this.filterStudentsBySelection();
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.errorMessage = 'Failed to load students. Please try again.';
        this.isLoadingStudents = false;
        this.studentsList = [];
      }
    });
  }

  closeReleaseModal(): void {
    this.showReleaseModal = false;
    this.selectedExamSeriesForRelease = null;
    this.selectedBranches.clear();
    this.selectedSections.clear();
    this.selectedStudents.clear();
    this.studentsList = [];
    this.isLoadingStudents = false;
  }

  toggleBranchSelection(branch: string): void {
    if (this.selectedBranches.has(branch)) {
      this.selectedBranches.delete(branch);
    } else {
      this.selectedBranches.add(branch);
    }
    this.updateSelectAllBranches();
    
    // Reload students with new filter
    this.loadStudents();
  }

  toggleSectionSelection(section: string): void {
    if (this.selectedSections.has(section)) {
      this.selectedSections.delete(section);
    } else {
      this.selectedSections.add(section);
    }
    this.updateSelectAllSections();
    
    // Reload students with new filter
    this.loadStudents();
  }

  toggleStudentSelection(studentId: number): void {
    if (this.selectedStudents.has(studentId)) {
      this.selectedStudents.delete(studentId);
    } else {
      this.selectedStudents.add(studentId);
    }
    this.updateSelectAllStudents();
  }

  toggleSelectAllBranches(): void {
    this.selectAllBranches = !this.selectAllBranches;
    if (this.selectAllBranches) {
      this.availableBranches.forEach(branch => this.selectedBranches.add(branch));
    } else {
      this.selectedBranches.clear();
    }
    // Reload students with new filter
    this.loadStudents();
  }

  toggleSelectAllSections(): void {
    this.selectAllSections = !this.selectAllSections;
    if (this.selectAllSections) {
      this.availableSections.forEach(section => this.selectedSections.add(section));
    } else {
      this.selectedSections.clear();
    }
    // Reload students with new filter
    this.loadStudents();
  }

  toggleSelectAllStudents(): void {
    this.selectAllStudents = !this.selectAllStudents;
    if (this.selectAllStudents) {
      this.getFilteredStudents().forEach(student => this.selectedStudents.add(student.id));
    } else {
      this.selectedStudents.clear();
    }
  }

  updateSelectAllBranches(): void {
    this.selectAllBranches = this.availableBranches.length > 0 && 
                              this.selectedBranches.size === this.availableBranches.length;
  }

  updateSelectAllSections(): void {
    this.selectAllSections = this.availableSections.length > 0 && 
                              this.selectedSections.size === this.availableSections.length;
  }

  updateSelectAllStudents(): void {
    const filteredStudents = this.getFilteredStudents();
    this.selectAllStudents = filteredStudents.length > 0 && 
                              this.selectedStudents.size === filteredStudents.length;
  }

  filterStudentsBySelection(): void {
    // Auto-deselect students that no longer match the filter
    const currentStudentIds = new Set(this.studentsList.map(s => s.id));
    
    // Remove students that are no longer in the filtered list
    Array.from(this.selectedStudents).forEach(studentId => {
      if (!currentStudentIds.has(studentId)) {
        this.selectedStudents.delete(studentId);
      }
    });
    
    this.updateSelectAllStudents();
  }

  getFilteredStudents(): StudentForHallTicket[] {
    // Students are already filtered from the API
    return this.studentsList;
  }

  releaseHallTickets(): void {
    if (!this.selectedExamSeriesForRelease || this.selectedStudents.size === 0) {
      return;
    }

    const requestData = {
      examSeriesId: this.selectedExamSeriesForRelease.id,
      branches: Array.from(this.selectedBranches),
      sections: Array.from(this.selectedSections),
      studentIds: Array.from(this.selectedStudents),
      selectAll: false
    };

    console.log('Releasing Hall Tickets:', requestData);

    // Start releasing animation
    this.isReleasingHallTickets = true;

    // Call backend API
    this.hallTicketService.releaseHallTickets(requestData).subscribe({
      next: (response) => {
        console.log('Release response:', response);

        // Stop releasing, show success
        this.isReleasingHallTickets = false;
        this.showSuccessAnimation = true;

        // Update hall ticket status
        this.hallTicketStatus[this.selectedExamSeriesForRelease!.id] = true;
        localStorage.setItem('hallTicketStatus', JSON.stringify(this.hallTicketStatus));

        // Hide success animation after 3 seconds
        setTimeout(() => {
          this.showSuccessAnimation = false;
          
          // Show detailed success message
          alert(`🎫 Hall Tickets Released!\n\n` +
                `Exam Series: ${this.selectedExamSeriesForRelease!.name}\n` +
                `Branches: ${requestData.branches.join(', ') || 'All'}\n` +
                `Sections: ${requestData.sections.join(', ') || 'All'}\n\n` +
                `✅ Newly Released: ${response.newlyReleased}\n` +
                `ℹ️ Already Released: ${response.alreadyReleased}\n` +
                `📊 Total: ${response.totalStudents}\n\n` +
                `${response.message}`);

          // Reload students to update status
          this.loadStudents();

          // Close modal
          this.closeReleaseModal();
        }, 3000);
      },
      error: (error) => {
        console.error('Error releasing hall tickets:', error);
        
        // Stop releasing animation
        this.isReleasingHallTickets = false;
        this.showSuccessAnimation = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          const errorMsg = error.error?.message || 'Failed to release hall tickets. Please try again.';
          alert(`❌ Error: ${errorMsg}`);
        }
      }
    });
  }

  toggleHallTicket(examSeriesId: string): void {
    this.hallTicketStatus[examSeriesId] = !this.hallTicketStatus[examSeriesId];
    localStorage.setItem('hallTicketStatus', JSON.stringify(this.hallTicketStatus));
  }

  isHallTicketReleased(examSeriesId: string): boolean {
    return this.hallTicketStatus[examSeriesId] || false;
  }
}
