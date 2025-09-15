import { TestBed } from '@angular/core/testing';

import { PreviosWorkService } from './previos-work.service';

describe('PreviosWorkService', () => {
  let service: PreviosWorkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreviosWorkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
