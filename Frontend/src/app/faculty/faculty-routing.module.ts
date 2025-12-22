import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExamScheduleComponent } from './exam-schedule/exam-schedule.component';
import { InvigilationComponent } from './invigilation/invigilation.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'exam-schedule', component: ExamScheduleComponent },
      { path: 'invigilation', component: InvigilationComponent },
      { path: 'evaluation', component: EvaluationComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacultyRoutingModule { }
