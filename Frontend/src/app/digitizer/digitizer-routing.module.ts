import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DigitizerNavbarComponent } from './digitizer-navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UploadScriptComponent } from './upload-script/upload-script.component';
import { UploadHistoryComponent } from './upload-history/upload-history.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: DigitizerNavbarComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'upload-script', component: UploadScriptComponent },
      { path: 'upload-history', component: UploadHistoryComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DigitizerRoutingModule { }
