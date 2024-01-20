import {Exercise} from "../../models/api/exercise";
import {Message} from "webmidi3";
import {Note, Progression} from "tonal";
import {ExerciseBeat} from "../../models/api/exercise-beat";
import {ExerciseEventType} from "../../models/api/exercise-event";

export abstract class ExerciseEngine {

  // a callback that will be executed when the exercise has completed
  public onComplete: () => void;

  // index marking the current key being exercised
  private _keyIndex: number;

  // index marking the current beat being exercised
  private _beatIndex: number;

  // ms since the exercise was started
  private msSinceStartOfExercise: number;

  // a set of midi note numbers representing the currently pressed keys
  private readonly activeNotes: Set<number>;

  // a set of midi note numbers representing notes that were played before this beat began
  // they must be released before they can apply to this beat
  private readonly expiredNotes: Set<number>;

  // all active notes that are not expired notes
  private readonly freshNotes: Set<number>;

  protected constructor(
    protected readonly exercise: Exercise,
    protected readonly keySequence: string[]
  ) {
    this._keyIndex = 0;
    this._beatIndex = 0;

    this.msSinceStartOfExercise = 0;

    this.activeNotes = new Set<number>();
    this.expiredNotes = new Set<number>();
    this.freshNotes = new Set<number>();

    this.onComplete = () => {}; // nothing by default;
  }

  public get keyIndex(): number {
    return this._keyIndex;
  }

  public get beatIndex(): number {
    return this._beatIndex;
  }

  protected processMessage(message: Message, msOffset: number): void {
    this.msSinceStartOfExercise = msOffset;
    this.updateNoteSets(message);
    this.checkNotesAgainstCurrentBeat();
  }

  protected processEvent(eventType: ExerciseEventType, msOffset: number): void {
    this.msSinceStartOfExercise = msOffset;
    if (eventType === 'user selected previous key') {
      this.regressToPreviousKey();
    }
    else if (eventType === 'user selected next key') {
      this.progressToNextKey();
    }
  }

  private complete(): void {
    this.onComplete();
  }

  private get currentKey(): string {
    return this.keySequence[this._keyIndex];
  }

  private get currentBeat(): ExerciseBeat {
    return this.exercise.beats[this._beatIndex];
  }

  private checkNotesAgainstCurrentBeat(): void {
    let notesMatchCurrentBeat = false;

    // get the chord root for the current beat (in the current key)
    const chordRoot = Progression.fromRomanNumerals(this.currentKey, [this.currentBeat.chordRomanNumeral])[0];

    // get the bass note defined in the current beat's chord voicing
    const voicingBassNote = Note.transpose(chordRoot, this.currentBeat.chordVoicing[0]);

    // get all played/fresh notes that could be the bass
    const notesThatMatchBassNote = [...this.freshNotes]
      .map(Note.fromMidi)
      .map(Note.get)
      .filter(note => note.chroma === Note.get(voicingBassNote).chroma);

    // check if there are any bass note matches that also have the rest of the chord voicing members at correct intervals
    if (notesThatMatchBassNote.length) {
      notesMatchCurrentBeat = notesThatMatchBassNote.some(bassNoteMatch => {
        const nonBassMemberIntervals = this.currentBeat.chordVoicing.slice(1);

        if (!nonBassMemberIntervals.length) {
          return true; // bass note was the only chord member
        }

        const bassInterval = this.currentBeat.chordVoicing[0];

        const rootImmediatelyBelowBass = Note.transpose(
          bassNoteMatch.name,
          `-${bassInterval}`);

        const nonBassMemberNotes = nonBassMemberIntervals
          .map(interval => Note.transpose(rootImmediatelyBelowBass, interval));

        const nonBassMemberMidis = nonBassMemberNotes
          .map(note => Note.get(note).midi || -1);

        return nonBassMemberMidis
          .every(midi => [...this.freshNotes].includes(midi));
      });
    }

    if (notesMatchCurrentBeat) {
      this.progressToNextBeat();
    }
  }

  private progressToNextBeat(): void {
    this.expireActiveNotes();
    this._beatIndex++;

    if (this._beatIndex >= this.exercise.beats.length) {
      this._beatIndex = 0;
      this._keyIndex++;

      if (this._keyIndex >= this.keySequence.length) {
        this._keyIndex = 0;
        this.complete();
      }
    }
  }

  private progressToNextKey(): void {
    const initialKeyIndex = this._keyIndex
    while(this._keyIndex === initialKeyIndex) {
      this.progressToNextBeat();
    }
  }

  private regressToPreviousBeat(): void {
    this.expireActiveNotes();
    this._beatIndex--;

    if (this._beatIndex < 0) {
      this._beatIndex = this.exercise.beats.length - 1;
      this._keyIndex--;

      if (this._keyIndex < 0) {
        this._keyIndex = 0;
        this._beatIndex = 0;
      }
    }
  }

  private regressToPreviousKey(): void {
    if (this._keyIndex > 0){
      const initialKeyIndex = this._keyIndex
      while(this._keyIndex === initialKeyIndex) {
        this.regressToPreviousBeat();
      }
      this._beatIndex = 0;
    }
  }

  private updateNoteSets(message: Message): void {
    if (['noteon', 'noteoff'].includes(message.type)) {
      const noteNumber = this.getMidiNoteNumber(message);

      if (message.type === 'noteon') {
        this.activeNotes.add(noteNumber);
      }
      else if (message.type === 'noteoff') {
        this.expiredNotes.delete(noteNumber);
        this.activeNotes.delete(noteNumber);
      }

      // update freshNotes
      this.freshNotes.clear();
      for (let noteNumber of this.activeNotes) {
        if (!this.expiredNotes.has(noteNumber)){
          this.freshNotes.add(noteNumber);
        }
      }
    }
  }

  private expireActiveNotes(): void {
    for (let noteNumber of this.activeNotes) {
      this.expiredNotes.add(noteNumber);
    }
  }

  private getMidiNoteNumber(message: Message): number {
    return message.data[1]; // second of 3 bytes has midi number
  }
}

/**
 * What are the inputs and outputs for this?
 *
 * -------------------------------------------------------
 * INPUTS:
 * The real-time engine will be initialized with:
 *  - the exercise
 *  - the key sequence
 *
 *  ... and then in real time it will receive
 *  - midi inputs from the user
 *  - forward/backward commands from the user
 *
 *  The simulating engine will be initialized with:
 *  - the exercise
 *  - the key sequence
 *  - the recorded midi events from the user
 *  - the recorded forward/backward commands from the user
 *
 *
 * -------------------------------------------------------
 *  OUTPUTS:
 *  The real-time engine needs to drive the ui in real time:
 *  - show progress for the beats sequence and the keys sequence
 *  - show the next prompt when needed
 *  - make available all the breakdown/analytics data
 *
 *  The simulated engine just needs to execute and return the data
 *
 *  -------------------------------------------------
 *  Plan:
 *  I think I'll use inheritance for this.
 *  The realtime and simulated engines will extend the abstract engine.
 *  The abstract engine will do all the state-crunching in a temporally agnostic way
 *    - The realtime engine would feed the protected abstract methods realtime timestamps/offsets
 *    - The simulated engine would feed the same methods the recorded timestamps/offsets
 *
 *  The base class will be like a state machine that the derived classes can drive and interrogate however they need.
 */
