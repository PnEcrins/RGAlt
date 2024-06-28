import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SynthesisInterfaceComponent } from './synthesis-interface.component';

describe('SynthesisInterfaceComponent', () => {
  let component: SynthesisInterfaceComponent;
  let fixture: ComponentFixture<SynthesisInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SynthesisInterfaceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SynthesisInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
