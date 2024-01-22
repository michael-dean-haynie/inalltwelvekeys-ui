import {Component, Input, OnInit} from '@angular/core';
import {ExerciseDeetz} from "../../helpers/exercise-engine/exercise-deetz";
import {BeatDeetz} from "../../helpers/exercise-engine/beat-deetz";
import {KeyDeetz} from "../../helpers/exercise-engine/key-deetz";

export type TabName = 'notes' | 'timing' | 'velocity';

@Component({
  selector: 'app-exercise-deetz',
  templateUrl: './exercise-deetz.component.html',
  styleUrl: './exercise-deetz.component.scss'
})
export class ExerciseDeetzComponent implements OnInit {
  @Input({ required: true })
  public exerciseDeetz!: ExerciseDeetz;

  public tab: TabName

  constructor() {
    this.tab = 'notes';
    // this.tab = 'timing';
    // this.tab = 'velocity';
  }

  public ngOnInit(): void {
    console.log(this.exerciseDeetz);
  }

  public activateTab(tabName: TabName) {
    this.tab = tabName;
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

  public getPercentCorrectForKey(keyDeetz: KeyDeetz): number {
    const correctBeats = keyDeetz.beatDeetz
      .map(bd => bd.hadNoteMistakes ? 0 as number : 1 as number)
      .reduce((pv, cv, ci, ar) => pv + cv, 0);
    return Math.floor((correctBeats / keyDeetz.beatDeetz.length) * 100);
  }

  public getPercentCorrectForAllKeys(): number {
    const noOfBeats = this.exerciseDeetz.keyDeetz.flatMap(kd => kd.beatDeetz).length;

    const correctBeats = this.exerciseDeetz.keyDeetz
      .flatMap(kd => kd.beatDeetz)
      .map(bd => bd.hadNoteMistakes ? 0 as number : 1 as number)
      .reduce((pv, cv, ci, ar) => pv + cv, 0);
    return Math.floor((correctBeats / noOfBeats) * 100);
  }

  public getAvgTempoVarForKey(keyDeetz: KeyDeetz, floor = true): number {
    const beatDeetz = keyDeetz.beatDeetz.slice(1); // skip first cause of prompt delay

    const avgTempoMs = beatDeetz
      .map(bd => bd.msSinceLastBeat)
      .reduce((pv, cv, ci, ar) => pv + cv, 0) / beatDeetz.length;

    const variationsFromAvgTempo = beatDeetz
      .map(bd => Math.abs(bd.msSinceLastBeat - avgTempoMs));

    const result =  variationsFromAvgTempo
      .reduce((pv, cv, ci, ar) => pv + cv, 0) / variationsFromAvgTempo.length;

    if (floor) {
      return Math.floor(result);
    }
    else {
      return result;
    }
  }

  public getAvgTempoVarForAllKeys(): number {
    const result = this.exerciseDeetz.keyDeetz
      .map(kd => this.getAvgTempoVarForKey(kd, false))
      .reduce((pv, cv, ci, ar) => pv + cv, 0) / this.exerciseDeetz.keyDeetz.length;

    return Math.floor(result);
  }

  public getDurationForKey(keyDeetz: KeyDeetz, inMs = false): number {
    // skip first cause of prompt delay
    const result = keyDeetz.beatDeetz[keyDeetz.beatDeetz.length - 1].msSinceKeyPrompt - keyDeetz.beatDeetz[0].msSinceKeyPrompt
    if (inMs) {
      return result;
    }
    else {
      return Math.floor(result / 10) / 100; // floor to 2 decimal places
    }
  }

  public getAvgDurationForAllKeys(): number {
    const result = this.exerciseDeetz.keyDeetz
      .map(kd => this.getDurationForKey(kd, true))
      .reduce((pv, cv, ci, ar) => pv + cv, 0) / this.exerciseDeetz.keyDeetz.length

    return Math.floor(result / 10) / 100; // floor to 2 decimal places
  }

  public getDelayAfterPromptForKey(keyDeetz: KeyDeetz, inMs = false): number {
    const result = keyDeetz.beatDeetz[0].msSinceKeyPrompt
    if (inMs) {
      return result;
    }
    else {
      return Math.floor(result / 10) / 100; // floor to 2 decimal places
    }
  }

  public getAvgDelayAfterPromptForAllKeys(): number {
    const result = this.exerciseDeetz.keyDeetz
      .map(kd => this.getDelayAfterPromptForKey(kd, true))
      .reduce((pv, cv, ci, ar) => pv + cv, 0) / this.exerciseDeetz.keyDeetz.length

    return Math.floor(result / 10) / 100; // floor to 2 decimal places
  }

  public getVelocityAsPercentage(velocity: number, floor = true): number {
    const result = velocity * 100;
    if (floor) {
      return Math.floor(result); // floor to whole percentage
    }
    else {
      return result;
    }
  }

  public getAvgVelocityVarForKey(keyDeetz: KeyDeetz, floor = true): number {
    const avgVelocity = keyDeetz.beatDeetz
      .map(bd => this.getVelocityAsPercentage(bd.velocity, false))
      .reduce((pv, cv, ci, ar) => pv + cv, 0) / keyDeetz.beatDeetz.length;

    const variationsFromAvgVelocity = keyDeetz.beatDeetz
      .map(bd => Math.abs(this.getVelocityAsPercentage(bd.velocity, false) - avgVelocity));

    const result = variationsFromAvgVelocity
      .reduce((pv, cv, ci, ar) => pv + cv, 0) / variationsFromAvgVelocity.length;

    console.log({avgVelocity, variationsFromAvgVelocity, result});
    if (floor) {
      return Math.floor(result * 100) / 100; // floor to 2 decimal places of whole percent value (e.g. 4.28 %)
    }
    else {
      return result
    }
  }

  public getAvgVelocityVarForAllKeys(): number {
    const result = this.exerciseDeetz.keyDeetz
      .map(kd => this.getAvgVelocityVarForKey(kd, false))
      .reduce((pv, cv, ci, ar) => pv + cv, 0) / this.exerciseDeetz.keyDeetz.length

    return Math.floor(result * 100) / 100; // floor to 2 decimal places of whole percent value (e.g. 4.28 %)
  }
}
