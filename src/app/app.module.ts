import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PianoComponent } from './piano/piano.component';
import { StaffComponent } from './staff/staff.component';
import { ExerciseComponent } from './exercise/exercise.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { ExerciseEditComponent } from './exercise-edit/exercise-edit.component';
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { NavComponent } from './nav/nav.component';
import { ChordDetectorComponent } from './chord-detector/chord-detector.component';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    PianoComponent,
    StaffComponent,
    ExerciseComponent,
    ExercisesComponent,
    ExerciseEditComponent,
    NavComponent,
    ChordDetectorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
