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
  iterationIndex: number = 0;
  chordIndex: number = 0
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

      // sort piano keys by ascending midi value
      pianoKeys.sort((a, b) => {
        return a.midiNote.number - b.midiNote.number;
      });
      console.log('pianoKeys: ', pianoKeys);

      let chordWasPlayed = true;
      if (pianoKeys.length === chordPitchClasses.length){
        for (let i = 0; i < chordPitchClasses.length; i++) {
          if (chordPitchClasses[i].integerNotation !== pianoKeys[i].pitchClass.integerNotation) {
            chordWasPlayed = false;
            break;
          }
        }
      }
      else {
        chordWasPlayed = false;
      }

      if (chordWasPlayed) {
        this.chordIndex++;
        if (this.chordIndex >= this.exercise.sequence.length) {
          this.chordIndex = 0;
          this.iterationIndex++;
          if (this.iterationIndex >= this.exercise.iterations.length){
            this.complete = true;
          }
        }
      }

    });

    console.log(this.exercise);
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
