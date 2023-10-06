import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ExerciseService} from "../exercise.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Exercise} from "../models/api/exercise";
import {shuffleAlgo} from "../utilities/math-utilities";
import {WebsocketService} from "../websocket.service";
import {PitchClass} from "../models/pitch-class";
import {SpelledPitchClass} from "../models/spelled-pitch-class";
import {Accidentals} from "../models/notation";
import {Subscription} from "rxjs";
import {ActiveNotesService} from "../active-notes.service";
import {Midi, Note} from "tonal";

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss']
})
export class ExerciseComponent implements OnInit, OnDestroy{
  private _exercise: Exercise | undefined;
  private subscriptions: Subscription[] = [];
  iterationIndex: number = 0;
  chordIndex: number = 0
  complete: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private activeNotesService: ActiveNotesService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id.length) {
        this.exerciseService.get(id).subscribe(exercise => {
          if (exercise) {
            this._exercise = exercise;
            this.shuffle();
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
      console.log('exercise: :', this.exercise);
      const iteration = this.exercise.iterations[this.iterationIndex];
      const iterationPitchClass = PitchClass.fromSpelledPitchClass(new SpelledPitchClass(
        iteration.noteLetter,
        iteration.accidental));

      const chord = this.exercise.sequence[this.chordIndex];
      console.log('chord: ', chord);
      const chordPitchClasses = chord.map(member => {
        return new PitchClass(iterationPitchClass.integerNotation + member);
      });
      console.log('chordPitchClasses: ', chordPitchClasses);
      console.log('activeNotes: ', activeNotes)
      console.log('activeNotesChromas: ', activeNotes.map(an => Note.get(Midi.midiToNoteName(an)).chroma))

      let chordWasPlayed = true;
      if (activeNotes.length === chordPitchClasses.length){
        for (let i = 0; i < chordPitchClasses.length; i++) {
          if (chordPitchClasses[i].integerNotation !== Note.get(Midi.midiToNoteName(activeNotes[i])).chroma) {
            console.log('chord was not played')
            chordWasPlayed = false;
            break;
          }
        }
      }
      else {
        chordWasPlayed = false;
        console.log('chord was not played')
      }

      if (chordWasPlayed) {
        console.log('chord was played')
        this.chordIndex++;
        if (this.chordIndex >= this.exercise.sequence.length) {
          this.chordIndex = 0;
          this.iterationIndex++;
          if (this.iterationIndex >= this.exercise.iterations.length){
            this.iterationIndex = 0;
            this.complete = true;
          }
        }
      }

      // for some reason change detection not getting triggered automatically
      this.ref.markForCheck();
      this.ref.detectChanges();
    }));

    console.log(this.exercise);
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  get exercise(): Exercise {
    if (!this._exercise) {
      throw new Error();
    }
    return this._exercise;
  }

  get prettyIteration(): string {
    const iteration = this.exercise.iterations[this.iterationIndex];
    return `${iteration.noteLetter}${iteration.accidental}`
      .replace(Accidentals.Natural, ' ');
  }

  shuffle(): void {
    this.exercise.iterations.sort(shuffleAlgo);
    this.exercise.iterations = this.exercise.iterations.filter(itr => itr.enabled);
    console.log(this.exercise.iterations
        .map(itr => `${itr.noteLetter}${itr.accidental}`)
        .join(' '));
  }
}
