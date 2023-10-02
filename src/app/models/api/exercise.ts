import {Iteration} from "./iteration";

export interface Exercise {
  id: string;
  name?: string;
  description?: string;
  iterations: Iteration[];
}
