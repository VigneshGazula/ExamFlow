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
  
  // Modal related properties
  showReleaseModal = false;
  selectedExamSeriesForRelease: ExamSeriesResponse | null = null;
  
  // Form data
  availableBranches: string[] = [];
  availableSections: string[] = ['A', 'B', 'C', 'D'];
  studentsList: any[] = [];
  
  // Selection state
  selectedBranches: Set<string> = new Set();
  selectedSections: Set<string> = new Set();
  selectedStudents: Set<string> = new Set();
  
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
    this.availableBranches = series.branches;
    this.showReleaseModal = true;
    
    // Reset selections
    this.selectedBranches.clear();
    this.selectedSections.clear();
    this.selectedStudents.clear();
    this.selectAllBranches = false;
    this.selectAllSections = false;
    this.selectAllStudents = false;
    
    // Generate mock student list
    this.generateMockStudents();
  }

  closeReleaseModal(): void {
    this.showReleaseModal = false;
    this.selectedExamSeriesForRelease = null;
    this.selectedBranches.clear();
    this.selectedSections.clear();
    this.selectedStudents.clear();
  }

  generateMockStudents(): void {
    // Generate mock student data for demonstration
    this.studentsList = [];
    const branches = this.availableBranches;
    const sections = this.availableSections;
    
    let studentId = 1;
    branches.forEach(branch => {
      sections.forEach(section => {
        // Generate 5 students per section
        for (let i = 1; i <= 5; i++) {
          this.studentsList.push({
            id: `STU${studentId.toString().padStart(4, '0')}`,
            name: `Student ${studentId}`,
            branch: branch,
            section: section,
            rollNumber: `${branch}${section}${i.toString().padStart(3, '0')}`
          });
          studentId++;
        }
      });
    });
  }

  toggleBranchSelection(branch: string): void {
    if (this.selectedBranches.has(branch)) {
      this.selectedBranches.delete(branch);
    } else {
      this.selectedBranches.add(branch);
    }
    this.updateSelectAllBranches();
    this.filterStudentsBySelection();
  }

  toggleSectionSelection(section: string): void {
    if (this.selectedSections.has(section)) {
      this.selectedSections.delete(section);
    } else {
      this.selectedSections.add(section);
    }
    this.updateSelectAllSections();
    this.filterStudentsBySelection();
  }

  toggleStudentSelection(studentId: string): void {
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
    this.filterStudentsBySelection();
  }

  toggleSelectAllSections(): void {
    this.selectAllSections = !this.selectAllSections;
    if (this.selectAllSections) {
      this.availableSections.forEach(section => this.selectedSections.add(section));
    } else {
      this.selectedSections.clear();
    }
    this.filterStudentsBySelection();
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
    // Auto-deselect students that no longer match the branch/section filter
    const filteredStudents = this.getFilteredStudents();
    const filteredIds = new Set(filteredStudents.map(s => s.id));
    
    // Remove students that are no longer in the filtered list
    Array.from(this.selectedStudents).forEach(studentId => {
      if (!filteredIds.has(studentId)) {
        this.selectedStudents.delete(studentId);
      }
    });
    
    this.updateSelectAllStudents();
  }

  getFilteredStudents(): any[] {
    if (this.selectedBranches.size === 0 && this.selectedSections.size === 0) {
      return this.studentsList;
    }
    
    return this.studentsList.filter(student => {
      const branchMatch = this.selectedBranches.size === 0 || this.selectedBranches.has(student.branch);
      const sectionMatch = this.selectedSections.size === 0 || this.selectedSections.has(student.section);
      return branchMatch && sectionMatch;
    });
  }

  releaseHallTickets(): void {
    if (!this.selectedExamSeriesForRelease) return;

    const selectedData = {
      examSeriesId: this.selectedExamSeriesForRelease.id,
      examSeriesName: this.selectedExamSeriesForRelease.name,
      branches: Array.from(this.selectedBranches),
      sections: Array.from(this.selectedSections),
      students: Array.from(this.selectedStudents),
      totalStudents: this.selectedStudents.size
    };

    console.log('Releasing Hall Tickets:', selectedData);

    // Update hall ticket status
    this.toggleHallTicket(this.selectedExamSeriesForRelease.id);

    // Show success message
    alert(`🎫 Hall Tickets Released!\n\n` +
          `Exam Series: ${selectedData.examSeriesName}\n` +
          `Branches: ${selectedData.branches.join(', ')}\n` +
          `Sections: ${selectedData.sections.join(', ')}\n` +
          `Total Students: ${selectedData.totalStudents}\n\n` +
          `✅ Hall tickets have been released successfully!`);

    // Close modal
    this.closeReleaseModal();
  }

  toggleHallTicket(examSeriesId: string): void {
    this.hallTicketStatus[examSeriesId] = !this.hallTicketStatus[examSeriesId];
    localStorage.setItem('hallTicketStatus', JSON.stringify(this.hallTicketStatus));
  }

  isHallTicketReleased(examSeriesId: string): boolean {
    return this.hallTicketStatus[examSeriesId] || false;
  }
}
