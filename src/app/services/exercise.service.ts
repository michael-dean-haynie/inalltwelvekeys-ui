import { Injectable } from '@angular/core';
import {Exercise} from "../models/api/exercise";
import * as objectHash from 'object-hash';


@Injectable({
  providedIn: 'root'
})
export class ExerciseService {

  constructor() { }

  /**
   * Generates a hash code for an exercise for equality comparisons.
   * Exercises can be saved and searched for, but they will often be generated ad-hoc by the user.
   * This hash allows us tell if 2 exercises are conceptually identical, despite how they were created.
   * @param exercise
   */
  public getHashCode(exercise: Exercise): string {
    // "prune" off properties that aren't intrinsic to the concept of an Exercise
    const { id, hash, name, description, ...prunedExercise } = exercise;

    for (let i = 0; i < prunedExercise.beats.length; i++) {
      // "prune" off properties that aren't intrinsic to the concept of an ExerciseBeat
      const {chordType, ...prunedBeat } = prunedExercise.beats[i];
      prunedExercise.beats[i] = prunedBeat;
    }

    return objectHash(prunedExercise).toString();
  }
}
