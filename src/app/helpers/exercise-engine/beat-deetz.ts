// the "details" of a particular beat, for an execution of an exercise in a key
export interface BeatDeetz {
  // whether this beat was skipped (not completed)
  skipped: boolean;

  // if this beat was played with any mistakes in which notes were played
  hadNoteMistakes: boolean;

  // the number of ms between the last beat (or prompt) and this beat as executed
  msSinceLastBeat: number;

  // the number of ms between the prompt for this key and this beat as executed
  msSinceKeyPrompt: number;

  // an average velocity (0-1) of all the notes played in this beat's voicing
  velocity: number;
}
