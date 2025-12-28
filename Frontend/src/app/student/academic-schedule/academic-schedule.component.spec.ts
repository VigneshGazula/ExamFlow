import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicScheduleComponent } from './academic-schedule.component';

describe('AcademicScheduleComponent', () => {
  let component: AcademicScheduleComponent;
  let fixture: ComponentFixture<AcademicScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademicScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
