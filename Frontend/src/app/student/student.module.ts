import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StudentNavbarComponent } from './student-navbar/student-navbar.component';
import { AcademicScheduleComponent } from './academic-schedule/academic-schedule.component';
import { HallTicketComponent } from './hall-ticket/hall-ticket.component';
import { SeatingComponent } from './seating/seating.component';
import { MindMapComponent } from './mind-map/mind-map.component';
import { EventsComponent } from './events/events.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  imports: [
    CommonModule,
    StudentRoutingModule,
    DashboardComponent,
    StudentNavbarComponent,
    AcademicScheduleComponent,
    HallTicketComponent,
    SeatingComponent,
    MindMapComponent,
    EventsComponent,
    ProfileComponent
  ]
})
export class StudentModule { }
