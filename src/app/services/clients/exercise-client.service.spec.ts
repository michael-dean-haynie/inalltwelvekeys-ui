import { TestBed } from '@angular/core/testing';

import { ExerciseClientService } from './exercise-client.service';

describe('ExerciseClientService', () => {
  let service: ExerciseClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExerciseClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
