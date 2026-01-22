import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentProfileService, StudentProfileRequest } from '../../services/student-profile.service';

@Component({
  selector: 'app-profile-completion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-completion.component.html',
  styleUrl: './profile-completion.component.css'
})
export class ProfileCompletionComponent {
  rollNumber: string = '';
  department: string = '';
  year: string = '';
  section: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;
  showSuccess: boolean = false;

  departments = [
    'Computer Science',
    'Information Technology',
    'Electronics and Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering'
  ];

  years = ['1', '2', '3', '4'];
  sections = ['A', 'B', 'C', 'D', 'E'];

  constructor(
    private studentProfileService: StudentProfileService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';

    // Validation
    if (!this.rollNumber.trim() || !this.department || !this.year || !this.section) {
      this.errorMessage = 'All fields are required';
      return;
    }

    this.isSubmitting = true;

    const profileData: StudentProfileRequest = {
      rollNumber: this.rollNumber.trim(),
      department: this.department,
      year: this.year,
      section: this.section
    };

    this.studentProfileService.createProfile(profileData).subscribe({
      next: (response) => {
        console.log('Profile created successfully', response);
        this.showSuccess = true;
        
        // Redirect to student dashboard after a short delay
        setTimeout(() => {
          this.router.navigate(['/student/dashboard']);
        }, 1500);
      },
      error: (error) => {
        console.error('Profile creation failed', error);
        this.errorMessage = error.error?.message || 'Failed to create profile. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
