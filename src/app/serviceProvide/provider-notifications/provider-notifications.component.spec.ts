import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderNotificationsComponent } from './provider-notifications.component';

describe('ProviderNotificationsComponent', () => {
  let component: ProviderNotificationsComponent;
  let fixture: ComponentFixture<ProviderNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
