import { Injectable } from '@angular/core';
import {ScaleGenerator} from "./models/api/scale-generator";
import {deepCopy} from "./utilities/json-utilities";

@Injectable({
  providedIn: 'root'
})
export class ScaleGeneratorService {
  private _scaleGenerator: ScaleGenerator;

  constructor() {
    this._scaleGenerator = {
      scaleType: 'major',
      pattern: 'linear',
      direction: 'ascending then descending',
      octaves: 1
    }
  }

  get scaleGenerator(): ScaleGenerator {
    return deepCopy(this._scaleGenerator);
  }

  set scaleGenerator(theValue: ScaleGenerator) {
    this._scaleGenerator = theValue;
  }
}

