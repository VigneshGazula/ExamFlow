import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatingOverviewComponent } from './seating-overview.component';

describe('SeatingOverviewComponent', () => {
  let component: SeatingOverviewComponent;
  let fixture: ComponentFixture<SeatingOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatingOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
