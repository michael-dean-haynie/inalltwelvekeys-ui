import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ExerciseService} from "../../services/exercise.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Exercise} from "../../models/api/exercise";
import {shuffleAlgo} from "../../utilities/math-utilities";
import {Subscription} from "rxjs";
import {ActiveNotesService} from "../../services/active-notes.service";
import {Note, Progression,} from "tonal";
import {ExerciseBeat} from "../../models/api/exercise-beat";

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss']
})
export class ExerciseComponent implements OnInit, OnDestroy{
  keys: string[] = [];
  keyIndex: number = 0;
  beatIndex: number = 0;
  complete: boolean = false;
  private _exercise: Exercise | undefined;
  private subscriptions: Subscription[] = [];
  // notes (pitch classes) that need to be released before they can match again
  private chromasNeedingRelease: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private activeNotesService: ActiveNotesService,
    private ref: ChangeDetectorRef
  ) {
    this.keys = this.getShuffledKeys();
  }

  get exercise(): Exercise {
    if (!this._exercise) {
      throw new Error();
    }
    return this._exercise;
  }

  get currentKey(): string {
    return this.keys[this.keyIndex];
  }

  get currentBeat(): ExerciseBeat {
    return this.exercise.beats[this.beatIndex];
  }

  get currentKeyProgressWidth(): string {
    const percentage = Math.floor((this.beatIndex / this.exercise.beats.length) * 100);
    return `${percentage}%`;
  }

  get exerciseProgressWidth(): string {
    const percentage = Math.floor((this.keyIndex / this.keys.length) * 100);
    return `${percentage}%`;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id.length) {
        this.exerciseService.get(id).subscribe(exercise => {
          if (exercise) {
            this._exercise = exercise;
          }
          else {
            this.router.navigate(['/404'], { skipLocationChange: true});
          }
        });
      }
      else {
        this.router.navigate(['/404'], { skipLocationChange: true});
      }
    });

    this.subscriptions.push(this.activeNotesService.activeNotesSubject.subscribe(activeNotes => {
      this.handleActiveNotesChanges(activeNotes);

      // for some reason change detection not getting triggered automatically
      this.ref.markForCheck();
      this.ref.detectChanges();
    }));
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  formatBeat(beat: ExerciseBeat): string {
    return `${beat.chordRomanNumeral}${beat.chordType || ''} (${beat.chordVoicing.join(' ')})`
  }

  private handleActiveNotesChanges(activeNotes: number[]) {
    this.chromasNeedingRelease = this.chromasNeedingRelease.filter(chroma => {
      return activeNotes.map(note => Note.get(Note.fromMidi(note)).chroma)
        .includes(chroma);
    });
    // only continue with active notes that do not need release
    activeNotes = activeNotes.filter(note => {
      const activeNoteChroma = Note.get(Note.fromMidi(note)).chroma;
      if (activeNoteChroma === undefined) { throw new Error(); }
      return !this.chromasNeedingRelease.includes(activeNoteChroma);
    });

    if (this.exercise.beats.length) {
      let activeNotesMatchCurrentBeat = false;

      // get the chord root for the current beat (in the current key)
      const chordRoot = Progression.fromRomanNumerals(this.currentKey, [this.currentBeat.chordRomanNumeral])[0];
      const voicingBassNote = Note.transpose(chordRoot, this.currentBeat.chordVoicing[0]);
      const activeNotesThatMatchBassNote = activeNotes
        .map(Note.fromMidi)
        .map(Note.get)
        .filter(activeNote => activeNote.chroma === Note.get(voicingBassNote).chroma);

      // check if there are any bass note matches that also have the rest of the chord voicing members at correct intervals
      if (activeNotesThatMatchBassNote.length) {
        activeNotesMatchCurrentBeat = activeNotesThatMatchBassNote.some(bassNoteMatch => {
          const nonBassMemberIntervals = this.currentBeat.chordVoicing.slice(1);
          if (!nonBassMemberIntervals.length) {
            return true; // bass note was the only chord member
          }
          const bassInterval = this.currentBeat.chordVoicing[0];
          const rootImmediatelyBelowBass = Note.transpose(
            bassNoteMatch.name,
            `-${bassInterval}`);
          const nonBassMemberNotes = nonBassMemberIntervals.map(interval => Note.transpose(rootImmediatelyBelowBass, interval));
          const nonBassMemberMidis = nonBassMemberNotes
            .map(note => Note.get(note).midi || -1);
          return nonBassMemberMidis
            .every(midi => activeNotes.includes(midi));
        });
      }

      if (activeNotesMatchCurrentBeat) {
        // update notes needing release
        for (let note of activeNotes) {
          const activeNoteChroma = Note.get(Note.fromMidi(note)).chroma;
          if (activeNoteChroma === undefined) { throw new Error(); }
          if (!this.chromasNeedingRelease.includes(activeNoteChroma)) {
            this.chromasNeedingRelease.push(activeNoteChroma);
          }
        }

        this.progress();
      }
    }
  }

  progress(): void {
    this.beatIndex++;

    if (this.beatIndex >= this.exercise.beats.length) {
      this.beatIndex = 0;
      this.keyIndex++;

      if (this.keyIndex >= this.keys.length) {
        this.keyIndex = 0;
        this.complete = true;
      }
    }
  }

  progressKey(): void {
    const initialKeyIndex = this.keyIndex
    while(this.keyIndex === initialKeyIndex) {
      this.progress();
    }
  }

  regress(): void {
    this.beatIndex--;

    if (this.beatIndex < 0) {
      this.beatIndex = this.exercise.beats.length - 1;
      this.keyIndex--;

      if (this.keyIndex < 0) {
        this.keyIndex = 0;
        this.beatIndex = 0;
      }
    }
  }

  regressKey(): void {
    if (this.keyIndex > 0){
      const initialKeyIndex = this.keyIndex
      while(this.keyIndex === initialKeyIndex) {
        this.regress();
      }
      this.beatIndex = 0;
    }
  }

  again(): void {
    this.keys = this.getShuffledKeys();
    this.keyIndex = 0;
    this.beatIndex = 0;
    this.complete = false;

    // for some reason change detection not getting triggered automatically
    this.ref.markForCheck();
    this.ref.detectChanges();
  }

  private getShuffledKeys(): string[] {
    const keys = [...Note.names()].flatMap(noteName => [`${noteName}b`, noteName, `${noteName}#`]);
    do {
      keys.sort(shuffleAlgo);
    } while (this.keysHasNeigboringEnharmonics(keys))
    return keys;
  }

  private keysHasNeigboringEnharmonics(keys: string[]): boolean {
    if (keys.length < 2) {
      return false;
    }

    const chromas = keys.map(keyLit => Note.get(keyLit).chroma);
    for (let i = 1; i < chromas.length; i++) {
      if (chromas[i] === chromas[i-1]){
        // console.log(`detected same chroma (${chromas[i]}) for neighboring keys ${keys[i]} and ${keys[i-1]}`);
        return true;
      }
    }

    return false;
  }
}
