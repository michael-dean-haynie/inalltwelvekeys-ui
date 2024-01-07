import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PianoComponent } from './components/piano/piano.component';
import { StaffComponent } from './components/staff/staff.component';
import { ExerciseComponent } from './components/exercise/exercise.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { ExerciseEditComponent } from './components/exercise-edit/exercise-edit.component';
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { NavComponent } from './components/nav/nav.component';
import { ChordDetectorComponent } from './components/chord-detector/chord-detector.component';
import { ToastComponent } from './components/toast/toast.component';
import { MidiTestComponent } from './components/midi-test/midi-test.component';
import { HistoryComponent } from './components/history/history.component';

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
    ChordDetectorComponent,
    ToastComponent,
    MidiTestComponent,
    HistoryComponent
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
