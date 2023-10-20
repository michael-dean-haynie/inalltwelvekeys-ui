import {ExerciseBeat} from "./exercise-beat";

export interface Exercise {
  id: string;
  name?: string;
  description?: string;
  beats: ExerciseBeat[];
}
