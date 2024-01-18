import {SimulatedExerciseEngine} from "./simulated-exercise-engine";

fdescribe('SimulatedExerciseEngine', () => {

  beforeEach(() => {
  });

  it('should create', () => {
    const exercise = {
      id: 'Exercise 2',
      hash: 'should not affect anything',
      description: 'The second exercise',
      beats: [{
        chordRomanNumeral: 'I',
        chordVoicing: ['3M', '5P', '7M', '9M']

      }]
    };

    const keySequence = ['G', 'C', 'F', 'B'];

    const engine = new SimulatedExerciseEngine(exercise, keySequence);

    expect(true).toBeTruthy();
  });
});
