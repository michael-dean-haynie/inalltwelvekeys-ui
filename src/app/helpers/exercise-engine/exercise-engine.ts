import {Exercise} from "../../models/api/exercise";
import {Message} from "webmidi3";
import {Note, Progression} from "tonal";
import {ExerciseBeat} from "../../models/api/exercise-beat";
import {ExerciseEventType} from "../../models/api/exercise-event";
import * as ba from "./beat-analyzers";
import {ExerciseDeetz} from "./exercise-deetz";
import {BeatDeetz} from "./beat-deetz";
import {KeyDeetz} from "./key-deetz";

export abstract class ExerciseEngine {

  // a callback that will be executed when the exercise has completed
  public onComplete: () => void;

  // the execution details of this exercise
  public exerciseDeetz: ExerciseDeetz;

  // index marking the current key being exercised
  private _keyIndex: number;

  // index marking the current beat being exercised
  private _beatIndex: number;

  // internal flag marking completeness of whole exercise
  private isComplete: boolean;

  // ms since the exercise was started
  private msSinceStartOfExercise: number;

  // flag for current beat if mistakes were made
  private currentBeatHadMistakes: boolean;

  // a set of midi note numbers representing the currently pressed keys
  private readonly activeNotes: Set<number>;

  // a set of midi note numbers representing notes that were played before this beat began
  // they must be released before they can apply to this beat
  private readonly expiredNotes: Set<number>;

  // all active notes that are not expired notes
  private readonly freshNotes: Set<number>;

  // a lookup for additional message details by the midi note number. kept in-sync with this.freshNotes.
  private readonly messagesByNoteNumber: Map<number, Message>;

  protected constructor(
    protected readonly exercise: Exercise,
    protected readonly keySequence: string[]
  ) {
    this._keyIndex = 0;
    this._beatIndex = 0;

    this.isComplete = false;
    this.msSinceStartOfExercise = 0;
    this.currentBeatHadMistakes = false;

    this.activeNotes = new Set<number>();
    this.expiredNotes = new Set<number>();
    this.freshNotes = new Set<number>();
    this.messagesByNoteNumber = new Map<number, Message>();

    this.exerciseDeetz = {
      exercise: this.exercise,
      keyDeetz: []
    }
    this.recordKeyDeetz(); // initialize first key deetz

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

    const previousFreshNoteCount = this.freshNotes.size;
    this.updateNoteSets(message);

    // only need to analyze notes if fresh notes changed
    if (this.freshNotes.size !== previousFreshNoteCount) {
      this.analyzeNotes();
    }
  }

  protected processEvent(eventType: ExerciseEventType, msOffset: number): void {
    this.msSinceStartOfExercise = msOffset;
    if (eventType === 'user selected previous key') {
      this.regressToPreviousKey();
    }
    else if (eventType === 'user selected next key') {
      this.progressToNextKey(true);
    }
  }

  private complete(): void {
    this.isComplete = true;
    this.onComplete();
  }

  private get currentKey(): string {
    return this.keySequence[this._keyIndex];
  }

  private get currentBeat(): ExerciseBeat {
    return this.exercise.beats[this._beatIndex];
  }

  private get currentKeyDeetz(): KeyDeetz {
    const result = this.exerciseDeetz.keyDeetz.find(kd => kd.key === this.currentKey);
    if (result === undefined) {
      throw new Error();
    }
    return result;
  }

  private analyzeNotes(): void {
    let notesSatisfyBeat = false;

    const wrongNotes = [...this.freshNotes]
      .filter(note => !ba.beatVoicingChromasIncludeNoteChroma(this.currentKey, this.currentBeat, note))

    if (wrongNotes.length) {
      this.currentBeatHadMistakes = true;
      console.log('WRONG NOTES!', wrongNotes.map(note => Note.fromMidi(note)));
    } else {
      notesSatisfyBeat = ba.notesSatisfyBeat(this.currentKey, this.currentBeat, [...this.freshNotes]);
    }

    if (notesSatisfyBeat) {
      this.progressToNextBeat();
    }
  }

  private progressToNextBeat(beatWasSkipped = false): void {
    this.recordBeatDeetz(beatWasSkipped); // record beat we are about to move away from

    this.expireActiveNotes();
    this.currentBeatHadMistakes = false;

    this._beatIndex++;

    if (this._beatIndex >= this.exercise.beats.length) {
      this._beatIndex = 0;
      this._keyIndex++;

      if (this._keyIndex >= this.keySequence.length) {
        this._keyIndex--; // stay at the final beat
        this.complete();
      }
      else {
        this.recordKeyDeetz() // start recording this new key
      }
    }
  }

  private progressToNextKey(keyWasSkipped = false): void {
    const initialKeyIndex = this._keyIndex
    while(this._keyIndex === initialKeyIndex && !this.isComplete) {
      this.progressToNextBeat(keyWasSkipped);
    }
  }

  private regressToPreviousBeat(): void {
    this.eraseBeatDeetz(); // erase the record of this current beat

    this.expireActiveNotes();
    this.currentBeatHadMistakes = false;

    this._beatIndex--;
    if (this._beatIndex < 0) {
      this.eraseKeyDeetz() // erase the record of this current key
      this._beatIndex = this.exercise.beats.length - 1;
      this._keyIndex--;

      if (this._keyIndex < 0) {
        this._keyIndex = 0;
        this._beatIndex = 0;
        // restart this key
        this.eraseKeyDeetz()
        this.recordKeyDeetz();
      }
    }
  }

  private regressToPreviousKey(): void {
    if (this._keyIndex > 0){
      const initialKeyIndex = this._keyIndex
      while(this._keyIndex === initialKeyIndex) {
        this.regressToPreviousBeat();
      }
      while(this.beatIndex !== 0) {
        this.regressToPreviousBeat();
      }
    }

    // restart this key
    this.currentBeatHadMistakes = false;
    this.eraseKeyDeetz();
    this.recordKeyDeetz();
  }

  private recordKeyDeetz(): void {
    this.exerciseDeetz.keyDeetz.push({
      key: this.currentKey,
      chronSortId: this.keyIndex,
      msSinceExerciseStart: this.msSinceStartOfExercise,
      beatDeetz: []
    });
  }

  private eraseKeyDeetz(): void {
    this.exerciseDeetz.keyDeetz = this.exerciseDeetz.keyDeetz.filter(kd => kd.key !== this.currentKey);
  }

  private recordBeatDeetz(beatWasSkipped: boolean): void {
    const msSinceKeyPrompt = this.msSinceStartOfExercise - this.currentKeyDeetz.msSinceExerciseStart;
    const msSinceLastBeat = this.beatIndex === 0
      ? msSinceKeyPrompt
      : msSinceKeyPrompt - this.currentKeyDeetz.beatDeetz[this.beatIndex - 1].msSinceKeyPrompt

    const beatDeetz: BeatDeetz = {
      skipped: beatWasSkipped,
      hadNoteMistakes: this.currentBeatHadMistakes,
      msSinceKeyPrompt,
      msSinceLastBeat,
      velocity: this.getAvgVelocityOfRightNotes()
    }
    this.currentKeyDeetz.beatDeetz.push(beatDeetz);
  }

  private eraseBeatDeetz(): void {
    if (this.exerciseDeetz.keyDeetz.find(kd => kd.key === this.currentKey)) {
      this.currentKeyDeetz.beatDeetz.pop();
    }
  }

  private getAvgVelocityOfRightNotes(): number {
    const rightNotes = [...this.freshNotes]
      .filter(note => ba.beatVoicingChromasIncludeNoteChroma(this.currentKey, this.currentBeat, note));

    return rightNotes
      .map(rn => this.messagesByNoteNumber.get(rn))
      .map(msg => (msg?.data[2] || 0) / 127) // lazy undefined check. also note 127 is max velocity for midi
      .reduce((ac, cv, ci, ar) => ac + cv, 0) / rightNotes.length;
  }

  private updateNoteSets(message: Message): void {
    if (['noteon', 'noteoff'].includes(message.type)) {
      const noteNumber = this.getMidiNoteNumber(message);

      if (message.type === 'noteon') {
        this.activeNotes.add(noteNumber);
        this.messagesByNoteNumber.set(noteNumber, message);
      }
      else if (message.type === 'noteoff') {
        this.expiredNotes.delete(noteNumber);
        this.activeNotes.delete(noteNumber);
        this.messagesByNoteNumber.delete(noteNumber);
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
