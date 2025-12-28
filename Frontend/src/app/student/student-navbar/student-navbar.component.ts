import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-navbar',
  templateUrl: './student-navbar.component.html',
  styleUrls: ['./student-navbar.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class StudentNavbarComponent {}
