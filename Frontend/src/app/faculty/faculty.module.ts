import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacultyRoutingModule } from './faculty-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExamScheduleComponent } from './exam-schedule/exam-schedule.component';
import { InvigilationComponent } from './invigilation/invigilation.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  imports: [
    CommonModule,
    FacultyRoutingModule,
    NavbarComponent,
    DashboardComponent,
    ExamScheduleComponent,
    InvigilationComponent,
    EvaluationComponent,
    ProfileComponent
  ]
})
export class FacultyModule { }
