import { Component } from '@angular/core';
import { AuthApiService, LoginRequest, AuthResponse } from '../auth-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  userId: string = '';
  password: string = '';
  loginAs: 'Student' | 'Faculty' | 'Admin' | 'Digitizer' = 'Student';

  constructor(private router: Router, private authApi: AuthApiService) {}

  onSubmit(): void {
    if (!this.userId.trim() || !this.password.trim()) {
      alert('Please enter both User ID and Password.');
      return;
    }

    const data: LoginRequest = {
      userId: this.userId,
      password: this.password,
      loginAs: this.loginAs
    };

    this.authApi.login(data).subscribe({
      next: (res: AuthResponse) => {
        if (res && res.token && res.role) {
          this.authApi.storeToken(res.token);
          this.authApi.storeRole(res.role);
          
          // Navigate based on role
          if (res.role === 'Student') {
            this.router.navigate(['/student/dashboard']);
          } else if (res.role === 'Faculty') {
            this.router.navigate(['/faculty/dashboard']);
          } else if (res.role === 'Admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (res.role === 'Digitizer') {
            this.router.navigate(['/digitizer/dashboard']);
          }
        }
      },
      error: (err: any) => {
        const errorMessage = err.error?.message || 'Unknown error occurred';
        
        if (errorMessage.includes('User not found')) {
          alert('User not found. Please sign up first.');
        } else if (errorMessage.includes('Incorrect password')) {
          alert('Incorrect password.');
        } else if (errorMessage.includes('Selected role does not match')) {
          alert('Selected role does not match this user.');
        } else {
          alert('Login failed: ' + errorMessage);
        }
      }
    });
  }
}
