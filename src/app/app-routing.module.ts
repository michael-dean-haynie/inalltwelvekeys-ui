import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PianoComponent } from "./components/piano/piano.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import {ExerciseComponent} from "./components/exercise/exercise.component";
import {ExercisesComponent} from "./components/exercises/exercises.component";
import {ExerciseEditComponent} from "./components/exercise-edit/exercise-edit.component";
import {StaffComponent} from "./components/staff/staff.component";
import {MidiTestComponent} from "./components/midi-test/midi-test.component";

const routes: Routes = [
  { path: 'exercise/edit/:id', component: ExerciseEditComponent },
  { path: 'exercise/edit', component: ExerciseEditComponent },
  { path: 'exercise/:id', component: ExerciseComponent },
  { path: 'exercise', redirectTo: 'exercises', pathMatch: 'full' },
  { path: 'exercises', component: ExercisesComponent },
  { path: 'piano', component: PianoComponent },
  { path: 'staff', component: StaffComponent },
  { path: 'stave', redirectTo: 'staff', pathMatch: 'full' },
  { path: 'midi-test', component: MidiTestComponent },
  { path: '', redirectTo: 'piano', pathMatch: 'full' },
  { path: '404', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
