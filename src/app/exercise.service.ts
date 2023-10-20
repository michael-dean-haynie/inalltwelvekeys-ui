import { Injectable } from '@angular/core';
import {Exercise} from "./models/api/exercise";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import { v4 as uuidv4 } from "uuid";
import {Accidentals, NoteLetters} from "./models/notation";
import {Interval, RomanNumeral, ScaleType} from "tonal";

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
      id: 'fd7259d3-ec4e-4db6-9bc0-4888b51b3fad',
      name: 'Keys Only',
      description: 'No beats, just the key',
      beats: []
    });

    this.exercises.push({
      id: 'fd7259d3-ec4e-4db6-9bc0-47cab51b3fad',
      name: 'Single Notes',
      description: '',
      beats: [
        {
          chordRomanNumeral: 'I',
          chordVoicing: ['1P']
        }
      ]
    });

    this.exercises.push({
      id: 'fd7259d3-ec4e-4db6-9bc0-47cab51b888d',
      name: 'Major Scale',
      description: '(descending then ascending)',
      beats: [
          '8P', // start an 8ve above
          ...[...ScaleType.get('major').intervals].reverse(), // descending (shallow copy, reversed)
          ...ScaleType.get('major').intervals.slice(1), // ascending (not repeating tonic)
          '8P', // end an 8ve above
        ]
        .map(intervalLit => Interval.get(intervalLit))
        .map(interval => RomanNumeral.get(interval))
        .map(romanNumeral => ({
          chordRomanNumeral: romanNumeral.name,
          chordVoicing: ['1P']
        }))
    });

    this.exercises.push({
      id: 'fd7333d3-ec4e-4db6-9bc0-47cab51b888d',
      name: 'Altered Scale',
      description: '(descending then ascending)',
      beats: [
        '8P', // start an 8ve above
        ...[...ScaleType.get('altered').intervals].reverse(), // descending (shallow copy, reversed)
        ...ScaleType.get('altered').intervals.slice(1), // ascending (not repeating tonic)
        '8P', // end an 8ve above
      ]
        .map(intervalLit => Interval.get(intervalLit))
        .map(interval => RomanNumeral.get(interval))
        .map(romanNumeral => ({
          chordRomanNumeral: romanNumeral.name,
          chordVoicing: ['1P']
        }))
    });

    this.exercises.push({
      id: 'fd7259d3-ec4e-4da6-9bc0-47cab51b3fad',
      name: 'Major II-V-I (open)',
      description: 'Major II-V-I progressions, rootless voicing, (open)',
      beats: [
        {
          chordRomanNumeral: 'II',
          chordType: 'min9',
          chordVoicing: ['3m', '5P', '7m', '9M']
        },
        {
          chordRomanNumeral: 'V',
          chordType: '13',
          chordVoicing: ['7m', '9M', '10M', '13M']
        },
        {
          chordRomanNumeral: 'I',
          chordType: 'maj9',
          chordVoicing: ['3M', '5P', '7M', '9M']
        },
      ]
    });

    this.exercises.push({
      id: 'fd7259f3-ec4e-4da6-9bc0-47cab51b3fad',
      name: 'Major II-V-I (closed)',
      description: 'Major II-V-I progressions, rootless voicing, (closed)',
      beats: [
        {
          chordRomanNumeral: 'II',
          chordType: 'min9',
          chordVoicing: ['7m', '9M', '10m', '12P']
        },
        {
          chordRomanNumeral: 'V',
          chordType: '13',
          chordVoicing: ['3M', '6M', '7m', '9M']
        },
        {
          chordRomanNumeral: 'I',
          chordType: 'maj9',
          chordVoicing: ['7M', '9M', '10M', '12P']
        },
      ]
    });
  }
}
