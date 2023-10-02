import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RawMidiComponent } from './raw-midi/raw-midi.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PianoComponent } from './piano/piano.component';
import { StaveComponent } from './stave/stave.component';
import { ExerciseComponent } from './exercise/exercise.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { ExerciseEditComponent } from './exercise-edit/exercise-edit.component';
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    RawMidiComponent,
    NotFoundComponent,
    PianoComponent,
    StaveComponent,
    ExerciseComponent,
    ExercisesComponent,
    ExerciseEditComponent
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
