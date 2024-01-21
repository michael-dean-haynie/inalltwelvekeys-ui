// the "details" of a particular execution of a key in an exercise
import {BeatDeetz} from "./beat-deetz";

export interface KeyDeetz {
  // the key in which this exercise was executed
  key: string;

  // the chronological sort order (the order in which this key was executed for the exercise)
  chronSortId: number;

  // ms between when then entire exercise started and this key was started (prompted)
  msSinceExerciseStart: number;

  // the details about each beat in this execution
  beatDeetz: BeatDeetz[];
}
