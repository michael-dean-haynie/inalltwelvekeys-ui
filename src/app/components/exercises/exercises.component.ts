import {Component, OnDestroy, OnInit} from '@angular/core';
import {ExerciseClientService} from "../../services/clients/exercise-client.service";
import {Exercise} from "../../models/api/exercise";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss']
})
export class ExercisesComponent implements OnInit, OnDestroy{
  exercises: Exercise[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private exerciseService: ExerciseClientService) {}

  ngOnInit(): void {
    this.subscriptions.push(this.exerciseService.list().subscribe(result => {
      this.exercises = result;
    }));
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
     subscription.unsubscribe();
    }
  }


}
