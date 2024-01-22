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
import { HistoryComponent } from './components/history/history.component'
import {DpDatePickerModule} from 'ng2-date-picker';
import {WaveformComponent} from "./components/waveform/waveform.component";
import {ExerciseDeetzComponent} from "./components/exercise-deetz/exercise-deetz.component";
import {TempDeetzComponent} from "./components/temp-deetz/temp-deetz.component";

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
    HistoryComponent,
    ExerciseDeetzComponent,
    TempDeetzComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    DpDatePickerModule,
    WaveformComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
