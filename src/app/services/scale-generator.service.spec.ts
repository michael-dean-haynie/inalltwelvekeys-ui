import { TestBed } from '@angular/core/testing';

import { ScaleGeneratorService } from './scale-generator.service';

describe('ScaleGeneratorService', () => {
  let service: ScaleGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScaleGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
