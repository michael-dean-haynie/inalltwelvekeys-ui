import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ExerciseService} from "../exercise.service";
import {Exercise} from "../models/api/exercise";
import {Accidentals, NoteLetters} from "../models/notation";
import { v4 as uuidv4 } from "uuid";

@Component({
  selector: 'app-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.scss']
})
export class ExerciseEditComponent implements OnInit{
  name = new FormControl('');
  modeIsCreate = false;
  modeIsUpdate = false;
  exerciseForm: FormGroup = this.fb.group({});

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private fb: FormBuilder
  ) {}

  get beats(): FormArray {
    return this.exerciseForm.get('beats') as FormArray;
  }

  getVoicingByBeatIndex(beatIdx: number): FormArray {
    return this.beats.controls[beatIdx].get('chordVoicing') as FormArray;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id.length) {
        this.exerciseService.get(id).subscribe(exercise => {
          if (exercise) {
            this.loadFormWithExercise(exercise);
            this.modeIsUpdate = true;
          }
          else {
            this.router.navigate(['/404'], { skipLocationChange: true});
          }
        });
      }
      else {
        this.loadFormWithExercise(this.generateNewExercise());
        this.modeIsCreate = true;
      }
    });
  }

  onSubmit(): void {
    const exercise: Exercise = {
      id: this.exerciseForm.get('id')?.value,
      name: this.exerciseForm.get('name')?.value,
      description: this.exerciseForm.get('description')?.value,
      beats: this.beats.controls.map(beatCtrl => {
        const beatFG = beatCtrl as FormGroup;
        return {
          chordRomanNumeral: beatFG.get('chordRomanNumeral')?.value,
          chordType: beatFG.get('chordType')?.value,
          chordVoicing: (beatFG.get('chordVoicing') as FormArray).controls.map(intervalCtrl => {
            return intervalCtrl.value
          }),
        };
      })
      // iterations: this.iterations.controls.map(iteration => {
      //   return {
      //     noteLetter: iteration.get('noteLetter')?.value,
      //     accidental: iteration.get('accidental')?.value,
      //     enabled: iteration.get('enabled')?.value,
      //   };
      // }),
      // sequence: this.sequence.controls.map(chord => {
      //   return (chord as FormArray).controls.map(member => parseInt(member.value));
      // })
    }

    if (this.modeIsCreate) {
      this.exerciseService.create(exercise).subscribe(_ => {
        this.router.navigate(['/exercises']);
      });
    }
    else {
      this.exerciseService.update(exercise).subscribe(_ => {
        this.router.navigate(['/exercises']);
      });
    }
  }

  // get iterations(): FormArray {
  //   return this.exerciseForm.get('iterations') as FormArray;
  // }
  //
  // get sequence(): FormArray {
  //   return this.exerciseForm.get('sequence') as FormArray;
  // }

  // getChord(index: number): FormArray {
  //   return this.sequence.controls[index] as FormArray;
  // }

  // addChord(): void {
  //   this.sequence.push(this.fb.array([0]));
  // }
  //
  // deleteChord(index: number): void {
  //   this.sequence.removeAt(index);
  // }
  //
  // addMemberToChord(index: number): void {
  //   this.getChord(index).push(this.fb.control(0))
  // }

  private loadFormWithExercise(exercise: Exercise): void {
    this.exerciseForm = this.fb.group({
      id: [exercise.id],
      name: [exercise.name],
      description: [exercise.description],
      beats: this.fb.array(exercise.beats.map(beat => this.fb.group({
        chordRomanNumeral: [beat.chordRomanNumeral],
        chordType: [beat.chordType],
        chordVoicing: this.fb.array(beat.chordVoicing)
      })))
    });
    // this.exerciseForm = this.fb.group({
    //   id: [exercise.id],
    //   name: [exercise.name],
    //   description: [exercise.description],
    //   iterations: this.fb.array(exercise.iterations.map(iteration => this.fb.group({
    //     noteLetter: [iteration.noteLetter],
    //     accidental: [iteration.accidental],
    //     enabled: [iteration.enabled]
    //   }))),
    //   sequence: this.fb.array(exercise.sequence.map(chord => this.fb.array(chord)))
    // });
  }

  private generateNewExercise(): Exercise {
    return {
      id: uuidv4(),
      name: 'New Exercise Name',
      description: 'New Exercise Description',
      beats: [
        {
          chordRomanNumeral: 'II',
          chordType: 'm9',
          chordVoicing: ['3m', '5P', '7m', '9M']
        }
      ]
    }
    // return {
    //   id: uuidv4(),
    //   name: 'New Exercise Name',
    //   description: 'New Exercise Description',
    //   iterations: Object.values(NoteLetters).flatMap(letter => {
    //     return Object.values(Accidentals).map(accidental => {
    //       return {
    //         noteLetter: letter,
    //         accidental: accidental,
    //         enabled: [Accidentals.Flat, Accidentals.Natural, Accidentals.Sharp].some(acc => acc === accidental)
    //       }
    //     })
    //   }),
    //   sequence: [[0]]
    // }
  }
}
