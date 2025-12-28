import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationMonitorComponent } from './evaluation-monitor.component';

describe('EvaluationMonitorComponent', () => {
  let component: EvaluationMonitorComponent;
  let fixture: ComponentFixture<EvaluationMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
