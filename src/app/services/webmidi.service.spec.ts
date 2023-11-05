import { TestBed } from '@angular/core/testing';

import { WebmidiService } from './webmidi.service';

describe('WebmidiService', () => {
  let service: WebmidiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebmidiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
