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

const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'manage-users', component: ManageUsersComponent },
      { path: 'manage-exams', component: ManageExamsComponent },
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
