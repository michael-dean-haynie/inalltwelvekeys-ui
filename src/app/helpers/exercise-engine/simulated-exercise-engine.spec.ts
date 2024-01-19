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

    engine.simulate(
      [
        { id: 1, byte1: 1, byte2: 1, byte3: 1, timestamp: 1},
        { id: 3, byte1: 3, byte2: 3, byte3: 3, timestamp: 3}
      ],
      [
        { type: 'user selected next key', timestamp: 2},
        { type: 'user selected next key', timestamp: 4}
      ]
    );

    expect(true).toBeTruthy();
  });
});
