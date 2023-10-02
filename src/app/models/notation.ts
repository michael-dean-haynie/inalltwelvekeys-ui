export const NoteLetters = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
  G: 'G'
} as const;
export type NoteLetter = keyof typeof NoteLetters;

export const Accidentals = {
  DoubleFlat: '𝄫',
  Flat: '♭',
  Natural: '♮',
  Sharp: '♯',
  DoubleSharp: '𝄪'
} as const;
export type AccidentalKeys = keyof typeof Accidentals;
export type Accidental = typeof Accidentals[AccidentalKeys];

