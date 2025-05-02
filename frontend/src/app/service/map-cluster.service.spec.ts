import { TestBed } from '@angular/core/testing';

import { MapClusterService } from './map-cluster.service';

describe('MapClusterService', () => {
  let service: MapClusterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapClusterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
