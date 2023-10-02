import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RawMidiComponent } from "./raw-midi/raw-midi.component";
import { PianoComponent } from "./piano/piano.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { StaveComponent } from "./stave/stave.component";
import {ExerciseComponent} from "./exercise/exercise.component";
import {ExercisesComponent} from "./exercises/exercises.component";
import {ExerciseEditComponent} from "./exercise-edit/exercise-edit.component";

const routes: Routes = [
  { path: 'exercise/edit/:id', component: ExerciseEditComponent },
  { path: 'exercise/edit', component: ExerciseEditComponent },
  { path: 'exercise/:id', component: ExerciseComponent },
  { path: 'exercise', redirectTo: 'exercises', pathMatch: 'full' },
  { path: 'exercises', component: ExercisesComponent },
  { path: 'raw', component: RawMidiComponent },
  { path: 'piano', component: PianoComponent },
  { path: 'stave', component: StaveComponent },
  { path: 'staff', redirectTo: 'stave', pathMatch: 'full' },
  { path: '', redirectTo: 'piano', pathMatch: 'full' },
  { path: '404', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
