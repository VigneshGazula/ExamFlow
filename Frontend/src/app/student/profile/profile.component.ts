import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentProfileService, StudentProfileResponse } from '../../services/student-profile.service';
import { Router } from '@angular/router';

interface UserInfo {
  fullName: string;
  email: string;
  userId: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: StudentProfileResponse | null = null;
  userInfo: UserInfo | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private studentProfileService: StudentProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadProfile();
  }

  loadUserInfo(): void {
    // Get user info from localStorage (set during login)
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      this.userInfo = JSON.parse(storedUser);
    }
  }

  loadProfile(): void {
    this.isLoading = true;
    this.studentProfileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 404) {
          this.errorMessage = 'Profile not found. Please complete your profile.';
          setTimeout(() => {
            this.router.navigate(['/student/complete-profile']);
          }, 2000);
        } else {
          this.errorMessage = error.error?.message || 'Failed to load profile';
        }
        
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
}
