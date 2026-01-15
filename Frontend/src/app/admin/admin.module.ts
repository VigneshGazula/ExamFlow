import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { NavbarComponent } from './navbar/navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageExamsComponent } from './manage-exams/manage-exams.component';
import { SeatingOverviewComponent } from './seating-overview/seating-overview.component';
import { ScriptAssignmentComponent } from './script-assignment/script-assignment.component';
import { EvaluationMonitorComponent } from './evaluation-monitor/evaluation-monitor.component';
import { SettingsComponent } from './settings/settings.component';
import { ExamSeriesFormComponent } from './exam-series-form/exam-series-form.component';
import { BranchScheduleListComponent } from './branch-schedule-list/branch-schedule-list.component';
import { BranchExamSchedulerComponent } from './branch-exam-scheduler/branch-exam-scheduler.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    NavbarComponent,
    DashboardComponent,
    ManageUsersComponent,
    ManageExamsComponent,
    SeatingOverviewComponent,
    ScriptAssignmentComponent,
    EvaluationMonitorComponent,
    SettingsComponent,
    ExamSeriesFormComponent,
    BranchScheduleListComponent,
    BranchExamSchedulerComponent
  ]
})
export class AdminModule { }
