import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationDetailComponent } from './observation-detail.component';

describe('ObservationDetailComponent', () => {
  let component: ObservationDetailComponent;
  let fixture: ComponentFixture<ObservationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObservationDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
