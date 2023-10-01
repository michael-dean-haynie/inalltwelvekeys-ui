import {PitchClass} from "./pitch-class";
import {MidiNote} from "./midi-note";

export class PianoKey {
  readonly number: number
  readonly octave: number
  readonly pitchClass: PitchClass

  constructor(public midiNote: MidiNote) {
    this.number = midiNote.number - 20;
    this.octave = Math.floor((this.number + 8) / 12);
    this.pitchClass = new PitchClass(midiNote);
  }
}
