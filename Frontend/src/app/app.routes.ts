import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';

import { InitialComponent } from './initial.component';

export const routes: Routes = [
  { path: '', component: InitialComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'student',
    loadChildren: () => import('./student/student.module').then(m => m.StudentModule)
  },
  {
    path: 'digitizer',
    loadChildren: () => import('./digitizer/digitizer.module').then(m => m.DigitizerModule)
  },
  {
    path: 'faculty',
    loadChildren: () => import('./faculty/faculty.module').then(m => m.FacultyModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];
