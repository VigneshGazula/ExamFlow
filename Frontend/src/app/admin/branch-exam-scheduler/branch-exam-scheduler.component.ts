import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamService, AvailableDateResponse, ScheduleBranchRequest, ExamScheduleItem } from '../../services/exam.service';

@Component({
  selector: 'app-branch-exam-scheduler',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './branch-exam-scheduler.component.html',
  styleUrl: './branch-exam-scheduler.component.css'
})
export class BranchExamSchedulerComponent implements OnInit {
  examSeriesId!: string;
  branch!: string;
  availableDates: AvailableDateResponse[] = [];
  subjects: string[] = [];
  schedulerForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.examSeriesId = this.route.snapshot.paramMap.get('id') || '';
    this.branch = this.route.snapshot.paramMap.get('branch') || '';

    this.initializeForm();
    this.loadData();
  }

  initializeForm(): void {
    this.schedulerForm = this.fb.group({
      globalStartTime: ['09:00', Validators.required],
      globalEndTime: ['12:00', Validators.required],
      examDates: this.fb.array([])
    });
  }

  get examDates(): FormArray {
    return this.schedulerForm.get('examDates') as FormArray;
  }

  getExamStatus(dateStr: string): string {
    const examDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    const globalStartTime = this.schedulerForm.get('globalStartTime')?.value || '09:00';
    const globalEndTime = this.schedulerForm.get('globalEndTime')?.value || '12:00';

    const now = new Date();
    const examStartDateTime = new Date(dateStr);
    const [startHour, startMinute] = globalStartTime.split(':');
    examStartDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    const examEndDateTime = new Date(dateStr);
    const [endHour, endMinute] = globalEndTime.split(':');
    examEndDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    if (now < examStartDateTime) {
      return 'To Be Done';
    } else if (now >= examStartDateTime && now <= examEndDateTime) {
      return 'Ongoing';
    } else {
      return 'Completed';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'To Be Done':
        return 'warning';
      case 'Ongoing':
        return 'info';
      case 'Completed':
        return 'success';
      default:
        return 'secondary';
    }
  }

  loadData(): void {
    this.isLoading = true;

    // Load subjects for the branch
    this.examService.getBranchSubjects(this.branch).subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.loadAvailableDates();
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.errorMessage = 'Failed to load subjects for this branch';
        this.isLoading = false;
      }
    });
  }

  loadAvailableDates(): void {
    this.examService.getAvailableDates(this.examSeriesId, this.branch).subscribe({
      next: (dates) => {
        this.availableDates = dates;
        this.createDateFormControls();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dates:', error);
        this.errorMessage = 'Failed to load available dates';
        this.isLoading = false;
      }
    });
  }

  createDateFormControls(): void {
    this.examDates.clear();
    this.availableDates.forEach(date => {
      // Check if the scheduled subject is "Holiday"
      const isHoliday = date.scheduledSubject === 'Holiday';
      const subject = isHoliday ? '' : (date.scheduledSubject || '');
      
      this.examDates.push(this.fb.group({
        date: [date.date],
        dayOfWeek: [date.dayOfWeek],
        subject: [subject],
        isHoliday: [isHoliday],
        isScheduled: [date.isScheduled]
      }));
    });
  }

  onHolidayChange(index: number): void {
    const dateGroup = this.examDates.at(index) as FormGroup;
    const isHoliday = dateGroup.get('isHoliday')?.value;
    
    if (isHoliday) {
      dateGroup.patchValue({ subject: '' });
    }
  }

  onSubjectChange(index: number): void {
    const dateGroup = this.examDates.at(index) as FormGroup;
    const subject = dateGroup.get('subject')?.value;
    
    if (subject) {
      dateGroup.patchValue({ isHoliday: false });
    }
  }

  onSubmit(): void {
    if (this.schedulerForm.invalid) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    const formValue = this.schedulerForm.value;

    // Validate times
    if (formValue.globalStartTime >= formValue.globalEndTime) {
      this.errorMessage = 'Start time must be before end time';
      return;
    }

    // Build exam schedule items
    const examScheduleItems: ExamScheduleItem[] = [];
    formValue.examDates.forEach((dateForm: any) => {
      if (dateForm.subject || dateForm.isHoliday) {
        examScheduleItems.push({
          examDate: dateForm.date,
          subject: dateForm.isHoliday ? 'Holiday' : dateForm.subject,
          isHoliday: dateForm.isHoliday
        });
      }
    });

    if (examScheduleItems.length === 0) {
      this.errorMessage = 'Please schedule at least one exam or mark days as holidays';
      return;
    }

    const scheduleRequest: ScheduleBranchRequest = {
      exams: examScheduleItems,
      globalStartTime: formValue.globalStartTime + ':00',
      globalEndTime: formValue.globalEndTime + ':00'
    };

    this.isSubmitting = true;
    this.errorMessage = '';

    this.examService.scheduleBranchExams(this.examSeriesId, this.branch, scheduleRequest).subscribe({
      next: (response) => {
        console.log('Schedule saved:', response);
        this.successMessage = `Successfully scheduled ${response.exams.length} exams for ${this.branch}`;
        
        // Redirect back to branch list after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/admin/manage-exams/series', this.examSeriesId, 'schedule']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error saving schedule:', error);
        this.errorMessage = error.error?.message || 'Failed to save schedule';
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/manage-exams/series', this.examSeriesId, 'schedule']);
  }
}
