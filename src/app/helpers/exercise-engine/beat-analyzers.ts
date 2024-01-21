import {ExerciseBeat} from "../../models/api/exercise-beat";
import {Note, Progression} from "tonal";

export function getChordRoot(key: string, beat: ExerciseBeat): string {
  return Progression.fromRomanNumerals(key, [beat.chordRomanNumeral])[0];
}

export function getBassOfBeatVoicing(key: string, beat: ExerciseBeat): string {
  const chordRoot = getChordRoot(key, beat);
  return Note.transpose(chordRoot, beat.chordVoicing[0]);
}

export function beatVoicingChromasIncludeNoteChroma(key: string, beat: ExerciseBeat, noteNumber: number): boolean {
  const chordRoot = getChordRoot(key, beat);

  const voicingChromas = beat.chordVoicing
    .map(voiceInterval => Note.transpose(chordRoot, voiceInterval))
    .map(noteName => Note.get(noteName).chroma);

  return voicingChromas.includes(Note.get(Note.fromMidi(noteNumber)).chroma);
}

export function notesSatisfyBeat(key: string, beat: ExerciseBeat, notes: number[]): boolean {
  // fail if there are any "wrong" notes
  if (notes.some(note => !beatVoicingChromasIncludeNoteChroma(key, beat, note))){
    return false;
  }

  const bassNote = getBassOfBeatVoicing(key, beat);
  const nonBassMemberIntervals = beat.chordVoicing.slice(1);
  const bassInterval = beat.chordVoicing[0];

  let allChecked = false;
  const matchesRequired = 2;
  // const matchesRequired = 1;
  let matchesFound = 0;

  let remainingNotes = [...notes];
  while(matchesFound < matchesRequired && !allChecked) {
    const notesThatMatchBassNote = remainingNotes
      .map(Note.fromMidi)
      .map(Note.get)
      .filter(note => note.chroma === Note.get(bassNote).chroma);

    if (!notesThatMatchBassNote.length) {
      allChecked = true;
    }

    for (let i = 0; i < notesThatMatchBassNote.length; i++) {
      const bassNoteMatch = notesThatMatchBassNote[i];
      // handle when voicing only has 1 note
      if (!nonBassMemberIntervals.length) {
        remainingNotes = remainingNotes.filter(note => note !== bassNoteMatch.midi);
        matchesFound++;
        break; // break out of this for ... starting while again
      }

      const rootImmediatelyBelowBass = Note.transpose(
        bassNoteMatch.name,
        `-${bassInterval}`);

      const nonBassMemberNotes = nonBassMemberIntervals
        .map(interval => Note.transpose(rootImmediatelyBelowBass, interval));

      const nonBassMemberMidis = nonBassMemberNotes
        .map(note => Note.get(note).midi || -1);

      const allMembersAreMatched = nonBassMemberMidis
        .every(midi => remainingNotes.includes(midi));

      if (allMembersAreMatched) {
        remainingNotes = remainingNotes.filter(note => note !== bassNoteMatch.midi && !nonBassMemberMidis.includes(note));
        matchesFound++
        break; // break out of this for ... starting while again
      }

      // if this is the last iteration of the for loop, everything has been checked. Break out of the while loop.
      if (i === notesThatMatchBassNote.length - 1){
        allChecked = true;
      }
    }
  }

  return matchesFound >= matchesRequired;
}
