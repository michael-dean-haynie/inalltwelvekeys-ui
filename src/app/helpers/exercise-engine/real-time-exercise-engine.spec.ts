import {RealTimeExerciseEngine} from "./real-time-exercise-engine";

fdescribe('RealTimeExerciseEngine', () => {

  beforeEach(() => {
  });

  it('should create', () => {
    const exercise = {
      id: 'Exercise 1',
      hash: 'should not affect anything',
      description: 'The first exercise',
      beats: [{
        chordRomanNumeral: 'I',
        chordVoicing: ['3M', '5P', '7M', '9M']

      }]
    };

    const keySequence = ['B', 'E', 'A', 'D'];

    const engine = new RealTimeExerciseEngine(exercise, keySequence);

    expect(true).toBeTruthy();
  });
});
