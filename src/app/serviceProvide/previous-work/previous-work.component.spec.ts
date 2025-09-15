import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousWorkComponent } from './previous-work.component';

describe('PreviousWorkComponent', () => {
  let component: PreviousWorkComponent;
  let fixture: ComponentFixture<PreviousWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousWorkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
