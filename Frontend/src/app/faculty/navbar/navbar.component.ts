import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthApiService } from '../../auth/auth-api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class NavbarComponent {
  constructor(
    private authService: AuthApiService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.clearAuth();
    this.router.navigate(['/login']);
  }
}
