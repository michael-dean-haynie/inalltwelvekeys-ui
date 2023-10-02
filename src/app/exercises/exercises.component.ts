import {Component, OnInit} from '@angular/core';
import {ExerciseService} from "../exercise.service";
import {Exercise} from "../models/api/exercise";

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss']
})
export class ExercisesComponent implements OnInit{
  exercises: Exercise[] = []

  constructor(private exerciseService: ExerciseService) {}

  ngOnInit(): void {
    this.exerciseService.list().subscribe(result => {
      this.exercises = result;
    })
  }


}
