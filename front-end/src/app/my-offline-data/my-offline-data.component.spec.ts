import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOfflineDataComponent } from './my-offline-data.component';

describe('MyOfflineDataComponent', () => {
  let component: MyOfflineDataComponent;
  let fixture: ComponentFixture<MyOfflineDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyOfflineDataComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyOfflineDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
