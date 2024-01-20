import {Exercise} from "../../models/api/exercise";
import {Message} from "webmidi3";
import {Note, Progression} from "tonal";
import {ExerciseBeat} from "../../models/api/exercise-beat";
import {ExerciseEventType} from "../../models/api/exercise-event";
import * as ba from "./beat-analyzers";

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

  private analyzeNotes(): void {
    let notesSatisfyBeat = false;

    const wrongNotes = [...this.freshNotes]
      .filter(note => !ba.beatVoicingChromasIncludeNoteChroma(this.currentKey, this.currentBeat, note))

    if (wrongNotes.length) {
      console.log('WRONG NOTES!', wrongNotes.map(note => Note.fromMidi(note)));
    } else {
      notesSatisfyBeat = ba.notesSatisfyBeat(this.currentKey, this.currentBeat, [...this.freshNotes]);
    }

    if (notesSatisfyBeat) {
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
