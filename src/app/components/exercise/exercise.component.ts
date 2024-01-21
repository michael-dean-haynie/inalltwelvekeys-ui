import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ExerciseClientService} from "../../services/clients/exercise-client.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Exercise} from "../../models/api/exercise";
import {shuffleAlgo} from "../../utilities/math-utilities";
import {Subscription} from "rxjs";
import {ActiveNotesService} from "../../services/active-notes.service";
import {Note} from "tonal";
import {ExerciseBeat} from "../../models/api/exercise-beat";
import {MidiMessageService} from "../../services/midi-message.service";
import {RealTimeExerciseEngine} from "../../helpers/exercise-engine/real-time-exercise-engine";
import {ExerciseDeetz} from "../../helpers/exercise-engine/exercise-deetz";

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss']
})
export class ExerciseComponent implements OnInit, OnDestroy{
  public complete: boolean;

  private keys: string[];
  private readonly subscriptions: Subscription[];

  private _exercise: Exercise | undefined;
  private _engine?: RealTimeExerciseEngine;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseClientService,
    private activeNotesService: ActiveNotesService,
    private midiMessageService: MidiMessageService,
    private ref: ChangeDetectorRef
  ) {
    this.complete = false;
    this.keys = this.getShuffledKeys();
    this.subscriptions = [];
  }

  public get exercise(): Exercise {
    if (!this._exercise) {
      throw new Error();
    }
    return this._exercise;
  }

  public get currentKey(): string {
    return this.keys[this.keyIndex];
  }

  public get currentBeat(): ExerciseBeat {
    return this.exercise.beats[this.beatIndex];
  }

  public get exerciseDeetz(): ExerciseDeetz {
    return this.engine.exerciseDeetz;
  }

  public get currentKeyProgressWidth(): string {
    const percentage = Math.floor((this.beatIndex / this.exercise.beats.length) * 100);
    return `${percentage}%`;
  }

  public get exerciseProgressWidth(): string {
    const percentage = Math.floor((this.keyIndex / this.keys.length) * 100);
    return `${percentage}%`;
  }

  private get engine(): RealTimeExerciseEngine {
    if (!this._engine) {
      throw new Error();
    }
    return this._engine;
  }

  private get keyIndex(): number {
    return this.engine.keyIndex;
  }

  private get beatIndex(): number {
    return this.engine.beatIndex;
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

    this.initNewEngine();
    this.subscriptions.push(this.midiMessageService.midiMessageSubject.subscribe(tsMessage => {
      // this.handleActiveNotesChanges(activeNotes);
      this.engine.onMessage(tsMessage);

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

  public formatBeat(beat: ExerciseBeat): string {
    return `${beat.chordRomanNumeral}${beat.chordType || ''} (${beat.chordVoicing.join(' ')})`
  }

  public regressKey(): void {
    this.engine.onEvent('user selected previous key');
  }

  public progressKey(): void {
    this.engine.onEvent('user selected next key');
  }

  public finish(): void {
    while (!this.complete){
      this.progressKey();
    }
  }

  public again(): void {
    this.keys = this.getShuffledKeys();
    this.initNewEngine();
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

  private initNewEngine(): void {
    this._engine = new RealTimeExerciseEngine(this.exercise, this.keys);
    this.engine.onComplete = () => {
      this.complete = true;
    };
  }
}
