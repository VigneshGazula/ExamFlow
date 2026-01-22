import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ExamService } from '../../services/exam.service';

@Component({
  selector: 'app-exam-series-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './exam-series-form.component.html',
  styleUrl: './exam-series-form.component.css'
})
export class ExamSeriesFormComponent implements OnInit {
  examSeriesForm!: FormGroup;
  allBranches: string[] = [];
  isSubmitting = false;
  errorMessage = '';

  examTypes = [
    { value: 1, label: 'Semester' },
    { value: 2, label: 'Midterm' },
    { value: 3, label: 'Internal Lab' },
    { value: 4, label: 'External Lab' }
  ];

  years = [1, 2, 3, 4];

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadBranches();
  }

  initializeForm(): void {
    this.examSeriesForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      examType: [1, Validators.required],
      year: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
      branches: [[], Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  loadBranches(): void {
    this.examService.getAllBranches().subscribe({
      next: (branches) => {
        this.allBranches = branches;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        // Fallback to static list if API fails
        this.allBranches = ['CSE', 'ECE', 'IT', 'EEE', 'MECH', 'CIVIL'];
        // Don't show error to user since we have a fallback
      }
    });
  }

  onBranchToggle(branch: string): void {
    const selectedBranches = this.examSeriesForm.get('branches')?.value || [];
    const index = selectedBranches.indexOf(branch);
    
    if (index > -1) {
      selectedBranches.splice(index, 1);
    } else {
      selectedBranches.push(branch);
    }
    
    this.examSeriesForm.patchValue({ branches: selectedBranches });
  }

  isBranchSelected(branch: string): boolean {
    const selectedBranches = this.examSeriesForm.get('branches')?.value || [];
    return selectedBranches.includes(branch);
  }

  onSubmit(): void {
    if (this.examSeriesForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    const formValue = this.examSeriesForm.value;

    // Validate dates
    if (new Date(formValue.startDate) >= new Date(formValue.endDate)) {
      this.errorMessage = 'Start date must be before end date';
      return;
    }

    if (formValue.branches.length === 0) {
      this.errorMessage = 'Please select at least one branch';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.examService.createExamSeries(formValue).subscribe({
      next: (response) => {
        console.log('Exam series created:', response);
        const examSeriesId = response.examSeries.id;
        this.router.navigate(['/admin/manage-exams/series', examSeriesId, 'schedule']);
      },
      error: (error) => {
        console.error('Error creating exam series:', error);
        this.errorMessage = error.error?.message || 'Failed to create exam series';
        this.isSubmitting = false;
      }
    });
  }
}
