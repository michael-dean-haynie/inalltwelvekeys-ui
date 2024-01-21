import {Exercise} from "../../models/api/exercise";
import {KeyDeetz} from "./key-deetz";

// the "details" of an execution of an exercise
export interface ExerciseDeetz {
  // the exercise that was executed
  exercise: Exercise

  // the details about the keys executed in this exercise
  keyDeetz: KeyDeetz[]
}
