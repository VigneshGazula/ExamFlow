import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DigitizerRoutingModule } from './digitizer-routing.module';
import { DigitizerNavbarComponent } from './digitizer-navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UploadScriptComponent } from './upload-script/upload-script.component';
import { UploadHistoryComponent } from './upload-history/upload-history.component';
import { ProfileComponent as DigitizerProfileComponent } from './profile/profile.component';

@NgModule({
  imports: [
    CommonModule,
    DigitizerRoutingModule,
    DigitizerNavbarComponent,
    DashboardComponent,
    UploadScriptComponent,
    UploadHistoryComponent,
    DigitizerProfileComponent
  ]
})
export class DigitizerModule { }
