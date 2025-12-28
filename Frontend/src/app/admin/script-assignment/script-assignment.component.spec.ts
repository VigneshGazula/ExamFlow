import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptAssignmentComponent } from './script-assignment.component';

describe('ScriptAssignmentComponent', () => {
  let component: ScriptAssignmentComponent;
  let fixture: ComponentFixture<ScriptAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScriptAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScriptAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
