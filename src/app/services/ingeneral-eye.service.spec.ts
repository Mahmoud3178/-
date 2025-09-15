import { TestBed } from '@angular/core/testing';

import { IngeneralEyeService } from './ingeneral-eye.service';

describe('IngeneralEyeService', () => {
  let service: IngeneralEyeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngeneralEyeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
