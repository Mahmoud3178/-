import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvideStatusComponent } from './provide-status.component';

describe('ProvideStatusComponent', () => {
  let component: ProvideStatusComponent;
  let fixture: ComponentFixture<ProvideStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvideStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvideStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
