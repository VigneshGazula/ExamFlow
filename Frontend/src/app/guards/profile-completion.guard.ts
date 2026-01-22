import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StudentProfileService } from '../services/student-profile.service';
import { AuthApiService } from '../auth/auth-api.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileCompletionGuard implements CanActivate {
  constructor(
    private studentProfileService: StudentProfileService,
    private authService: AuthApiService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const role = this.authService.getRole();
    
    // Only check for students
    if (role !== 'Student') {
      return of(true);
    }

    return this.studentProfileService.checkProfileStatus().pipe(
      map(status => {
        if (!status.hasProfile) {
          // Redirect to profile completion
          this.router.navigate(['/student/complete-profile']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        // On error, allow access
        return of(true);
      })
    );
  }
}
