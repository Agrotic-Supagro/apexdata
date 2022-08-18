import { TestBed } from '@angular/core/testing';

import { ParcelleService } from './parcelle.service';

describe('ParcelleService', () => {
  let service: ParcelleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParcelleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
