export interface ExerciseBeat {
  // how is this beat defined relative the current key during this exercise
  // try to define with narrative, so it can be displayed with narrative
  // the bigger the context of the narrative the better:
    // intervals from exercise key center - small context
    // chord qualities relative to key center - med context
    // functional harmonies/progressions - lots of context
  chordRomanNumeral: string;
  chordType: string;
  chordVoicing: string[];
}
