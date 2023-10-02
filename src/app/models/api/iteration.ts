import {Accidental, NoteLetter} from "../notation";

export interface Iteration {
  noteLetter: NoteLetter;
  accidental: Accidental;
  enabled: boolean;
}
