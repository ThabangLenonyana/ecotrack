import { TestBed } from '@angular/core/testing';

import { GeographicContextService } from './geographic-context.service';

describe('GeographicContextService', () => {
  let service: GeographicContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeographicContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
