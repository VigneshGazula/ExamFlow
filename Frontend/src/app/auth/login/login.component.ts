import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  userType: 'student' | 'teacher' | 'admin' = 'student';
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  selectUserType(type: 'student' | 'teacher' | 'admin') {
    this.userType = type;
  }

  onSubmit() {
    console.log('Login submitted:', {
      userType: this.userType,
      email: this.email,
      password: this.password
    });
    
    if (this.userType === 'student') {
      this.router.navigate(['/student']);
    }
  }
}
