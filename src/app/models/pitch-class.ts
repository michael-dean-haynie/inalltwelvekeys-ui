import { posModRes } from "../utilities/math-utilities";
import {MidiNote} from "./midi-note";
import { Accidentals, NoteLetters} from "./notation";
import {SpelledPitchClass} from "./spelled-pitch-class";

export class PitchClass {
  integerNotation: number = 0;

  private constructor() {}

  static fromMidiNote(midiNote: MidiNote): PitchClass {
    const pitchClass = new PitchClass();
    pitchClass.integerNotation = posModRes(midiNote.number - 24, 12);
    return pitchClass
  }

  static fromSpelledPitchClass(spelledPitchClass: SpelledPitchClass): PitchClass {
    const pitchClass = new PitchClass();
    let integerNotation = PitchClass.noteLetterToIntegerPitchClassMap[spelledPitchClass.noteLetter];
    integerNotation += PitchClass.accidentalOffset[spelledPitchClass.accidental];
    pitchClass.integerNotation = integerNotation;
    return pitchClass
  }

  private static noteLetterToIntegerPitchClassMap = {
    [NoteLetters.C]: 0,
    [NoteLetters.D]: 2,
    [NoteLetters.E]: 4,
    [NoteLetters.F]: 5,
    [NoteLetters.G]: 7,
    [NoteLetters.A]: 9,
    [NoteLetters.B]: 11
  };

  private static accidentalOffset = {
    [Accidentals.DoubleFlat]: -2,
    [Accidentals.Flat]: -1,
    [Accidentals.Natural]: 0,
    [Accidentals.Sharp]: 1,
    [Accidentals.DoubleSharp]: 2
  };

}
