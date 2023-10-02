import { Injectable } from '@angular/core';
import {Exercise} from "./models/api/exercise";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import { v4 as uuidv4 } from "uuid";
import {Accidentals, NoteLetters} from "./models/notation";

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private exercises: Exercise[] = [];

  constructor(private http: HttpClient) {
    this.seed();
  }

  get(id: string): Observable<Exercise | undefined> {
    let exercise = this.exercises.find(ex => ex.id === id);
    if (exercise) {
      exercise = this.cp(exercise) as Exercise;
    }
    return of<Exercise | undefined>(exercise);
  }

  list(): Observable<Exercise[]> {
    return of<Exercise[]>(this.exercises.map(this.cp));
  }

  create(exercise: Exercise): Observable<Exercise> {
    this.exercises.push(exercise);
    return of<Exercise>(exercise);
  }

  update(exercise: Exercise): Observable<Exercise> {
    this.exercises = this.exercises.filter(exc => exc.id !== exercise.id);
    this.exercises.push(exercise);
    return of<Exercise>(exercise);
  }

  delete(exercise: Exercise): Observable<Exercise> {
    this.exercises = this.exercises.filter(exc => exc.id !== exercise.id);
    return of<Exercise>(exercise);
  }

  private cp(src: any): any {
    return JSON.parse(JSON.stringify(src));
  }

  private seed(): void {
    this.exercises.push({
      id: uuidv4(),
      name: 'Exercise 1',
      description: '',
      iterations: Object.values(NoteLetters).flatMap(letter => {
        return Object.values(Accidentals).map(accidental => {
          return {
            noteLetter: letter,
            accidental: accidental,
            enabled: [Accidentals.Flat, Accidentals.Natural, Accidentals.Sharp].some(acc => acc === accidental)
          }
        })
      })
    })
  }
}
