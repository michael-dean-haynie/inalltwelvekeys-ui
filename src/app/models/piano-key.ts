import {PitchClass} from "./pitch-class";
import {MidiNote} from "./midi-note";

export class PianoKey {
  readonly number: number
  readonly octave: number
  readonly pitchClass: PitchClass

  constructor(midiNote: MidiNote) {
    this.number = midiNote.number - 20;
    this.octave = Math.floor(this.number + 8);
    this.pitchClass = new PitchClass(midiNote.number);
  }
}
