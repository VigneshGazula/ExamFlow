import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentNavbarComponent } from './student-navbar/student-navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AcademicScheduleComponent } from './academic-schedule/academic-schedule.component';
import { HallTicketComponent } from './hall-ticket/hall-ticket.component';
import { SeatingComponent } from './seating/seating.component';
import { MindMapComponent } from './mind-map/mind-map.component';
import { EventsComponent } from './events/events.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileCompletionComponent } from './profile-completion/profile-completion.component';
import { ExamsComponent } from './exams/exams.component';
import { ProfileCompletionGuard } from '../guards/profile-completion.guard';

const routes: Routes = [
  {
    path: 'complete-profile',
    component: ProfileCompletionComponent
  },
  {
    path: '',
    component: StudentNavbarComponent,
    canActivate: [ProfileCompletionGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'exams', component: ExamsComponent },
      { path: 'schedule', component: AcademicScheduleComponent },
      { path: 'hall-ticket', component: HallTicketComponent },
      { path: 'seating', component: SeatingComponent },
      { path: 'mind-map', component: MindMapComponent },
      { path: 'events', component: EventsComponent },
      { path: 'profile', component: ProfileComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
