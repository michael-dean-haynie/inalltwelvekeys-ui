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
      iterations: this.iterations.controls.map(iteration => {
        return {
          noteLetter: iteration.get('noteLetter')?.value,
          accidental: iteration.get('accidental')?.value,
          enabled: iteration.get('enabled')?.value,
        }
      }),
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

  get iterations(): FormArray {
    return this.exerciseForm.get('iterations') as FormArray;
  }

  private loadFormWithExercise(exercise: Exercise): void {
    this.exerciseForm = this.fb.group({
      id: [exercise.id],
      name: [exercise.name],
      description: [exercise.description],
      iterations: this.fb.array(exercise.iterations.map(iteration => this.fb.group({
        noteLetter: [iteration.noteLetter],
        accidental: [iteration.accidental],
        enabled: [iteration.enabled]
      })))
    });
    console.log(this.exerciseForm);
  }

  private generateNewExercise(): Exercise {
    return {
      id: 'f1c2a3b1-5792-4527-b062-66fcca100881',
      // id: uuidv4(),
      name: 'New Exercise Name',
      description: 'New Exercise Description',
      iterations: Object.values(NoteLetters).flatMap(letter => {
        return Object.values(Accidentals).map(accidental => {
          return {
            noteLetter: letter,
            accidental: accidental,
            enabled: [Accidentals.Flat, Accidentals.Natural, Accidentals.Sharp].some(acc => acc === accidental)
          }
        })
      })
    }
  }
}
