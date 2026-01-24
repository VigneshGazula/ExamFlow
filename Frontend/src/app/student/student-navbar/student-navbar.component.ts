import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthApiService } from '../../auth/auth-api.service';

@Component({
  selector: 'app-student-navbar',
  templateUrl: './student-navbar.component.html',
  styleUrls: ['./student-navbar.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class StudentNavbarComponent {
  constructor(
    private authService: AuthApiService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.clearAuth();
    this.router.navigate(['/login']);
  }
}
