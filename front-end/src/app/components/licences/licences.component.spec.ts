import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicencesComponent } from './licences.component';

describe('LicencesComponent', () => {
  let component: LicencesComponent;
  let fixture: ComponentFixture<LicencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicencesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LicencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
