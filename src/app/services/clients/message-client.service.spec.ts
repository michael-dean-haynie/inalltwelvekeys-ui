import { TestBed } from '@angular/core/testing';

import { MessageClientService } from './message-client.service';

describe('MessageClientService', () => {
  let service: MessageClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
