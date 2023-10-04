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
      // id: uuidv4(),
      id: 'fd7259d3-ec4e-4da6-9bc0-47cab51b3fad',
      name: 'Single Notes',
      description: '',
      iterations: Object.values(NoteLetters).flatMap(letter => {
        return Object.values(Accidentals).map(accidental => {
          return {
            noteLetter: letter,
            accidental: accidental,
            enabled: [Accidentals.Flat, Accidentals.Natural, Accidentals.Sharp].some(acc => acc === accidental)
          }
        })
      }),
      sequence: [
        [0]
      ]
    });

    this.exercises.push({
      // id: uuidv4(),
      id: 'qr7259d4-ec8e-4d26-9bc0-47cfb51b3fad',
      name: 'Major Triads',
      description: '',
      iterations: Object.values(NoteLetters).flatMap(letter => {
        return Object.values(Accidentals).map(accidental => {
          return {
            noteLetter: letter,
            accidental: accidental,
            enabled: [Accidentals.Flat, Accidentals.Natural, Accidentals.Sharp].some(acc => acc === accidental)
          }
        })
      }),
      sequence: [
        [0, 4, 7]
      ]
    });

    this.exercises.push({
      // id: uuidv4(),
      id: 'asg8x9d4-ec8e-4d26-9bc0-47cfb51b32zz',
      name: 'Major 2-5-1 Progression (One Hand, Closed)',
      description: '',
      iterations: Object.values(NoteLetters).flatMap(letter => {
        return Object.values(Accidentals).map(accidental => {
          return {
            noteLetter: letter,
            accidental: accidental,
            enabled: [Accidentals.Flat, Accidentals.Natural, Accidentals.Sharp].some(acc => acc === accidental)
          }
        })
      }),
      sequence: [
        [0, 4, 5, 9],
        [11, 4, 5, 9],
        [11, 2, 4, 7],
      ]
    });
  }
}
