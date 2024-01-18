import {ExerciseBeat} from "./exercise-beat";

export interface Exercise {

  // the unique identifier for the data-store
  id?: string;

  // used for equality check between exercises
  hash?: string;

  // user-facing name
  name?: string;

  // user-facing description
  description?: string;

  // the "steps" in this exercise
  beats: ExerciseBeat[];
}
