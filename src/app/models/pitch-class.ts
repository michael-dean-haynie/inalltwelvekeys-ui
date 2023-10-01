import { posModRes } from "../utilities/math-utilities";
import {MidiNote} from "./midi-note";

export class PitchClass {
  private readonly _integerNotation: number;

  constructor(midiNote: MidiNote) {
    this._integerNotation = posModRes(midiNote.number - 24, 12);
  }

  get integerNotation(): number {
    return this._integerNotation;
  }
}
