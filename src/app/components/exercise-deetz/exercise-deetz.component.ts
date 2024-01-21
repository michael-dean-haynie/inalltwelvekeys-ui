import {Component, Input, OnInit} from '@angular/core';
import {ExerciseDeetz} from "../../helpers/exercise-engine/exercise-deetz";
import {BeatDeetz} from "../../helpers/exercise-engine/beat-deetz";

@Component({
  selector: 'app-exercise-deetz',
  templateUrl: './exercise-deetz.component.html',
  styleUrl: './exercise-deetz.component.scss'
})
export class ExerciseDeetzComponent implements OnInit {
  @Input({ required: true })
  public exerciseDeetz!: ExerciseDeetz;

  constructor() {}

  public ngOnInit(): void {
    console.log(this.exerciseDeetz.keyDeetz);
  }

  public getBeatHeaderText(beatIndex: number): string {
    return this.exerciseDeetz.exercise.beats[beatIndex].chordRomanNumeral;
  }

  public getBeatDeetzDisplayText(beatDeetz: BeatDeetz): string {
    if (beatDeetz.skipped) {
      return 'S';
    }
    else {
      return beatDeetz.hadNoteMistakes ? 'M' : 'P';
    }
  }

  public getBeatDeetzDataClass(beatDeetz: BeatDeetz): string {
    if (beatDeetz.skipped) {
      return 'skipped-beat';
    }
    else {
      return beatDeetz.hadNoteMistakes ? 'mistake-beat' : 'success-beat';
    }
  }
}
