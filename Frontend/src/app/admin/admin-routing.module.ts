import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { AdminGuard } from '../guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'manage-users', component: ManageUsersComponent },
      { path: 'manage-exams', component: ManageExamsComponent },
      { path: 'manage-exams/create-series', component: ExamSeriesFormComponent },
      { path: 'manage-exams/series/:id/schedule', component: BranchScheduleListComponent },
      { path: 'manage-exams/series/:id/branches/:branch/scheduler', component: BranchExamSchedulerComponent },
      { path: 'seating-overview', component: SeatingOverviewComponent },
      { path: 'script-assignment', component: ScriptAssignmentComponent },
      { path: 'evaluation-monitor', component: EvaluationMonitorComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
