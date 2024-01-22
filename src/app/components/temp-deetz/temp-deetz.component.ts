import { Component } from '@angular/core';
import {ExerciseDeetz} from "../../helpers/exercise-engine/exercise-deetz";
import {tempData} from "./temp-data";

@Component({
  selector: 'app-temp-deetz',
  templateUrl: './temp-deetz.component.html',
  styleUrl: './temp-deetz.component.scss'
})
export class TempDeetzComponent {
  public exerciseDeetz: ExerciseDeetz;

  constructor() {
    this.exerciseDeetz = tempData;
  }
}
