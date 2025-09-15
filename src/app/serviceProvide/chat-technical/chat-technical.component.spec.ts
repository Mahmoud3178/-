import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatTechnicalComponent } from './chat-technical.component';

describe('ChatTechnicalComponent', () => {
  let component: ChatTechnicalComponent;
  let fixture: ComponentFixture<ChatTechnicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatTechnicalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatTechnicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
