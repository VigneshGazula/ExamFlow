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
  userType: 'student' | 'teacher' | 'admin' | 'digitiser' = 'student';
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  selectUserType(type: 'student' | 'teacher' | 'admin' | 'digitiser') {
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
    } else if (this.userType === 'digitiser') {
      this.router.navigate(['/digitizer']);
    } else if(this.userType === 'teacher') {
      this.router.navigate(['/faculty']);
    } else if(this.userType === 'admin') {
      this.router.navigate(['/admin']);
    }
  }
}
