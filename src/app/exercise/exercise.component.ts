import {Component, OnInit} from '@angular/core';
import {ExerciseService} from "../exercise.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Exercise} from "../models/api/exercise";
import {shuffleAlgo} from "../utilities/math-utilities";
import {WebsocketService} from "../websocket.service";
import {PitchClass} from "../models/pitch-class";
import {SpelledPitchClass} from "../models/spelled-pitch-class";
import {Accidentals} from "../models/notation";

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss']
})
export class ExerciseComponent implements OnInit{
  private _exercise: Exercise | undefined;
  private iterationIndex: number = 0;
  complete: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private websocketService: WebsocketService
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

    this.websocketService.pianoKeysChangesSubject.subscribe(pianoKeys => {
      console.log(pianoKeys)
      const iteration = this.exercise.iterations[this.iterationIndex];
      const spelledPitchClass = new SpelledPitchClass(
        iteration.noteLetter,
        iteration.accidental);
      const targetPitchClass = PitchClass.fromSpelledPitchClass(spelledPitchClass);
      console.log(targetPitchClass.integerNotation);

      const iterationNoteWasPlayed = pianoKeys.some(pk => {
        return pk.pitchClass.integerNotation === targetPitchClass.integerNotation;
      });

      if (iterationNoteWasPlayed) {
        if (this.iterationIndex + 1 === this.exercise.iterations.length) {
          this.complete = true;
        }
        else {
          this.iterationIndex++;
        }
      }
    });
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
