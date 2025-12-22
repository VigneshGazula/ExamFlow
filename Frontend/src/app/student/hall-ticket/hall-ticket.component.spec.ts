import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HallTicketComponent } from './hall-ticket.component';

describe('HallTicketComponent', () => {
  let component: HallTicketComponent;
  let fixture: ComponentFixture<HallTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HallTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HallTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
