import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService, SignupRequest, SignupResponse } from '../auth-api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: 'Student' | 'Faculty' | 'Admin' | 'Digitizer' = 'Student';
  acceptTerms: boolean = false;

  showUserIdDialog: boolean = false;
  generatedUserId: string = '';

  constructor(private authApi: AuthApiService, private router: Router) {}

  onSubmit(): void {
    if (!this.fullName.trim() || !this.email.trim() || !this.password.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!this.acceptTerms) {
      alert('Please accept the terms and conditions.');
      return;
    }

    const data: SignupRequest = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      role: this.role
    };

    this.authApi.signup(data).subscribe({
      next: (res: SignupResponse) => {
        this.generatedUserId = res.userId;
        this.showUserIdDialog = true;
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Unknown error occurred';
        
        if (errorMessage.includes('Email already exists')) {
          alert('Email already exists. Please login or use a different email.');
        } else if (errorMessage.includes('Password and Confirm Password do not match')) {
          alert('Passwords do not match!');
        } else if (errorMessage.includes('Invalid role')) {
          alert('Invalid role selected.');
        } else {
          alert('Signup failed: ' + errorMessage);
        }
      }
    });
  }

  closeDialogAndNavigate(): void {
    this.showUserIdDialog = false;
    this.router.navigate(['/login']);
  }
}
