import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService, SignupRequest } from '../auth-api.service';

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
  userId: string = '';
  password: string = '';
  confirmPassword: string = '';
  acceptTerms: boolean = false;

  constructor(private authApi: AuthApiService, private router: Router) {}

  onSubmit(): void {
    if (!this.userId.trim() || !this.fullName.trim() || !this.email.trim() || !this.password.trim()) {
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
      userId: this.userId,
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword
    };

    this.authApi.signup(data).subscribe({
      next: (res) => {
        alert('Signup successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Unknown error occurred';
        
        if (errorMessage.includes('User already exists')) {
          alert('User already exists. Please login or use a different User ID.');
        } else if (errorMessage.includes('Password and Confirm Password do not match')) {
          alert('Passwords do not match!');
        } else if (errorMessage.includes('Invalid User ID format')) {
          alert('Invalid User ID format. Use prefixes: st (Student), fc (Faculty), ad (Admin), dg (Digitizer).');
        } else {
          alert('Signup failed: ' + errorMessage);
        }
      }
    });
  }
}
