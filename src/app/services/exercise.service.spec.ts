import { TestBed } from '@angular/core/testing';

import { ExerciseService } from './exercise.service';
import {RomanNumeral} from "tonal";

fdescribe('ExerciseService', () => {
  let service: ExerciseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExerciseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  fdescribe('getHashCode', () => {
    it('should return the same code for meaningfully identical models', () => {
      // Act
      const hash1 = service.getHashCode({
        id: 'Exercise 1',
        hash: 'should not affect anything',
        description: 'The first exercise',
        beats: [{
          chordRomanNumeral: 'I',
          chordVoicing: ['3M', '5P', '7M', '9M']

        }]
      });

      const hash2 = service.getHashCode({
        id: 'Exercise 2',
        description: 'The second exercise',
        hash: 'should not affect anything',
        beats: [{
          chordRomanNumeral: 'I',
          chordVoicing: ['3M', '5P', '7M', '9M']

        }]
      });

      // Assert
      expect(hash1).toEqual(hash2);
    });
  });

  describe('sandbox', () => {
    it('sandbox', () => {
      // console.log(RomanNumeral.get())
    });
  });
});
