import { TestBed } from '@angular/core/testing';

import { MidiMessageService } from './midi-message.service';

describe('MidiMessageService', () => {
  let service: MidiMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MidiMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
