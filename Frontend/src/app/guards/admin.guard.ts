import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Only check in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    const token = localStorage.getItem('jwt');
    const role = localStorage.getItem('role');

    // Check if user is logged in
    if (!token) {
      console.warn('No JWT token found. Redirecting to login.');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Check if user has Admin role
    if (role !== 'Admin') {
      console.warn('Access denied. Admin role required.');
      alert('Access denied. This section is for administrators only.');
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
