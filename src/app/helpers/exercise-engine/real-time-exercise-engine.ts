import {ExerciseEngine} from "./exercise-engine";
import {Exercise} from "../../models/api/exercise";

export class RealTimeExerciseEngine extends ExerciseEngine {

  constructor(exercise: Exercise, keySequence: string[]) {
    super(exercise, keySequence);
    console.log({ exercise: this.exercise, keySequence: this.keySequence});
  }
}
