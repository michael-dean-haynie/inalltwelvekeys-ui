import {Iteration} from "./iteration";

export interface Exercise {
  id: string;
  name?: string;
  description?: string;
  // "keys"
  iterations: Iteration[];
  // a sequence of chords - each member defined by their half-step offset from the iteration note (key)
  sequence: number[][];
}
