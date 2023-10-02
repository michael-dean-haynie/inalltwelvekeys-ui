import {Component, OnInit} from '@angular/core';
import {ExerciseService} from "../exercise.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Exercise} from "../models/api/exercise";
import {shuffleAlgo} from "../utilities/math-utilities";
import {WebsocketService} from "../websocket.service";

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss']
})
export class ExerciseComponent implements OnInit{
  private _exercise: Exercise | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id.length) {
        this.exerciseService.get(id).subscribe(exercise => {
          if (exercise) {
            this._exercise = exercise;
          }
          else {
            this.router.navigate(['/404'], { skipLocationChange: true});
          }
        });
      }
      else {
        this.router.navigate(['/404'], { skipLocationChange: true});
      }
    });

    this.websocketService.pianoKeysChangesSubject.subscribe(val => console.log(val))
  }

  get exercise(): Exercise {
    if (!this._exercise) {
      throw new Error();
    }
    return this._exercise;
  }

  shuffle(): void {
    this.exercise.iterations.sort(shuffleAlgo);
    console.log(this.exercise.iterations
        .map(itr => `${itr.noteLetter}${itr.accidental}`)
        .join(' '));
  }
}
