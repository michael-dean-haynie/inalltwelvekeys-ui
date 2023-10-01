import {INoteValue, Instrument, NoteValue} from "piano-chart";
import {PianoKey} from "../piano-key";
import {MidiNote} from "../midi-note";

export class PianoChartAdapter {
  constructor(private instrument: Instrument) {}

  public keyDown(midiNote: MidiNote) {
    this.instrument.keyDown(this.convertMidiNoteToNoteValue(midiNote))
  }

  public keyUp(midiNote: MidiNote) {
    this.instrument.keyUp(this.convertMidiNoteToNoteValue(midiNote))
  }

  private convertMidiNoteToNoteValue(midiNote: MidiNote): INoteValue {
    const pianoKey = new PianoKey(midiNote);
    const pianoKeyMap: INoteValue[] = [
      { note: "C", octave: pianoKey.octave },
      { note: "D", octave: pianoKey.octave, accidental: "b"},
      { note: "D", octave: pianoKey.octave },
      { note: "E", octave: pianoKey.octave, accidental: "b"},
      { note: "E", octave: pianoKey.octave },
      { note: "F", octave: pianoKey.octave },
      { note: "G", octave: pianoKey.octave, accidental: "b"},
      { note: "G", octave: pianoKey.octave },
      { note: "A", octave: pianoKey.octave, accidental: "b"},
      { note: "A", octave: pianoKey.octave },
      { note: "B", octave: pianoKey.octave, accidental: "b"},
      { note: "B", octave: pianoKey.octave },
    ];

    return pianoKeyMap[pianoKey.pitchClass.integerNotation];
  }
}
