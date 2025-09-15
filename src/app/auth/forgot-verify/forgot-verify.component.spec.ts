import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotVerifyComponent } from './forgot-verify.component';

describe('ForgotVerifyComponent', () => {
  let component: ForgotVerifyComponent;
  let fixture: ComponentFixture<ForgotVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotVerifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
