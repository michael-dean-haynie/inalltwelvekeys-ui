import {Accidental, Accidentals, NoteLetter} from "./notation";

export class SpelledPitchClass {
  constructor(
    public noteLetter: NoteLetter,
    public accidental: Accidental = Accidentals.Natural
  ) {}
}
