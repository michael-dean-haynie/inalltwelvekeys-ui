import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RawMidiComponent } from './raw-midi/raw-midi.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PianoComponent } from './piano/piano.component';

@NgModule({
  declarations: [
    AppComponent,
    RawMidiComponent,
    NotFoundComponent,
    PianoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
