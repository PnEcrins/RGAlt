import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationListItemComponent } from './observation-list-item.component';

describe('ObservationListItemComponent', () => {
  let component: ObservationListItemComponent;
  let fixture: ComponentFixture<ObservationListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObservationListItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ObservationListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
